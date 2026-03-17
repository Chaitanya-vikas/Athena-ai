# 🦉 Athena: Multimodal AI Learning Intelligence

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel-AI_SDK-black?style=flat&logo=vercel)](https://sdk.vercel.ai/)
[![Groq](https://img.shields.io/badge/Groq-Llama_3.3-f55036?style=flat)](https://groq.com/)

**🚀 Live Deployment:** [👉 View the live application on Vercel here](https://athena-ai-sandy.vercel.app)
Athena is a production-ready, multimodal educational chatbot. Developed as a submission for the **Multimodal Chatbot with RAG** assessment, it is specifically tailored to the **Ed-Tech domain** to assist students with complex problem-solving, math evaluations, and contextual study techniques.

---

## 💻 Tech Stack & Tooling

I intentionally selected a modern, high-performance stack optimized for serverless edge deployment and real-time streaming.

| Category | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Next.js 15 (App Router), Tailwind CSS, Custom CSS Mesh Gradients, Lucide Icons |
| **Backend** | Next.js API Routes (Serverless), TypeScript |
| **AI Orchestration**| Vercel AI SDK (Core & React), custom REST integrations |
| **LLMs** | **Groq** (`llama-3.3-70b-versatile`) for text/tools, **Gemini** (`gemini-2.5-flash`) for vision |
| **RAG Engine** | Custom-built **TF-IDF Semantic Search** (Zero external vector DB dependencies) |
| **Deployment** | Vercel |

---

## 📋 Assignment Requirements Achieved

This project fulfills and exceeds all core and optional requirements of the assessment:

- ✅ **Multimodal Inputs (Text & Image):** Supports conversational Q&A and image analysis (e.g., uploading math problems, textbook diagrams, or UI screenshots).
- ✅ **Retrieval-Augmented Generation (RAG):** Implements a custom-built, in-memory TF-IDF semantic search engine to ground the AI in a curated Ed-Tech knowledge base.
- ✅ **Tool Calling (Optional):** The AI can dynamically invoke tools for specific actions: `calculate` (math evaluation), `generate_quiz` (topic-based MCQs), and `get_study_tips`.
- ✅ **Generative UI (Optional):** Intercepts tool-calling streams to render beautiful, interactive React components (Tool Cards) directly in the chat UI.
- ✅ **Ed-Tech Domain:** System prompts and knowledge bases are fine-tuned for educational assistance.

---

## 🧠 System Architecture: "Split-Brain" Routing

To provide the highest quality responses while avoiding standard framework payload limitations (like Next.js 4MB payload limits) and LLM token timeouts, Athena utilizes a dynamic, custom-engineered routing architecture:

1. **The Text & Tool Path (Groq):** Text-only queries are routed through the **Vercel AI SDK** to Groq. This ensures lightning-fast reasoning, RAG context injection, and highly structured tool calling.
2. **The Vision Path (Gemini):** Image queries bypass standard SDK wrappers to prevent memory crashes. Images are compressed client-side via a native HTML5 `<canvas>`, converted to Base64, and sent via a direct REST integration to Google Gemini. The server then perfectly mimics the Vercel AI SDK stream format (`0:"chunk"\n`) to pipe the response back to the frontend UI.
3. **History Sanitization:** Multi-turn conversations are automatically sanitized. When switching from an image prompt to a text prompt, previous Base64 image data is stripped from the context window to prevent text-only models (Groq) from crashing.

---

## 🚀 Local Setup Instructions

Follow these steps to run Athena on your local machine.

### 1. Clone the repository
```bash
git clone https://github.com/Chaitanya-vikas/Athena-ai
cd athena-edubot
```

### 2. Install dependencies
```bash
npm install
```
```
### 3. Configure Environment Variables
Create a \`.env.local\` file in the root directory and add your API keys:
env
```
# Get your free key at: https://console.groq.com/
GROQ_API_KEY=your_groq_api_key_here

# Get your free key at: https://aistudio.google.com/
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
\`\`\`

### 4. Run the development server
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:3000](http://localhost:3000) in your browser to start chatting!

---

## 🎯 Evaluation Guide (How to test)

To fully evaluate the chatbot's capabilities, try the following prompts:

**1. RAG (Context Retrieval)**
* **Prompt:** *"What is the Pomodoro technique and how do I use it?"*
* **Expected:** Athena will retrieve the exact intervals and rules from the local knowledge base (`lib/knowledge-base.ts`).

**2. Vision (Multimodal & Client-Side Compression)**
* **Action:** Click the 📎 paperclip icon to upload an image of a math equation, diagram, or UI layout.
* **Prompt:** *"Please analyze this image in detail."*
* **Expected:** The image is compressed on the client, analyzed by Gemini 2.5 Flash, and streams back a structured Markdown response.

**3. Generative UI & Tool Calling**
* **Prompt:** *"Calculate (15 * 4 + 200) / 3"*
  * **Expected:** Renders a custom purple Calculator UI widget.
* **Prompt:** *"Generate a beginner quiz on cell biology."*
  * **Expected:** Renders a custom gold Quiz Generator UI widget.

---
*Developed by Chaitanya Vikas for the AI Ready School Assessment.*