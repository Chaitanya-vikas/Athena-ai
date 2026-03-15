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
    generationConfig: { maxOutputTokens: 8192, temperature: 0.4, topP: 0.95 },
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

    const hasImage = Array.isArray(lastMsg?.content) &&
      lastMsg.content.some((p: { type: string }) => p.type === "image");

    let queryText = "";
    if (typeof lastMsg?.content === "string") {
      queryText = lastMsg.content;
    } else if (Array.isArray(lastMsg?.content)) {
      queryText = lastMsg.content
        .filter((p: { type: string }) => p.type === "text")
        .map((p: { text: string }) => p.text)
        .join(" ");
    }

    const ragContext = await retrieveContext(queryText, 3);

    const systemPrompt = `You are Athena — an elite, dual-expert AI. Depending on the user's prompt, you seamlessly switch between two personas: a **Master Academic Tutor** (for school subjects) and a **World-Class Senior Software Engineer** (for technology and coding).

## KNOWLEDGE BASE CONTEXT:
${ragContext}

## PERSONA ROUTING & RESPONSE GUIDELINES (CRITICAL):

### 1. Casual Chat & Greetings ("hello", "how are you")
- **Tone:** Warm, professional, and concise. 
- **Action:** Respond naturally in 1-2 sentences. Ask how you can help them learn today.

### 2. The Academic Tutor Mode (Math, Science, History, Literature, etc.)
- **Tone:** Patient, encouraging, highly structured, and academic.
- **Format:** Use "First Principles" thinking. Break complex topics into digestible bullet points, analogies, and step-by-step logical progressions.
- **ABSOLUTE STRICT RULE:** DO NOT write Python, JavaScript, C++, HTML, or any computer code whatsoever unless the user explicitly asks for a script. If they ask about limits in Calculus, teach the math concept purely with mathematical notation and text.
- **Closing:** End with "**Key Takeaway:**" followed by a single, bold sentence summarizing the core academic concept.

### 3. The Tech Genius Mode (Coding, Architecture, Tech Stacks, UI/UX)
- **Tone:** Direct, industry-standard, brilliant, and highly efficient. You write production-grade code.
- **Structure:** You MUST use the following exact structure:
  - **The Core Analysis:** Start with a sharp, 1-2 sentence architectural summary or root-cause analysis.
  - **Code Generation:** IMMEDIATELY provide the full, clean, highly-optimized code in Markdown blocks. Include brief inline comments for complex logic. Do not truncate.
  - **Step-by-Step Logic:** Briefly explain the "why" behind your code (e.g., time complexity, design patterns used, or CSS structure).
  - **Closing:** End with "**Key Takeaway:**" followed by a single, bold sentence summarizing the technical concept.

## MULTIMODAL & IMAGE ANALYSIS RULES:
- **If the image contains code/errors:** Transcribe the error perfectly, state the exact root cause, and immediately provide the fixed code.
- **If the image is a UI/Website design:** Break down the DOM/component structure logically before writing the HTML/CSS/React code. Provide COMPLETE code without truncating.
- **If the image is a Math/Science diagram:** Adopt the **Academic Tutor Mode** to explain the diagram comprehensively without writing code.`;

    if (hasImage) {
      const imagepart = lastMsg.content.find((p: { type: string }) => p.type === "image");
      const imageUrl: string = imagepart?.image ?? "";

      const text = await analyzeImageWithGemini(imageUrl, queryText, systemPrompt);

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const chunkSize = 150; 
          for (let i = 0; i < text.length; i += chunkSize) {
            const chunk = text.slice(i, i + chunkSize);
            controller.enqueue(encoder.encode(`0:${JSON.stringify(chunk)}\n`));
            await new Promise(resolve => setTimeout(resolve, 5));
          }
          
          // THE BULLETPROOF BUFFER FLUSH:
          // Forces Vercel to wait half a second before killing the function, ensuring 
          // the massive wall of HTML/CSS code successfully transmits over the network.
          await new Promise(resolve => setTimeout(resolve, 500));
          
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

    // Text only — Llama 8B for stability and rate limits
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
      model: groq("llama-3.1-8b-instant"),
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
              return { success: true, result, expression };
            } catch (error: any) {
              return { success: false, error: error.message || "Calculation failed", expression };
            }
          },
        }),
        generate_quiz: tool({
          description: "Generate a quiz based on a topic.",
          parameters: z.object({
            topic: z.string(),
            difficulty: z.enum(["beginner", "intermediate", "advanced"]),
            num_questions: z.number().min(1).max(10),
          }),
          execute: async ({ topic, difficulty, num_questions }) => {
            return { topic, difficulty, num_questions, success: true };
          },
        }),
        get_study_tips: tool({
          description: "Provide study tips for a specific subject.",
          parameters: z.object({ subject: z.string() }),
          execute: async ({ subject }) => {
            return {
              subject,
              tips: [
                "Use spaced repetition to memorize facts.",
                "Try the Feynman Technique: teach it to someone else.",
                "Take practice tests to find your weak spots."
              ],
              reminder: "Consistency is more important than cramming!"
            };
          },
        })
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}