"use client";

import { useRef, useState, useEffect, useCallback, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  BookOpen, Brain, Calculator, FlaskConical, GraduationCap,
  Image as ImageIcon, Lightbulb, MessageSquarePlus, Paperclip,
  PanelLeftClose, PanelLeftOpen, Send, Sparkles, Target,
  Trash2, X, Square, Copy, Check, Zap,
} from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────────── */
interface AttachedFile { file: File; previewUrl: string; dataUrl: string; }
interface AppMessage {
  id: string; role: "user" | "assistant";
  content: string; imageUrls?: string[];
  toolName?: string; toolResult?: Record<string, unknown>;
}
interface ChatSession { id: string; title: string; createdAt: number; messages: AppMessage[]; }

/* ── Code Block with copy button ────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CodeBlock = ({ inline, className, children, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const language = match?.[1] ?? "";

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) return (
    <div className="code-scanline my-4 rounded-xl overflow-hidden flex flex-col"
      style={{ border: "1px solid rgba(200,255,0,0.12)", background: "#050505", width: "100%", maxWidth: "100%" }}>
      <div className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ background: "rgba(200,255,0,0.04)", borderBottom: "1px solid rgba(200,255,0,0.08)" }}>
        <div className="flex items-center gap-2">
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff3d6e" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ffb020" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#c8ff00" }} />
          <span className="text-xs font-mono uppercase tracking-wider ml-2"
            style={{ color: "rgba(200,255,0,0.5)", fontFamily: "var(--font-display), sans-serif" }}>
            {language}
          </span>
        </div>
        <button onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: copied ? "#c8ff00" : "rgba(255,255,255,0.35)" }}>
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="p-4 overflow-x-auto overflow-y-auto text-sm font-mono"
        style={{ maxHeight: 460, wordBreak: "normal", overflowWrap: "normal", color: "#d4d4d4" }}>
        <code className={className} style={{ whiteSpace: "pre" }} {...props}>{children}</code>
      </div>
    </div>
  );

  return (
    <code className="px-1.5 py-0.5 rounded text-sm"
      style={{ background: "rgba(200,255,0,0.07)", border: "1px solid rgba(200,255,0,0.15)", color: "#c8ff00",
        fontFamily: "'JetBrains Mono','Fira Code',monospace", wordBreak: "break-word" }} {...props}>
      {children}
    </code>
  );
};

/* ── Debounced Markdown ──────────────────────────────────────────────── */
const MdRenderer = memo(function MdRenderer({ content }: { content: string }) {
  const [rendered, setRendered] = useState(content);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => setRendered(content), 80);
    return () => { if (t.current) clearTimeout(t.current); };
  }, [content]);
  return (
    <div className="prose-grok">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock as any }}>
        {rendered}
      </ReactMarkdown>
    </div>
  );
});

/* ── Suggestions ─────────────────────────────────────────────────────── */
const SUGGESTIONS = [
  { icon: <Calculator size={13}/>, label: "Calculate (15 × 4 + 200) ÷ 3",  color: "#c8ff00" },
  { icon: <Brain size={13}/>,      label: "Explain Newton's laws of motion", color: "#00d4ff" },
  { icon: <Target size={13}/>,     label: "Quiz me on cell biology",         color: "#ff3d6e" },
  { icon: <BookOpen size={13}/>,   label: "Study tips for calculus",         color: "#ffb020" },
  { icon: <Lightbulb size={13}/>,  label: "What is spaced repetition?",      color: "#00d4ff" },
  { icon: <FlaskConical size={13}/>, label: "Explain DNA structure simply",  color: "#c8ff00" },
];

