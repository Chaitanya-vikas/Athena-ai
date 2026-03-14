# 🎓 EduBot — Multimodal AI Learning Assistant

A production-ready Ed-Tech chatbot built with **Next.js 15**, **Vercel AI SDK**, and **Groq** featuring:

- 🖼️ **Multimodal support** — chat with text or upload images (diagrams, textbook pages, handwritten problems)
- 🔍 **RAG (Retrieval-Augmented Generation)** — TF-IDF powered semantic search over a built-in Ed-Tech knowledge base
- 🛠️ **Tool Calling** — calculator, quiz generator, and personalized study tips
- ⚡ **Streaming responses** — real-time LLM output via Vercel AI SDK
- 🚀 **Vercel-ready** — one-click deploy

---

## 🌐 Live Demo

👉 **[your-app.vercel.app](https://your-app.vercel.app)** ← replace after deployment

---

## ✨ Features

| Feature | Details |
|---------|---------|
| **Text Chat** | Conversational Q&A across all academic subjects |
| **Image Analysis** | Upload images → Groq Vision model analyzes diagrams, equations, charts |
| **RAG Knowledge Base** | 20+ curated Ed-Tech documents: Study Techniques, Math, Biology, Chemistry, Physics, CS, History, Writing |
| **Calculator Tool** | Evaluates math expressions with step-by-step formatting |
| **Quiz Generator** | Creates 1-5 multiple choice questions, any topic, any difficulty |
| **Study Tips Tool** | Subject-specific, evidence-based learning strategies |
| **Drag & Drop Images** | Drop images anywhere on the page to attach them |
| **Keyboard shortcuts** | Enter to send, Shift+Enter for new line |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 15](https://nextjs.org) (App Router) |
| AI SDK | [Vercel AI SDK 4.x](https://sdk.vercel.ai) |
| LLM Provider | [Groq](https://groq.com) — `llama-3.2-11b-vision-instruct` |
| RAG | Custom TF-IDF cosine similarity (no external DB needed) |
| Styling | Tailwind CSS |
| Deployment | [Vercel](https://vercel.com) |

---

## 🚀 Quick Start (Local)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/edubot.git
cd edubot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Groq API key:

```env
GROQ_API_KEY=your_groq_api_key_here
```

> 🔑 Get a **free** Groq API key at [console.groq.com](https://console.groq.com)

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deploy to Vercel

### Option A: One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/edubot)

### Option B: Manual deploy via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option C: Connect GitHub repo

1. Push code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variable: `GROQ_API_KEY` = your key
5. Click **Deploy**

---

## 📁 Project Structure

```
edubot/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts        # 🔧 Chat API: RAG + Groq + Tool calling
│   ├── globals.css             # 🎨 Global styles + markdown prose
│   ├── layout.tsx              # 📐 Root layout with metadata
│   └── page.tsx                # 🖥️  Main chat UI (multimodal)
│
├── lib/
│   ├── knowledge-base.ts       # 📚 Ed-Tech RAG document corpus (20+ docs)
│   └── rag.ts                  # 🔍 TF-IDF retrieval engine
│
├── .env.example                # 🔑 Environment variable template
├── next.config.ts
├── tailwind.config.ts
└── README.md
```

---

## 🏗️ Architecture

```
User Message (text + optional image)
        │
        ▼
  app/api/chat/route.ts
        │
        ├─── 1. Extract query text from message parts
        │
        ├─── 2. RAG Retrieval (lib/rag.ts)
        │         └── TF-IDF cosine similarity
        │         └── Returns top-3 relevant KB documents
        │
        ├─── 3. Build system prompt with RAG context injected
        │
        ├─── 4. streamText() with Groq (llama-3.2-11b-vision-instruct)
        │         └── Supports text + image inputs
        │         └── Tool definitions: calculate, generate_quiz, get_study_tips
        │
        └─── 5. Stream response back to client
```

---

## 🎯 Demo Guide

### Text Query with RAG
1. Ask: *"What is spaced repetition and how do I use it?"*
   - EduBot retrieves the spaced repetition document from the knowledge base
   - Answers with specific context from the KB + general knowledge

### Image Analysis
1. Click the 📎 button (or drag & drop an image)
2. Upload a photo of a math problem, biology diagram, or equation
3. Ask: *"Explain this diagram"* or *"Solve this problem"*

### Quiz Generator
1. Type: *"Quiz me on Newton's laws of motion — 3 intermediate questions"*
2. EduBot calls the `generate_quiz` tool and creates a multiple-choice quiz

### Calculator
1. Type: *"What is (15 * 4 + 200) / (3^2)"*
2. EduBot calls the `calculate` tool and shows the result

### Study Tips
1. Type: *"I have an exam in physics next week and I struggle with circuits"*
2. EduBot calls `get_study_tips` with your subject and challenge

---

## 📚 Knowledge Base

The RAG system indexes **20+ documents** across these categories:

| Category | Topics |
|----------|--------|
| Study Techniques | Spaced Repetition, Active Recall, Feynman Technique, Pomodoro, Mind Mapping, Cornell Notes |
| Mathematics | Algebra, Calculus (Derivatives & Integrals), Statistics & Probability, Geometry |
| Biology | Cell Biology, DNA & Genetics |
| Chemistry | Atomic Structure & Periodic Table |
| Physics | Newton's Laws of Motion, Electricity & Circuits |
| Computer Science | Programming Fundamentals, Python Basics |
| History | World War II Overview |
| English & Writing | Essay Structure & Thesis Writing |

### Extending the knowledge base

To add more documents, edit `lib/knowledge-base.ts`:

```typescript
export const knowledgeBase: KBDocument[] = [
  // ... existing docs
  {
    id: "new-001",
    title: "Your New Topic",
    category: "Your Category",
    tags: ["tag1", "tag2", "keyword"],
    content: `Full text content of the document...`,
  },
];
```

The RAG engine automatically re-indexes on the next request.

---

## 🔒 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | ✅ Yes | Groq API key from [console.groq.com](https://console.groq.com) |

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

Built with ❤️ using [Next.js](https://nextjs.org), [Vercel AI SDK](https://sdk.vercel.ai), and [Groq](https://groq.com).
