"use client";

import { useRef, useState, useEffect, useCallback, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  BookOpen, Brain, Calculator, FlaskConical, GraduationCap,
  Image as ImageIcon, Lightbulb, MessageSquarePlus, Paperclip,
  PanelLeftClose, PanelLeftOpen, Send, Sparkles, Target,
  Trash2, X, Zap,
} from "lucide-react";

/* ── Types ───────────────────────────────────────────────────────────────────── */
interface AttachedFile { file: File; previewUrl: string; dataUrl: string; }

interface AppMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrls?: string[]; // for display only
  toolName?: string;
  toolResult?: Record<string, unknown>;
}

interface ChatSession {
  id: string; title: string; createdAt: number;
  messages: AppMessage[];
}

/* ── Debounced Markdown ──────────────────────────────────────────────────────── */
const MdRenderer = memo(function MdRenderer({ content }: { content: string }) {
  const [rendered, setRendered] = useState(content);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => setRendered(content), 80);
    return () => { if (t.current) clearTimeout(t.current); };
  }, [content]);
  return <div className="prose-grok"><ReactMarkdown remarkPlugins={[remarkGfm]}>{rendered}</ReactMarkdown></div>;
});

/* ── Suggestions ─────────────────────────────────────────────────────────────── */
const SUGGESTIONS = [
  { icon: <Calculator size={13} />, label: "Calculate (15 × 4 + 200) ÷ 3",  color: "#8b5cf6" },
  { icon: <Brain size={13} />,      label: "Explain Newton's laws of motion", color: "#2dd4bf" },
  { icon: <Target size={13} />,     label: "Quiz me on cell biology",         color: "#f0c040" },
  { icon: <BookOpen size={13} />,   label: "Study tips for calculus",         color: "#f472b6" },
  { icon: <Lightbulb size={13} />,  label: "What is spaced repetition?",      color: "#2dd4bf" },
  { icon: <FlaskConical size={13}/>, label: "Explain DNA structure simply",   color: "#8b5cf6" },
];

/* ── Tool Cards ──────────────────────────────────────────────────────────────── */
function ToolCard({ toolName, result }: { toolName: string; result: Record<string, unknown> }) {
  if (toolName === "calculate") return (
    <div className="tool-card" style={{ background:"rgba(139,92,246,0.07)", border:"1px solid rgba(139,92,246,0.2)" }}>
      <div className="tool-header" style={{ color:"#a78bfa", borderColor:"rgba(139,92,246,0.15)" }}><Calculator size={12}/> Calculator</div>
      <div className="tool-body">
        {result?.success
          ? <div className="flex items-baseline gap-3 flex-wrap">
              <span style={{ color:"var(--text-2)", fontFamily:"monospace", fontSize:"0.875rem" }}>{String(result.expression)}</span>
              <span style={{ color:"var(--text-3)" }}>=</span>
              <span style={{ color:"var(--gold)", fontSize:"1.5rem", fontWeight:700, fontFamily:"monospace" }}>{String(result.result)}</span>
            </div>
          : <span style={{ color:"#f87171" }}>⚠ {String(result.error)}</span>}
      </div>
    </div>
  );
  if (toolName === "generate_quiz") return (
    <div className="tool-card" style={{ background:"rgba(240,192,64,0.06)", border:"1px solid rgba(240,192,64,0.18)" }}>
      <div className="tool-header" style={{ color:"var(--gold)", borderColor:"rgba(240,192,64,0.12)" }}><Target size={12}/> Quiz Generator</div>
      <div className="tool-body flex items-center gap-3">
        <p style={{ color:"var(--text)", fontSize:"0.875rem", fontWeight:500, margin:0 }}>
          {String(result.num_questions)} {String(result.difficulty)} questions on &ldquo;{String(result.topic)}&rdquo;
        </p>
        <div className="flex gap-1 ml-auto">{[1,2,3].map(i=><div key={i} className={`dot-${i}`} style={{ width:6,height:6,borderRadius:"50%",background:"var(--gold)" }}/>)}</div>
      </div>
    </div>
  );
  if (toolName === "get_study_tips") return (
    <div className="tool-card" style={{ background:"rgba(45,212,191,0.06)", border:"1px solid rgba(45,212,191,0.18)" }}>
      <div className="tool-header" style={{ color:"var(--teal)", borderColor:"rgba(45,212,191,0.12)" }}><Lightbulb size={12}/> Study Tips — {String(result.subject)}</div>
      <div className="tool-body space-y-2">
        {Array.isArray(result.tips) && result.tips.map((tip,i)=>(
          <div key={i} className="flex gap-2.5 items-start">
            <span style={{ color:"var(--teal)",fontSize:"0.75rem",marginTop:"0.3rem",flexShrink:0 }}>◆</span>
            <p style={{ color:"var(--text)",fontSize:"0.875rem",lineHeight:1.6,margin:0 }}>{String(tip)}</p>
          </div>
        ))}
        {result.reminder && <p style={{ color:"var(--text-2)",fontSize:"0.8125rem",fontStyle:"italic",marginTop:10,paddingTop:10,borderTop:"1px solid rgba(45,212,191,0.1)" }}>✦ {String(result.reminder)}</p>}
      </div>
    </div>
  );
  return null;
}

