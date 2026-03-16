import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { retrieveContext } from "@/lib/rag";

export const maxDuration = 60;

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY! });

/* ── Trim chat history to avoid token exhaustion ────────────────────── */
function trimMessages(messages: { role: string; content: unknown }[], max = 10) {
  if (messages.length <= max) return messages;
  console.log(`[Athena] Trimming: ${messages.length} → ${max} messages`);
  return messages.slice(messages.length - max);
}

/* ── Gemini 2.5 Flash via direct REST API ───────────────────────────── */
async function callGemini(imageDataUrl: string, prompt: string, systemPrompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY not set");
  const [header, base64Data] = imageDataUrl.split(",");
  const mimeType = header.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [
          { text: prompt || "Analyze this image in detail." },
          { inline_data: { mime_type: mimeType, data: base64Data } },
        ]}],
        generationConfig: { maxOutputTokens: 8192, temperature: 0.4 },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned empty response");
  return text;
}

/* ── Stream plain text in AI SDK format ─────────────────────────────── */
function textToStream(text: string): Response {
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(ctrl) {
      for (let i = 0; i < text.length; i += 80) {
        ctrl.enqueue(enc.encode(`0:${JSON.stringify(text.slice(i, i + 80))}\n`));
        await new Promise(r => setTimeout(r, 4));
      }
      ctrl.enqueue(enc.encode(`d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n`));
      ctrl.close();
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Vercel-AI-Data-Stream": "v1" },
  });
}

/* ── Stream a tool result + AI explanation together ─────────────────── */
function toolResultToStream(toolName: string, result: Record<string, unknown>, explanation: string): Response {
  // Tool result format: a: line, then text
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(ctrl) {
      // Emit tool result in AI SDK format
      const toolPayload = JSON.stringify({ toolName, result });
      ctrl.enqueue(enc.encode(`a:${toolPayload}\n`));
      await new Promise(r => setTimeout(r, 10));
      // Emit the explanation text
      for (let i = 0; i < explanation.length; i += 80) {
        ctrl.enqueue(enc.encode(`0:${JSON.stringify(explanation.slice(i, i + 80))}\n`));
        await new Promise(r => setTimeout(r, 4));
      }
      ctrl.enqueue(enc.encode(`d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n`));
      ctrl.close();
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Vercel-AI-Data-Stream": "v1" },
  });
}

/* ── Manual tool detection — we decide, not the model ───────────────── */
type ToolResult =
  | { tool: "calculate"; expression: string; result: number | null; error?: string }
  | { tool: "quiz"; topic: string; difficulty: string; num: number }
  | { tool: "study_tips"; subject: string }
  | null;