/* ── Tool Cards ──────────────────────────────────────────────────────── */
function ToolCard({ toolName, result }: { toolName: string; result: Record<string, unknown> }) {
  if (toolName === "calculate") return (
    <div className="tool-card" style={{ background:"rgba(200,255,0,0.04)", border:"1px solid rgba(200,255,0,0.15)" }}>
      <div className="tool-header" style={{ color:"#c8ff00", borderColor:"rgba(200,255,0,0.08)" }}>
        <Calculator size={12}/> Calculator
      </div>
      <div className="tool-body">
        {result?.success
          ? <div className="flex items-baseline gap-3 flex-wrap">
              <span style={{ color:"var(--text-2)", fontFamily:"monospace", fontSize:"0.875rem" }}>{String(result.expression)}</span>
              <span style={{ color:"var(--text-3)" }}>=</span>
              <span style={{ color:"#c8ff00", fontSize:"1.5rem", fontWeight:800, fontFamily:"monospace",
                textShadow:"0 0 20px rgba(200,255,0,0.5)" }}>{String(result.result)}</span>
            </div>
          : <span style={{ color:"#ff3d6e" }}>⚠ {String(result.error)}</span>
        }
      </div>
    </div>
  );
  if (toolName === "generate_quiz") return (
    <div className="tool-card" style={{ background:"rgba(255,176,32,0.04)", border:"1px solid rgba(255,176,32,0.15)" }}>
      <div className="tool-header" style={{ color:"#ffb020", borderColor:"rgba(255,176,32,0.08)" }}>
        <Target size={12}/> Quiz Generator
      </div>
      <div className="tool-body flex items-center gap-3">
        <p style={{ color:"var(--text)", fontSize:"0.875rem", fontWeight:500, margin:0 }}>
          {String(result.num_questions)} {String(result.difficulty)} questions on &ldquo;{String(result.topic)}&rdquo;
        </p>
        <div className="flex gap-1 ml-auto">
          {[1,2,3].map(i=><div key={i} className={`dot-${i}`} style={{ width:6,height:6,borderRadius:"50%",background:"#ffb020" }}/>)}
        </div>
      </div>
    </div>
  );
  if (toolName === "get_study_tips") return (
    <div className="tool-card" style={{ background:"rgba(0,212,255,0.04)", border:"1px solid rgba(0,212,255,0.15)" }}>
      <div className="tool-header" style={{ color:"var(--cyan)", borderColor:"rgba(0,212,255,0.08)" }}>
        <Lightbulb size={12}/> Study Tips — {String(result.subject)}
      </div>
      <div className="tool-body space-y-2">
        {Array.isArray(result.tips) && result.tips.map((tip, i) => (
          <div key={i} className="flex gap-2.5 items-start">
            <span style={{ color:"var(--cyan)", fontSize:"0.75rem", marginTop:"0.35rem", flexShrink:0 }}>▸</span>
            <p style={{ color:"var(--text)", fontSize:"0.875rem", lineHeight:1.65, margin:0 }}>{String(tip)}</p>
          </div>
        ))}
        {result.reminder && (
          <p style={{ color:"var(--text-2)", fontSize:"0.8125rem", fontStyle:"italic", marginTop:10, paddingTop:10,
            borderTop:"1px solid rgba(0,212,255,0.1)" }}>✦ {String(result.reminder)}</p>
        )}
      </div>
    </div>
  );
  return null;
}