/* ── Message ─────────────────────────────────────────────────────────────────── */
function Message({ msg }: { msg: AppMessage }) {
  const isUser = msg.role === "user";

  if (isUser) return (
    <div className="msg-user anim-up">
      <div style={{ maxWidth:"72%", display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
        {msg.imageUrls?.map((url,i) => (
          <div key={i} className="rounded-xl overflow-hidden" style={{ border:"1px solid rgba(240,192,64,0.3)", maxWidth:240 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="attachment" className="max-w-full object-contain"/>
          </div>
        ))}
        {msg.content && <div className="msg-user-bubble">{msg.content}</div>}
      </div>
      <div className="avatar-user">U</div>
    </div>
  );

  return (
    <div className="msg-bot-row anim-up">
      <div className="avatar-bot">🦉</div>
      <div style={{ flex:1, minWidth:0 }}>
        {msg.toolName && msg.toolResult && (
          <ToolCard toolName={msg.toolName} result={msg.toolResult} />
        )}
        {msg.content && (
          <div className="msg-bot-bubble">
            <MdRenderer content={msg.content}/>
          </div>
        )}
        {!msg.content && !msg.toolName && (
          <div className="msg-bot-bubble" style={{ display:"flex",alignItems:"center",gap:6,padding:"14px 18px" }}>
            <span style={{ fontSize:"0.8125rem",color:"var(--text-3)",marginRight:4 }}>Thinking</span>
            {[1,2,3].map(i=><div key={i} className={`dot-${i}`} style={{ width:6,height:6,borderRadius:"50%",background:"var(--gold)",opacity:0.8 }}/>)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Typing Indicator ────────────────────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="msg-bot-row anim-fade">
      <div className="avatar-bot"><span className="anim-float">🦉</span></div>
      <div className="msg-bot-bubble" style={{ display:"flex",alignItems:"center",gap:6,padding:"14px 18px" }}>
        <span style={{ fontSize:"0.8125rem",color:"var(--text-3)",marginRight:4 }}>Thinking</span>
        {[1,2,3].map(i=><div key={i} className={`dot-${i}`} style={{ width:6,height:6,borderRadius:"50%",background:"var(--gold)",opacity:0.8 }}/>)}
      </div>
    </div>
  );
}

/* ── Welcome Screen ──────────────────────────────────────────────────────────── */
function WelcomeScreen({ onSuggest }:{ onSuggest:(t:string)=>void }) {
  return (
    <div className="welcome">
      <div style={{ width:80,height:80,borderRadius:20,background:"linear-gradient(135deg,#1c1c2e,#2a2a42)",border:"1px solid rgba(240,192,64,0.35)",boxShadow:"0 0 40px rgba(240,192,64,0.1),0 20px 60px rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2.25rem",marginBottom:24 }}>🦉</div>
      <h1 style={{ fontFamily:"var(--font-display),Georgia,serif",fontSize:"2.25rem",fontWeight:600,color:"#fff",letterSpacing:"-0.03em",margin:"0 0 6px" }}>
        Ask <span style={{ background:"linear-gradient(135deg,#f0c040,#fde68a,#f0c040)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>Athena</span>
      </h1>
      <p style={{ fontSize:"0.8125rem",color:"var(--teal)",letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:600,marginBottom:10 }}>AI Learning Intelligence</p>
      <p style={{ color:"var(--text-2)",fontSize:"0.9375rem",maxWidth:420,lineHeight:1.7,marginBottom:32 }}>
        Ask anything, upload images, generate quizzes, and get personalized study strategies — powered by RAG.
      </p>
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {[{icon:<Brain size={12}/>,label:"RAG Knowledge"},{icon:<ImageIcon size={12}/>,label:"Vision AI"},{icon:<Target size={12}/>,label:"Quiz Engine"},{icon:<Calculator size={12}/>,label:"Calculator"},{icon:<Sparkles size={12}/>,label:"70B Model"}]
          .map(({icon,label})=><span key={label} className="badge">{icon}{label}</span>)}
      </div>
      <p style={{ fontSize:"0.75rem",color:"var(--text-3)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12 }}>Try asking</p>
      <div className="flex flex-wrap justify-center gap-2" style={{ maxWidth:560 }}>
        {SUGGESTIONS.map(({icon,label,color},i)=>(
          <button key={label} className="chip anim-up" style={{ animationDelay:`${0.05*i}s` }}
            onClick={()=>onSuggest(label)}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color=color}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color="var(--text-2)"}
          ><span style={{ color }}>{icon}</span>{label}</button>
        ))}
      </div>
    </div>
  );
}

/* ── Sidebar ─────────────────────────────────────────────────────────────────── */
function Sidebar({ sessions,activeId,onSelect,onNew,onDelete,collapsed }:{
  sessions:ChatSession[];activeId:string;onSelect:(id:string)=>void;onNew:()=>void;onDelete:(id:string)=>void;collapsed:boolean;
}) {
  const now=Date.now(),DAY=86400000;
  const sorted=[...sessions].sort((a,b)=>b.createdAt-a.createdAt);
  const groups=[
    {label:"Today",     items:sorted.filter(s=>now-s.createdAt<DAY)},
    {label:"Yesterday", items:sorted.filter(s=>now-s.createdAt>=DAY&&now-s.createdAt<2*DAY)},
    {label:"This Week", items:sorted.filter(s=>now-s.createdAt>=2*DAY&&now-s.createdAt<7*DAY)},
    {label:"Older",     items:sorted.filter(s=>now-s.createdAt>=7*DAY)},
  ].filter(g=>g.items.length>0);
  return (
    <aside className={`sidebar ${collapsed?"collapsed":""}`}>
      <div style={{ padding:"14px 12px 10px",borderBottom:"1px solid var(--border)",flexShrink:0 }}>
        <div className="flex items-center gap-2.5 mb-3">
          <div style={{ width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#1c1c2e,#2a2a42)",border:"1px solid rgba(240,192,64,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem" }}>🦉</div>
          <div>
            <div style={{ fontFamily:"var(--font-display),Georgia,serif",fontSize:"1rem",fontWeight:600,lineHeight:1 }}>
              <span style={{ background:"linear-gradient(135deg,#f0c040,#fde68a)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>Athena</span>
            </div>
            <div style={{ fontSize:"0.65rem",color:"var(--text-3)",letterSpacing:"0.06em" }}>AI Learning</div>
          </div>
        </div>
        <button className="new-chat-btn" onClick={onNew}><MessageSquarePlus size={15}/><span>New Chat</span></button>
      </div>
      <div className="sidebar-scroll">
        {groups.length===0&&<p style={{ color:"var(--text-3)",fontSize:"0.8125rem",textAlign:"center",padding:"24px 10px",lineHeight:1.6 }}>No chats yet.<br/>Start a conversation!</p>}
        {groups.map(({label,items})=>(
          <div key={label}>
            <div className="date-group">{label}</div>
            {items.map(s=>(
              <div key={s.id} className={`chat-item ${s.id===activeId?"active":""}`} onClick={()=>onSelect(s.id)}>
                <MessageSquarePlus size={13} style={{ color:"var(--text-3)",flexShrink:0 }}/>
                <span style={{ flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:"0.8125rem",color:s.id===activeId?"#c4b5fd":"var(--text-2)" }}>{s.title}</span>
                <button className="delete-btn icon-btn" style={{ width:22,height:22,flexShrink:0 }} onClick={e=>{e.stopPropagation();onDelete(s.id);}}><Trash2 size={11} style={{ color:"var(--text-3)" }}/></button>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ padding:"10px 12px",borderTop:"1px solid var(--border)",flexShrink:0 }}>
        <div style={{ display:"flex",alignItems:"center",gap:6 }}>
          <GraduationCap size={12} style={{ color:"var(--text-3)" }}/>
          <span style={{ fontSize:"0.7rem",color:"var(--text-3)" }}>Groq · RAG · Gemini Vision</span>
        </div>
      </div>
    </aside>
  );
}

/* ── Parse AI SDK data stream ────────────────────────────────────────────────── */
function parseStreamChunk(chunk: string): { text?: string; toolName?: string; toolResult?: Record<string,unknown> } {
  const lines = chunk.split("\n");
  let text = "";
  let toolName: string | undefined;
  let toolResult: Record<string,unknown> | undefined;

  for (const line of lines) {
    if (line.startsWith("0:")) {
      try { text += JSON.parse(line.slice(2)); } catch { /* skip */ }
    }
    // Tool result: line starts with 'a:' in AI SDK 4
    if (line.startsWith("a:")) {
      try {
        const data = JSON.parse(line.slice(2));
        if (data?.result && data?.toolName) {
          toolName = data.toolName;
          toolResult = data.result;
        }
      } catch { /* skip */ }
    }
  }
  return { text: text || undefined, toolName, toolResult };
}

/* ── Build API messages from AppMessages ─────────────────────────────────────── */
function buildApiMessages(msgs: AppMessage[]) {
  return msgs.map(m => {
    if (m.imageUrls && m.imageUrls.length > 0) {
      // Multimodal message — build content array
      const parts: unknown[] = [];
      if (m.content) parts.push({ type: "text", text: m.content });
      for (const url of m.imageUrls) {
        parts.push({ type: "image", image: url });
      }
      return { role: m.role, content: parts };
    }
    return { role: m.role, content: m.content };
  });
}

/* ── Main App ────────────────────────────────────────────────────────────────── */
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const textareaRef    = useRef<HTMLTextAreaElement>(null);

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

  // Auto-scroll
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 180) + "px";
  }, [input]);

  const canSend = !isLoading && (input.trim().length > 0 || attachedFiles.length > 0);
  const activeSession = sessions.find(s => s.id === currentId) ?? null;

  // Save current messages to session
  const saveToSession = useCallback((id: string, msgs: AppMessage[]) => {
    setSessions(prev => {
      const exists = prev.find(s => s.id === id);
      const firstUser = msgs.find(m => m.role === "user");
      const title = firstUser?.content?.slice(0,42) || (firstUser?.imageUrls?.length ? "Image Chat" : "New Chat");
      const fullTitle = title + (title.length >= 42 ? "…" : "");
      if (exists) return prev.map(s => s.id === id ? { ...s, title: fullTitle, messages: msgs } : s);
      return [...prev, { id, title: fullTitle, createdAt: Date.now(), messages: msgs }];
    });
  }, []);

  const createNewChat = useCallback(() => {
    const id = `chat_${Date.now()}`;
    setCurrentId(id);
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
      if (remaining.length > 0) {
        const last = remaining[remaining.length - 1];
        setCurrentId(last.id);
        setMessages(last.messages);
      } else { createNewChat(); }
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
    const processed = await Promise.all(Array.from(e.target.files??[]).map(processFile));
    setAttachedFiles(p=>[...p,...processed]);
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f=>f.type.startsWith("image/"));
    if (files.length) { const p = await Promise.all(files.map(processFile)); setAttachedFiles(prev=>[...prev,...p]); }
  };

  // ── MAIN SEND FUNCTION — pure fetch, no useChat ────────────────────────────
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    const files = [...attachedFiles];
    if (!text && files.length === 0) return;
    if (isLoading) return;

    // Clear UI state immediately
    setInput("");
    setAttachedFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Build user message
    const userId = `u_${Date.now()}`;
    const userMsg: AppMessage = {
      id: userId,
      role: "user",
      content: text,
      imageUrls: files.map(f => f.dataUrl),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    // Create placeholder assistant message
    const assistantId = `a_${Date.now()}`;
    const assistantMsg: AppMessage = { id: assistantId, role: "assistant", content: "" };
    setMessages([...newMessages, assistantMsg]);

    try {
      // Build API payload — multimodal content for image messages
      const apiMessages = buildApiMessages(newMessages);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      // Read full response and parse AI SDK stream format
      const rawText = await res.text();
      console.log("RAW LENGTH:", rawText.length, "FIRST 200:", rawText.slice(0,200));

      let fullContent = "";
      let toolName: string | undefined;
      let toolResult: Record<string,unknown> | undefined;

      for (const line of rawText.split("\n")) {
        const t = line.trim();
        if (!t) continue;
        console.log("LINE:", t.slice(0, 60));
        if (t.startsWith("0:")) {
          try { const c = JSON.parse(t.slice(2)); if (typeof c === "string") fullContent += c; } catch {/**/}
        }
        if (t.startsWith("a:")) {
          try { const d = JSON.parse(t.slice(2)); if (d?.toolName) { toolName = d.toolName; toolResult = d.result; } } catch {/**/}
        }
      }

      console.log("PARSED CONTENT LENGTH:", fullContent.length, "PREVIEW:", fullContent.slice(0,100));

      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content: fullContent || "No content parsed", toolName, toolResult } : m
      ));

      // Final update
      const finalMessages: AppMessage[] = [
        ...newMessages,
        { id: assistantId, role: "assistant", content: fullContent, toolName, toolResult },
      ];
      setMessages(finalMessages);
      saveToSession(currentId, finalMessages);

    } catch (err) {
      console.error("Send error:", err);
      const errorMsg = err instanceof Error ? err.message : "Something went wrong";
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: `⚠️ Error: ${errorMsg}. Please try again.` }
          : m
      ));
    } finally {
      setIsLoading(false);
    }
  }, [input, attachedFiles, isLoading, messages, currentId, saveToSession]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const fillSuggestion = (text: string) => {
    setInput(text);
    textareaRef.current?.focus();
  };

  return (
    <div className="app-shell"
      onDragOver={e=>{e.preventDefault();setIsDragging(true);}}
      onDragLeave={()=>setIsDragging(false)}
      onDrop={handleDrop}
    >
      <Sidebar sessions={sessions} activeId={currentId} onSelect={selectSession} onNew={createNewChat} onDelete={deleteSession} collapsed={!sidebarOpen}/>

      <div className="chat-area mesh-bg">
        <div className="topbar">
          <button className="icon-btn" onClick={()=>setSidebarOpen(p=>!p)}>
            {sidebarOpen?<PanelLeftClose size={18}/>:<PanelLeftOpen size={18}/>}
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span style={{ fontFamily:"var(--font-display),Georgia,serif",fontSize:"1rem",fontWeight:600 }}>
              <span style={{ background:"linear-gradient(135deg,#f0c040,#fde68a)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>Athena</span>
            </span>
            {activeSession&&<span style={{ color:"var(--text-3)",fontSize:"0.8125rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:300 }}>/ {activeSession.title}</span>}
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            {[{icon:<Brain size={10}/>,label:"RAG"},{icon:<ImageIcon size={10}/>,label:"Vision"},{icon:<Sparkles size={10}/>,label:"Tools"}]
              .map(({icon,label})=><span key={label} className="badge">{icon}{label}</span>)}
          </div>
        </div>

        <div className="messages-scroll">
          <div className="messages-inner">
            {messages.length===0
              ? <WelcomeScreen onSuggest={fillSuggestion}/>
              : <>
                  {messages.map(msg=><Message key={msg.id} msg={msg}/>)}
                  {isLoading && messages[messages.length-1]?.role === "user" && <TypingIndicator/>}
                  <div ref={messagesEndRef}/>
                </>
            }
          </div>
        </div>

        <div className="input-area">
          <div className="input-box">
            {attachedFiles.length>0&&(
              <div className="flex gap-2 mb-2 flex-wrap">
                {attachedFiles.map((af,i)=>(
                  <div key={i} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={af.previewUrl} alt={af.file.name} className="w-14 h-14 rounded-xl object-cover" style={{ border:"1px solid rgba(240,192,64,0.3)" }}/>
                    <button onClick={()=>setAttachedFiles(p=>p.filter((_,j)=>j!==i))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      style={{ background:"#ef4444",border:"1.5px solid var(--bg)" }}>
                      <X size={10} className="text-white"/>
                    </button>
                  </div>
                ))}
              </div>
            )}
            {messages.length>0&&messages.length<=4&&(
              <div className="flex gap-1.5 mb-2 flex-wrap">
                {SUGGESTIONS.slice(0,3).map(({icon,label,color})=>(
                  <button key={label} className="chip" style={{ fontSize:"0.75rem",padding:"5px 10px" }}
                    onClick={()=>fillSuggestion(label)}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color=color}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color="var(--text-2)"}
                  ><span style={{ color }}>{icon}</span>{label}</button>
                ))}
              </div>
            )}
            <div className="input-wrap">
              <button type="button" className="icon-btn" style={{ flexShrink:0 }}
                onClick={()=>fileInputRef.current?.click()}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color="var(--gold)"}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color="var(--text-3)"}
                title="Attach image"><Paperclip size={16}/></button>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden"/>
              <textarea ref={textareaRef} className="input-textarea" value={input}
                onChange={e=>setInput(e.target.value)} onKeyDown={handleKeyDown}
                rows={1} placeholder="Ask Athena anything… or attach an image 📎"/>
              <button type="button" onClick={sendMessage}
                className={`send-btn ${canSend?"active":"inactive"}`} disabled={!canSend}>
                <Send size={15}/>
              </button>
            </div>
            <p style={{ textAlign:"center",fontSize:"0.7rem",color:"var(--text-3)",marginTop:8,display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
              <GraduationCap size={10} style={{ opacity:0.5 }}/>
              Powered by <span style={{ color:"var(--gold)",opacity:0.7 }}>Groq</span>
              {" · "}<span style={{ color:"var(--teal)",opacity:0.7 }}>Gemini Vision</span>
              {" · "}Vercel AI SDK<span style={{ opacity:0.4 }}> · Shift+Enter for new line</span>
            </p>
          </div>
        </div>
      </div>

      {isDragging&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center anim-fade" style={{ background:"rgba(10,10,15,0.88)",backdropFilter:"blur(8px)" }}>
          <div className="flex flex-col items-center gap-4 p-10 rounded-3xl" style={{ border:"2px dashed rgba(240,192,64,0.4)",background:"rgba(240,192,64,0.04)" }}>
            <ImageIcon size={36} style={{ color:"var(--gold)" }}/>
            <p style={{ fontFamily:"var(--font-display),Georgia,serif",fontSize:"1.1rem",fontWeight:600,color:"var(--gold)" }}>Drop image to analyze</p>
          </div>
        </div>
      )}
    </div>
  );
}
