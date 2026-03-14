import { createGroq } from "@ai-sdk/groq";
import { streamText, tool } from "ai";
import { z } from "zod";
import { retrieveContext } from "@/lib/rag";

export const maxDuration = 60;

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY! });

/* ── Gemini REST API directly (bypasses SDK version issues) ─────────────────── */
async function analyzeImageWithGemini(
  imageDataUrl: string,
  prompt: string,
  systemPrompt: string
): Promise<string> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  // Extract base64 from data URL
  const [header, base64Data] = imageDataUrl.split(",");
  const mimeType = header.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{
      role: "user",
      parts: [
        { text: prompt || "Please analyze this image in detail and write any necessary code." },
        { inline_data: { mime_type: mimeType, data: base64Data } },
      ],
    }],
    generationConfig: { maxOutputTokens: 8192, temperature: 0.2 },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response from Gemini.";
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1];

    // Detect image in content array
    const hasImage = Array.isArray(lastMsg?.content) &&
      lastMsg.content.some((p: { type: string }) => p.type === "image");

    // Extract text
    let queryText = "";
    if (typeof lastMsg?.content === "string") {
      queryText = lastMsg.content;
    } else if (Array.isArray(lastMsg?.content)) {
      queryText = lastMsg.content
        .filter((p: { type: string }) => p.type === "text")
        .map((p: { text: string }) => p.text)
        .join(" ");
    }

    console.log("hasImage:", hasImage, "queryText:", queryText.slice(0, 50));

    const ragContext = await retrieveContext(queryText, 3);

    // ─── UPDATED PROMPT: Forces code to be written FIRST ───────────────────
    const systemPrompt = `You are Athena — a world-class AI programming and educational tutor.

## KNOWLEDGE BASE CONTEXT:
${ragContext}

## RESPONSE GUIDELINES (CRITICAL):

1. **For simple greetings or casual chat (e.g., "hello", "how are you"):**
   - Be a normal, warm tutor. Respond naturally in 1-2 sentences. 
   - DO NOT use the structured format below. DO NOT generate code unless asked.

2. **For educational questions, coding tasks, or image analysis, you MUST use this structure:**
   - **The Core Analysis:** Start with a clear, 1-2 sentence summary of the concept or solution.
   - **Code Generation:** If requested, provide full, clean code in Markdown blocks immediately.
   - **Step-by-Step Logic:** Briefly explain your thought process or math steps.
   - **Key Takeaway:** End with "**Key Takeaway:**" followed by one bold sentence summarizing the concept.

## IMAGE ANALYSIS RULES:
- If the image contains code, transcribe it perfectly first, then explain or fix it.
- If the image is a UI/Website design, break down the component structure before writing code.
- If the image is an error message, state the root cause clearly before providing the fix.`;
    if (hasImage) {
      console.log("Using Gemini REST API directly for vision");

      // Get the image from the content array
      const imagepart = lastMsg.content.find((p: { type: string }) => p.type === "image");
      const imageUrl: string = imagepart?.image ?? "";

      const text = await analyzeImageWithGemini(imageUrl, queryText, systemPrompt);
      console.log("Gemini response length:", text.length);

     // Return as a simple AI SDK compatible stream
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        // THE FIX 1: Make this start function 'async'
        async start(controller) { 
          const chunkSize = 200;
          for (let i = 0; i < text.length; i += chunkSize) {
            const chunk = text.slice(i, i + chunkSize);
            controller.enqueue(encoder.encode(`0:${JSON.stringify(chunk)}\n`));
            
            // THE FIX 2: A microscopic delay forces Vercel to flush the network packets 
            // before the serverless function shuts down!
            await new Promise(resolve => setTimeout(resolve, 5));
          }
          
          // End of stream markers
          controller.enqueue(encoder.encode(`d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n`));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Vercel-AI-Data-Stream": "v1",
        },
      });
    }

    // Text only — Groq with tools
    console.log("Using Groq 70B");

    // Strip images out of the chat history so the text-only model doesn't crash!
    const textOnlyMessages = messages.map((msg: any) => {
      if (Array.isArray(msg.content)) {
        const textContent = msg.content
          .filter((p: any) => p.type === "text")
          .map((p: any) => p.text)
          .join("\n");
        return { ...msg, content: textContent };
      }
      return msg;
    });

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages: textOnlyMessages,
      maxTokens: 8192,
      tools: {
        calculate: tool({
          description: "Evaluate a mathematical expression.",
          parameters: z.object({ expression: z.string() }),
          execute: async ({ expression }) => {
            try {
              const safe = expression.replace(/[^0-9+\-*/().,%^\sMath\w]/g, "").trim();
              // eslint-disable-next-line no-new-func
              const result = Function('"use strict"; const Math = globalThis.Math; return (' + safe + ")")();
              if (typeof result !== "number" || !isFinite(result)) return { success: false, error: "Invalid", expression };
              return { success: true, expression, result: Number.isInteger(result) ? result : parseFloat(result.toFixed(8)) };
            } catch { return { success: false, error: "Parse error", expression }; }
          },
        }),
        generate_quiz: tool({
          description: "Generate a multiple-choice quiz.",
          parameters: z.object({ topic: z.string(), difficulty: z.enum(["beginner","intermediate","advanced"]), num_questions: z.number().min(1).max(5) }),
          execute: async ({ topic, difficulty, num_questions }) => ({ status:"generating", topic, difficulty, num_questions, instruction: `Generate ${num_questions} ${difficulty}-level MCQs about "${topic}".` }),
        }),
        get_study_tips: tool({
          description: "Provide study tips for a subject.",
          parameters: z.object({ subject: z.string(), challenge: z.string().optional() }),
          execute: async ({ subject, challenge }) => {
            const s = subject.toLowerCase();
            const db: Record<string,string[]> = {
              math: ["Work 10+ practice problems per topic","Keep an error log","Struggle 5 mins before checking solutions","Write formulas from memory"],
              physics: ["Draw free-body diagrams first","Identify knowns, unknowns, equation","Use dimensional analysis"],
              chemistry: ["Memorize polyatomic ions first","Balance equations daily","Start stoichiometry with balanced equation"],
              biology: ["Draw diagrams from memory","Learn roots: cyto=cell, phago=eat","Narrate processes as stories"],
              programming: ["Code daily — 20 mins compounds fast","Build projects immediately","Read errors word by word"],
              history: ["Build cause-effect chains","Create cross-region timelines","Ask why and what changed"],
            };
            const key = Object.keys(db).find(k=>s.includes(k)) ?? "default";
            const tips = db[key] ?? ["Spaced repetition: 1→3→7→30 days","Active recall: test yourself","Feynman: explain to a 12-year-old","Pomodoro: 25-min blocks"];
            return { subject, challenge: challenge ?? "general", tips, reminder: "30 min daily beats 3-hour cramming." };
          },
        }),
      },
      maxSteps: 3,
    });
    return result.toDataStreamResponse();

  } catch (error) {
    console.error("=== Athena Error ===", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}