function detectTool(text: string): ToolResult {
  const t = text.toLowerCase().trim();

  // Calculator: "calculate X", "compute X", "what is X" with math symbols
  const calcPatterns = [
    /^(?:calculate|compute|eval(?:uate)?|solve|what(?:'s| is))\s+(.+)/i,
    /^(.+[+\-*/^%].+)$/, // expression with operators
  ];
  for (const pat of calcPatterns) {
    const m = text.match(pat);
    if (m) {
      const expr = m[1]?.trim() ?? text;
      // Only if it looks like math (has numbers and operators)
      if (/\d/.test(expr) && /[+\-*/^%()]/.test(expr)) {
        try {
          const safe = expr.replace(/[^0-9+\-*/().,%^\sMath\w]/g, "").trim();
          // eslint-disable-next-line no-new-func
          const val = Function('"use strict"; const Math=globalThis.Math; return (' + safe + ")")();
          if (typeof val === "number" && isFinite(val))
            return { tool: "calculate", expression: expr, result: val };
        } catch {
          return { tool: "calculate", expression: expr, result: null, error: "Could not evaluate" };
        }
      }
    }
  }

  // Quiz: "quiz me on X", "test me on X", "generate quiz about X"
  const quizMatch = t.match(/(?:quiz|test)\s+(?:me\s+)?(?:on|about)\s+(.+)/);
  if (quizMatch) {
    const topic = quizMatch[1].replace(/\s*\d+\s*questions?/i, "").trim();
    const diffMatch = t.match(/\b(beginner|intermediate|advanced|easy|medium|hard)\b/);
    const numMatch = t.match(/(\d+)\s*questions?/);
    const diffMap: Record<string, string> = { easy: "beginner", medium: "intermediate", hard: "advanced" };
    const diff = diffMatch ? (diffMap[diffMatch[1]] ?? diffMatch[1]) : "intermediate";
    return { tool: "quiz", topic, difficulty: diff, num: numMatch ? parseInt(numMatch[1]) : 5 };
  }

  // Study tips: "study tips for X", "how to study X", "tips to learn X"
  const tipsMatch = t.match(/(?:study tips?|how to study|tips? (?:to|for) (?:learn|study)|help me (?:learn|study))\s+(?:for\s+)?(.+)/);
  if (tipsMatch) {
    return { tool: "study_tips", subject: tipsMatch[1].trim() };
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1];

    // Detect image
    const hasImage = Array.isArray(lastMsg?.content) &&
      lastMsg.content.some((p: { type: string }) => p.type === "image");

    // Extract text
    let queryText = "";
    if (typeof lastMsg?.content === "string") {
      queryText = lastMsg.content;
    } else if (Array.isArray(lastMsg?.content)) {
      queryText = lastMsg.content
        .filter((p: { type: string }) => p.type === "text")
        .map((p: { text: string }) => p.text).join(" ");
    }

    console.log(`[Athena] hasImage:${hasImage} msgs:${messages.length} query:"${queryText.slice(0,60)}"`);

    const ragContext = await retrieveContext(queryText, 3);

    const systemPrompt = `You are Athena — an elite AI with two modes: a world-class Academic Professor and a Senior Software Engineer.

## KNOWLEDGE BASE:
${ragContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎓 PROFESSOR MODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USE FOR: math, science, history, literature, biology, physics, chemistry, study help.

You are a patient, brilliant professor who makes complex ideas feel exciting.

FORMAT:
1. **Hook** — One bold insight to grab attention
2. **Core Concept** — Explain "why" before "what", use a real-world analogy
3. **Breakdown** — Numbered steps, clear explanations
4. **Example** — One concrete example
5. **Common Pitfalls** — 1-2 mistakes students make (if relevant)
6. **Key Takeaway:** [one powerful sentence]

RULES: Warm tone. Use ## headers, bullet points, numbered lists. Bold key terms. NO code unless asked.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💻 ENGINEER MODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USE FOR: coding, programming, debugging, algorithms, system design.

You are a senior engineer — direct, writing production-grade code.

FORMAT:
1. **The Core Analysis** — 1-2 sentences: optimal approach + Big O if relevant
2. **Complete Code** — Full working code in fenced \`\`\`language block. NEVER truncate. Add inline comments.
3. **How It Works** — Numbered explanation of key logic
4. **Edge Cases** — What to watch out for (if relevant)
5. **Key Takeaway:** [one sentence on the core technique]

RULES: Direct, no fluff. Always fenced code blocks with language. Never cut code.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 CONVERSATIONAL MODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USE FOR: hi, hello, greetings. Respond warmly in 1-3 sentences.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🖼️ IMAGE ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Code/error: exact error → root cause → complete fixed code
- UI/design: layout analysis → complete HTML/CSS/React (never truncate)
- Math/diagram: Professor Mode
- General: rich educational description`;

    // ── IMAGE → Gemini 2.5 Flash ──────────────────────────────────────
    if (hasImage) {
      console.log("[Athena] → Gemini vision");
      const imgPart = lastMsg.content.find((p: { type: string }) => p.type === "image");
      if (!imgPart?.image) throw new Error("No image data found");
      const text = await callGemini(imgPart.image, queryText, systemPrompt);
      return textToStream(text);
    }

    // ── TOOL DETECTION — manual, reliable ────────────────────────────
    const detectedTool = detectTool(queryText);

    if (detectedTool?.tool === "calculate") {
      console.log("[Athena] → Tool: calculate");
      const result = {
        expression: detectedTool.expression,
        result: detectedTool.result,
        success: detectedTool.result !== null,
        error: detectedTool.error,
      };
      const explanation = detectedTool.result !== null
        ? `**${detectedTool.expression} = ${detectedTool.result}**\n\n**Key Takeaway:** The expression evaluates to ${detectedTool.result}.`
        : `⚠️ Could not evaluate: ${detectedTool.error}`;
      return toolResultToStream("calculate", result, explanation);
    }

    if (detectedTool?.tool === "quiz") {
      console.log("[Athena] → Tool: generate_quiz");
      const result = {
        topic: detectedTool.topic,
        difficulty: detectedTool.difficulty,
        num_questions: detectedTool.num,
        success: true,
      };
      // Let Groq generate the actual quiz content
      const quizPrompt = `Generate ${detectedTool.num} ${detectedTool.difficulty}-level multiple-choice questions about "${detectedTool.topic}". 
For each question: write it clearly, provide 4 options labeled A–D, mark the correct answer with ✓, and give a one-sentence explanation.
Format each question with a clear number and spacing.`;

      const trimmedForQuiz = trimMessages(
        [{ role: "user" as const, content: quizPrompt }], 1
      );

      const quizResult = streamText({
        model: groq("llama-3.3-70b-versatile"),
        system: systemPrompt,
        messages: trimmedForQuiz,
        maxTokens: 4096,
      });

      // Prepend tool result to stream
      const enc = new TextEncoder();
      const toolLine = enc.encode(`a:${JSON.stringify({ toolName: "generate_quiz", result })}\n`);
      const quizStream = await quizResult.toDataStreamResponse();
      const reader = quizStream.body!.getReader();

      const stream = new ReadableStream({
        async start(ctrl) {
          ctrl.enqueue(toolLine);
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            ctrl.enqueue(value);
          }
          ctrl.close();
        },
      });
      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8", "X-Vercel-AI-Data-Stream": "v1" },
      });
    }

    if (detectedTool?.tool === "study_tips") {
      console.log("[Athena] → Tool: study_tips");
      const tips = [
        "Spaced repetition: review after 1 → 3 → 7 → 30 days",
        "Active recall: test yourself instead of re-reading",
        "Feynman Technique: explain as if teaching a 12-year-old",
        "Pomodoro: 25-min focused blocks with 5-min breaks",
        "Sleep 7–9 hours — memory consolidation happens during sleep",
      ];
      const result = { subject: detectedTool.subject, tips, reminder: "30 min daily beats 3-hour cramming.", success: true };
      const explanation = `Here are evidence-based study tips for **${detectedTool.subject}**:\n\n${tips.map(t => `• ${t}`).join("\n")}\n\n**Key Takeaway:** Consistency and active learning always outperform passive re-reading.`;
      return toolResultToStream("get_study_tips", result, explanation);
    }

    // ── REGULAR TEXT → Groq ───────────────────────────────────────────
    console.log("[Athena] → Groq text");
    const textMessages = messages.map((msg: { role: string; content: unknown }) => {
      if (Array.isArray(msg.content)) {
        const t = (msg.content as { type: string; text?: string }[])
          .filter(p => p.type === "text").map(p => p.text ?? "").join("\n").trim();
        return { ...msg, content: t || "(image)" };
      }
      return msg;
    });

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages: trimMessages(textMessages, 10),
      maxTokens: 4096,
    });

    return result.toDataStreamResponse();

  } catch (error) {
    console.error("[Athena] ERROR:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return textToStream(`⚠️ **Error:** ${msg}\n\nPlease try again. If this persists, wait 1 minute (API rate limit may have been hit).`);
  }
}