/* ── Message ─────────────────────────────────────────────────────────── */
function Message({ msg, idx }: { msg: AppMessage; idx: number }) {
  const isUser = msg.role === "user";

  if (isUser) return (
    <div className="msg-user anim-up" style={{ animationDelay: `${Math.min(idx * 0.03, 0.2)}s` }}>
      <div style={{ maxWidth:"72%", display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
        {msg.imageUrls?.map((url, i) => (
          <div key={i} className="rounded-xl overflow-hidden"
            style={{ border:"1px solid rgba(200,255,0,0.2)", maxWidth:240,
              boxShadow:"0 0 20px rgba(200,255,0,0.06)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="attachment" className="max-w-full object-contain"/>
          </div>
        ))}
        {msg.content && (
          <div className="msg-user-bubble" style={{ width:"fit-content", maxWidth:"100%" }}>
            {msg.content}
          </div>
        )}
      </div>
      <div className="avatar-user">U</div>
    </div>
  );

  return (
    <div className="msg-bot-row anim-up" style={{ animationDelay: `${Math.min(idx * 0.03, 0.2)}s` }}>
      <div className="avatar-bot">🦉</div>
      <div style={{ flex:1, minWidth:0 }}>
        {msg.toolName && msg.toolResult && (
          <ToolCard toolName={msg.toolName} result={msg.toolResult}/>
        )}
        {msg.content ? (
          <div className="msg-bot-bubble" style={{ width:"100%", overflowX:"hidden" }}>
            <MdRenderer content={msg.content}/>
          </div>
        ) : !msg.toolName ? (
          <div className="msg-bot-bubble" style={{ display:"flex",alignItems:"center",gap:6,padding:"14px 18px" }}>
            <Zap size={13} style={{ color:"var(--lime)", opacity:0.7, animation:"pulse 1.5s ease-in-out infinite" }}/>
            <span style={{ fontSize:"0.8125rem",color:"var(--text-3)",marginRight:4,
              fontFamily:"var(--font-display),sans-serif", letterSpacing:"0.05em" }}>Processing</span>
            {[1,2,3].map(i => <div key={i} className={`dot-${i}`}
              style={{ width:5,height:5,borderRadius:"50%",background:"var(--lime)",opacity:0.7 }}/>)}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ── Typing Indicator ────────────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="msg-bot-row anim-fade">
      <div className="avatar-bot"><span className="anim-float">🦉</span></div>
      <div className="msg-bot-bubble" style={{ display:"flex",alignItems:"center",gap:8,padding:"12px 18px" }}>
        <Zap size={13} style={{ color:"var(--lime)", animation:"pulse 1.5s ease-in-out infinite" }}/>
        <span style={{ fontSize:"0.8125rem",color:"var(--text-3)",fontFamily:"var(--font-display),sans-serif",
          letterSpacing:"0.05em" }}>Thinking</span>
        {[1,2,3].map(i => <div key={i} className={`dot-${i}`}
          style={{ width:5,height:5,borderRadius:"50%",background:"var(--lime)" }}/>)}
      </div>
    </div>
  );
}

/* ── Welcome Screen ──────────────────────────────────────────────────── */
function WelcomeScreen({ onSuggest }: { onSuggest: (t: string) => void }) {
  return (
    <div className="welcome">
      {/* Logo */}
      <div className="relative mb-6">
        <div style={{
          width: 88, height: 88, borderRadius: 20,
          background: "linear-gradient(135deg, #0a0a0a, #141414)",
          border: "1px solid rgba(200,255,0,0.25)",
          boxShadow: "0 0 40px rgba(200,255,0,0.08), 0 0 80px rgba(200,255,0,0.04), 0 20px 60px rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem",
        }}>🦉</div>
        {/* Orbiting dot */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          width: 6, height: 6, borderRadius: "50%", background: "var(--lime)",
          boxShadow: "0 0 10px var(--lime)",
          animation: "orbit 3s linear infinite",
          transformOrigin: "0 0",
        }} />
      </div>

      <h1 style={{
        fontFamily: "var(--font-display), sans-serif",
        fontSize: "2.8rem", fontWeight: 800, letterSpacing: "-0.04em",
        margin: "0 0 4px", lineHeight: 1,
      }}>
        <span className="logo-text">ATHENA</span>
      </h1>
      <p style={{
        fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase",
        color: "var(--text-3)", marginBottom: 10,
        fontFamily: "var(--font-display), sans-serif", fontWeight: 500,
      }}>AI Learning Intelligence</p>
      <p style={{ color:"var(--text-2)", fontSize:"0.9375rem", maxWidth:400, lineHeight:1.75, marginBottom:36 }}>
        Ask anything, upload images, generate quizzes, and get personalized study strategies — powered by RAG + Gemini Vision.
      </p>

      {/* Feature badges */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {[
          { icon: <Brain size={11}/>,      label: "RAG Knowledge" },
          { icon: <ImageIcon size={11}/>,  label: "Vision AI" },
          { icon: <Target size={11}/>,     label: "Quiz Engine" },
          { icon: <Calculator size={11}/>, label: "Calculator" },
          { icon: <Sparkles size={11}/>,   label: "70B Model" },
        ].map(({ icon, label }) => (
          <span key={label} className="badge">{icon}{label}</span>
        ))}
      </div>

      <p style={{ fontSize:"0.6875rem", color:"var(--text-3)", letterSpacing:"0.14em",
        textTransform:"uppercase", marginBottom:12, fontFamily:"var(--font-display),sans-serif" }}>
        Try asking
      </p>
      <div className="flex flex-wrap justify-center gap-2" style={{ maxWidth:580 }}>
        {SUGGESTIONS.map(({ icon, label, color }, i) => (
          <button key={label} className="chip anim-up" style={{ animationDelay:`${0.06*i}s` }}
            onClick={() => onSuggest(label)}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = color}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-2)"}
          >
            <span style={{ color }}>{icon}</span>{label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Sidebar ─────────────────────────────────────────────────────────── */
function Sidebar({ sessions, activeId, onSelect, onNew, onDelete, collapsed, onClose }: {
  sessions: ChatSession[]; activeId: string;
  onSelect: (id: string) => void; onNew: () => void;
  onDelete: (id: string) => void; collapsed: boolean; onClose: () => void;
}) {
  const now = Date.now(), DAY = 86400000;
  const sorted = [...sessions].sort((a, b) => b.createdAt - a.createdAt);
  const groups = [
    { label: "Today",     items: sorted.filter(s => now-s.createdAt < DAY) },
    { label: "Yesterday", items: sorted.filter(s => now-s.createdAt >= DAY && now-s.createdAt < 2*DAY) },
    { label: "This Week", items: sorted.filter(s => now-s.createdAt >= 2*DAY && now-s.createdAt < 7*DAY) },
    { label: "Older",     items: sorted.filter(s => now-s.createdAt >= 7*DAY) },
  ].filter(g => g.items.length > 0);

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Header */}
      <div style={{ padding:"14px 12px 10px", borderBottom:"1px solid var(--border)", flexShrink:0 }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div style={{ width:30,height:30, borderRadius:8,
              background:"linear-gradient(135deg,#0f0f0f,#1a1a1a)",
              border:"1px solid rgba(200,255,0,0.25)",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.9rem" }}>🦉</div>
            <div>
              <div style={{ fontFamily:"var(--font-display),sans-serif", fontSize:"1rem",
                fontWeight:800, lineHeight:1, letterSpacing:"-0.02em" }}>
                <span className="logo-text">ATHENA</span>
              </div>
              <div style={{ fontSize:"0.6rem", color:"var(--text-3)", letterSpacing:"0.1em",
                textTransform:"uppercase", fontFamily:"var(--font-display),sans-serif" }}>
                AI Learning
              </div>
            </div>
          </div>
          <button className="icon-btn sm:hidden" onClick={onClose} style={{ display:"flex" }}>
            <X size={18}/>
          </button>
        </div>
        <button className="new-chat-btn" onClick={() => { onNew(); onClose(); }}>
          <MessageSquarePlus size={14}/><span>New Chat</span>
        </button>
      </div>

      {/* Chat list */}
      <div className="sidebar-scroll">
        {groups.length === 0 && (
          <p style={{ color:"var(--text-3)", fontSize:"0.8125rem", textAlign:"center",
            padding:"28px 10px", lineHeight:1.7, fontFamily:"var(--font-display),sans-serif" }}>
            No chats yet.<br/>Start a conversation!
          </p>
        )}
        {groups.map(({ label, items }) => (
          <div key={label}>
            <div className="date-group">{label}</div>
            {items.map(s => (
              <div key={s.id} className={`chat-item ${s.id === activeId ? "active" : ""}`}
                onClick={() => { onSelect(s.id); onClose(); }}>
                <MessageSquarePlus size={12} style={{ color:"var(--text-3)", flexShrink:0 }}/>
                <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                  fontSize:"0.8125rem", color: s.id === activeId ? "#c8ff00" : "var(--text-2)" }}>
                  {s.title}
                </span>
                <button className="delete-btn icon-btn" style={{ width:22, height:22, flexShrink:0 }}
                  onClick={e => { e.stopPropagation(); onDelete(s.id); }}>
                  <Trash2 size={11} style={{ color:"var(--text-3)" }}/>
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding:"10px 12px", borderTop:"1px solid var(--border)", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <GraduationCap size={11} style={{ color:"var(--text-3)" }}/>
          <span style={{ fontSize:"0.6875rem", color:"var(--text-3)",
            fontFamily:"var(--font-display),sans-serif", letterSpacing:"0.04em" }}>
            Groq · Gemini 2.5 · RAG
          </span>
        </div>
      </div>
    </aside>
  );
}

/* ── Build API messages ───────────────────────────────────────────────── */
function buildApiMessages(msgs: AppMessage[]) {
  return msgs.map(m => {
    if (m.imageUrls && m.imageUrls.length > 0) {
      const parts: unknown[] = [];
      if (m.content) parts.push({ type: "text", text: m.content });
      for (const url of m.imageUrls) parts.push({ type: "image", image: url });
      return { role: m.role, content: parts };
    }
    return { role: m.role, content: m.content };
  });
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════════ */
export default function Home() {
  const [sidebarOpen, setSidebarOpen]     = useState(true);
  const [sessions, setSessions]           = useState<ChatSession[]>([]);
  const [currentId, setCurrentId]         = useState<string>(() => `chat_${Date.now()}`);
  const [messages, setMessages]           = useState<AppMessage[]>([]);
  const [input, setInput]                 = useState("");
  const [isLoading, setIsLoading]         = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging]       = useState(false);
  const [hydrated, setHydrated]           = useState(false);

  const messagesEndRef    = useRef<HTMLDivElement>(null);
  const fileInputRef      = useRef<HTMLInputElement>(null);
  const textareaRef       = useRef<HTMLTextAreaElement>(null);
  const abortCtrlRef      = useRef<AbortController | null>(null);

  // Mobile: collapse sidebar by default
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) setSidebarOpen(false);
  }, []);

  // Load sessions
  useEffect(() => {
    try {
      const saved = localStorage.getItem("athena_sessions");
      if (saved) setSessions(JSON.parse(saved));
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  // Save sessions
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem("athena_sessions", JSON.stringify(sessions)); }
    catch { /* ignore */ }
  }, [sessions, hydrated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 180) + "px";
  }, [input]);

  const canSend = !isLoading && (input.trim().length > 0 || attachedFiles.length > 0);
  const activeSession = sessions.find(s => s.id === currentId) ?? null;

  const saveToSession = useCallback((id: string, msgs: AppMessage[]) => {
    setSessions(prev => {
      const exists = prev.find(s => s.id === id);
      const firstUser = msgs.find(m => m.role === "user");
      const raw = firstUser?.content?.slice(0, 42) || (firstUser?.imageUrls?.length ? "Image Chat" : "New Chat");
      const title = raw + (raw.length >= 42 ? "…" : "");
      if (exists) return prev.map(s => s.id === id ? { ...s, title, messages: msgs } : s);
      return [...prev, { id, title, createdAt: Date.now(), messages: msgs }];
    });
  }, []);

  const createNewChat = useCallback(() => {
    setCurrentId(`chat_${Date.now()}`);
    setMessages([]);
    setInput("");
  }, []);

  const selectSession = useCallback((id: string) => {
    const s = sessions.find(x => x.id === id);
    if (!s) return;
    setCurrentId(id);
    setMessages(s.messages);
  }, [sessions]);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentId === id) {
      const remaining = sessions.filter(s => s.id !== id);
      if (remaining.length > 0) { setCurrentId(remaining[remaining.length-1].id); setMessages(remaining[remaining.length-1].messages); }
      else createNewChat();
    }
  }, [currentId, sessions, createNewChat]);

  const processFile = (file: File): Promise<AttachedFile> =>
    new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) return reject(new Error("Images only"));
      const reader = new FileReader();
      reader.onload = e => { const d = e.target?.result as string; resolve({ file, previewUrl:d, dataUrl:d }); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const p = await Promise.all(Array.from(e.target.files ?? []).map(processFile));
    setAttachedFiles(prev => [...prev, ...p]);
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length) { const p = await Promise.all(files.map(processFile)); setAttachedFiles(prev => [...prev, ...p]); }
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const imageFiles: File[] = [];
    for (const item of Array.from(e.clipboardData?.items ?? [])) {
      if (item.type.startsWith("image/")) { const f = item.getAsFile(); if (f) imageFiles.push(f); }
    }
    if (imageFiles.length > 0) {
      e.preventDefault();
      const p = await Promise.all(imageFiles.map(processFile));
      setAttachedFiles(prev => [...prev, ...p]);
    }
  };

  const stopGeneration = useCallback(() => {
    abortCtrlRef.current?.abort();
    abortCtrlRef.current = null;
    setIsLoading(false);
  }, []);

  /* ── Main send function ────────────────────────────────────────────── */
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    const files = [...attachedFiles];
    if (!text && files.length === 0) return;
    if (isLoading) return;

    abortCtrlRef.current = new AbortController();
    setInput(""); setAttachedFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userMsg: AppMessage = {
      id: `u_${Date.now()}`, role: "user", content: text,
      imageUrls: files.map(f => f.dataUrl),
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    const assistantId = `a_${Date.now()}`;
    setMessages([...newMessages, { id: assistantId, role: "assistant", content: "" }]);

    let fullContent = "";
    let toolName: string | undefined;
    let toolResult: Record<string, unknown> | undefined;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: buildApiMessages(newMessages) }),
        signal: abortCtrlRef.current.signal,
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let lineBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (value) lineBuffer += decoder.decode(value, { stream: true });
        if (done) lineBuffer += decoder.decode();

        const lines = lineBuffer.split("\n");
        lineBuffer = done ? "" : (lines.pop() ?? "");

        for (const line of lines) {
          const t = line.trim();
          if (!t) continue;
          // 0: text delta
          if (t.startsWith("0:")) {
            try { fullContent += JSON.parse(t.slice(2)); } catch { /* skip */ }
          }
          // a: tool result (AI SDK 4 format)
          if (t.startsWith("a:")) {
            try {
              const d = JSON.parse(t.slice(2));
              if (d?.toolName) { toolName = d.toolName; toolResult = d.result; }
            } catch { /* skip */ }
          }
          // 9: tool result alternate format
          if (t.startsWith("9:")) {
            try {
              const arr = JSON.parse(t.slice(2));
              if (Array.isArray(arr)) {
                for (const item of arr) {
                  if (item?.toolName) { toolName = item.toolName; toolResult = item.result; }
                }
              }
            } catch { /* skip */ }
          }
          // 3: error message — show it
          if (t.startsWith("3:")) {
            try { fullContent += "\n\n⚠️ " + JSON.parse(t.slice(2)); } catch { /* skip */ }
          }
        }

        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: fullContent, toolName, toolResult } : m
        ));

        if (done) break;
      }

      if (!fullContent && !toolName) fullContent = "⚠️ No response received. Please try again.";

      const finalMessages = [...newMessages, { id: assistantId, role: "assistant" as const, content: fullContent, toolName, toolResult }];
      setMessages(finalMessages);
      saveToSession(currentId, finalMessages);

    } catch (err: unknown) {
      const isAbort = err instanceof Error && err.name === "AbortError";
      if (isAbort) {
        const stopped = fullContent ? fullContent + "\n\n*(Generation stopped)*" : "*(Generation stopped)*";
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: stopped } : m));
        saveToSession(currentId, [...newMessages, { id: assistantId, role: "assistant" as const, content: stopped }]);
      } else {
        const msg = err instanceof Error ? err.message : "Network error";
        const errContent = fullContent ? fullContent + `\n\n⚠️ ${msg}` : `⚠️ Error: ${msg}. Please try again.`;
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: errContent } : m));
      }
    } finally {
      setIsLoading(false);
      abortCtrlRef.current = null;
    }
  }, [input, attachedFiles, isLoading, messages, currentId, saveToSession]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="app-shell"
      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <Sidebar sessions={sessions} activeId={currentId} onSelect={selectSession}
        onNew={createNewChat} onDelete={deleteSession}
        collapsed={!sidebarOpen} onClose={() => setSidebarOpen(false)}/>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 sm:hidden"
          style={{ background:"rgba(0,0,0,0.7)", backdropFilter:"blur(4px)" }}
          onClick={() => setSidebarOpen(false)}/>
      )}

      <div className="chat-area mesh-bg">
        {/* Top bar */}
        <div className="topbar">
          <button className="icon-btn" onClick={() => setSidebarOpen(p => !p)}>
            {sidebarOpen ? <PanelLeftClose size={17}/> : <PanelLeftOpen size={17}/>}
          </button>
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <span style={{ fontFamily:"var(--font-display),sans-serif", fontSize:"1.1rem",
              fontWeight:800, letterSpacing:"-0.02em" }}>
              <span className="logo-text">ATHENA</span>
            </span>
            {activeSession && (
              <span style={{ color:"var(--text-3)", fontSize:"0.8125rem", overflow:"hidden",
                textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:280 }}>
                / {activeSession.title}
              </span>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            {[{icon:<Brain size={10}/>,label:"RAG"},{icon:<ImageIcon size={10}/>,label:"Vision"},{icon:<Sparkles size={10}/>,label:"Tools"}]
              .map(({ icon, label }) => <span key={label} className="badge">{icon}{label}</span>)}
          </div>
        </div>

        {/* Messages */}
        <div className="messages-scroll">
          <div className="messages-inner">
            {messages.length === 0
              ? <WelcomeScreen onSuggest={text => { setInput(text); textareaRef.current?.focus(); }}/>
              : <>
                  {messages.map((msg, i) => <Message key={msg.id} msg={msg} idx={i}/>)}
                  {isLoading && messages[messages.length-1]?.role === "user" && <TypingIndicator/>}
                  <div ref={messagesEndRef}/>
                </>
            }
          </div>
        </div>

        {/* Input area */}
        <div className="input-area">
          <div className="input-box">
            {/* Image previews */}
            {attachedFiles.length > 0 && (
              <div className="flex gap-2 mb-2 flex-wrap">
                {attachedFiles.map((af, i) => (
                  <div key={i} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={af.previewUrl} alt={af.file.name}
                      className="w-14 h-14 rounded-xl object-cover"
                      style={{ border:"1px solid rgba(200,255,0,0.2)" }}/>
                    <button onClick={() => setAttachedFiles(p => p.filter((_, j) => j !== i))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      style={{ background:"#ff3d6e", border:"1.5px solid var(--bg)" }}>
                      <X size={10} style={{ color:"#fff" }}/>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Quick chips */}
            {messages.length > 0 && messages.length <= 4 && (
              <div className="flex gap-1.5 mb-2 flex-wrap">
                {SUGGESTIONS.slice(0, 3).map(({ icon, label, color }) => (
                  <button key={label} className="chip" style={{ fontSize:"0.75rem", padding:"5px 10px" }}
                    onClick={() => { setInput(label); textareaRef.current?.focus(); }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = color}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-2)"}
                  ><span style={{ color }}>{icon}</span>{label}</button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="input-wrap">
              <button type="button" className="icon-btn" style={{ flexShrink:0 }}
                onClick={() => fileInputRef.current?.click()}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--lime)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-3)"}
                title="Attach image"><Paperclip size={16}/></button>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden"/>

              <textarea ref={textareaRef} className="input-textarea" value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown} onPaste={handlePaste}
                rows={1} placeholder="Ask Athena anything… or attach an image 📎"/>

              {isLoading ? (
                <button type="button" onClick={stopGeneration}
                  className="send-btn stop" title="Stop generation">
                  <Square size={13} fill="currentColor" style={{ color:"#fff" }}/>
                </button>
              ) : (
                <button type="button" onClick={sendMessage}
                  className={`send-btn ${canSend ? "active" : "inactive"}`} disabled={!canSend}>
                  <Send size={14} style={{ color: canSend ? "#000" : "var(--text-3)" }}/>
                </button>
              )}
            </div>

            {/* Footer note */}
            <p style={{ textAlign:"center", fontSize:"0.6875rem", color:"var(--text-3)", marginTop:8,
              display:"flex", alignItems:"center", justifyContent:"center", gap:6,
              fontFamily:"var(--font-display),sans-serif", letterSpacing:"0.04em" }}>
              <GraduationCap size={10} style={{ opacity:0.4 }}/>
              Powered by{" "}
              <span style={{ color:"var(--lime)", opacity:0.7 }}>Groq</span>
              {" · "}
              <span style={{ color:"var(--cyan)", opacity:0.7 }}>Gemini 2.5</span>
              {" · "}RAG
              <span style={{ opacity:0.35 }}> · Shift+Enter for new line</span>
            </p>
          </div>
        </div>
      </div>

      {/* Drag overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center anim-fade"
          style={{ background:"rgba(0,0,0,0.9)", backdropFilter:"blur(12px)" }}>
          <div className="flex flex-col items-center gap-4 p-12 rounded-2xl"
            style={{ border:"1px solid rgba(200,255,0,0.3)", background:"rgba(200,255,0,0.03)",
              boxShadow:"0 0 60px rgba(200,255,0,0.08)" }}>
            <ImageIcon size={40} style={{ color:"var(--lime)", filter:"drop-shadow(0 0 10px rgba(200,255,0,0.5))" }}/>
            <p style={{ fontFamily:"var(--font-display),sans-serif", fontSize:"1.1rem",
              fontWeight:700, color:"var(--lime)", letterSpacing:"-0.01em" }}>
              Drop image to analyze
            </p>
          </div>
        </div>
      )}
    </div>
  );
}