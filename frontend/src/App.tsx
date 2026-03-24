import { useState, useEffect, useRef } from "react";
import "./App.css";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  ts: number;
};

type Citation = {
  title?: string | null;
  source?: string | null;
  path?: string | null;
  chunk_id?: string | null;
  score?: number | null;
};

type ChatResponse = {
  answer: string;
  grounded: boolean;
  reason?: string | null;
  citations: Citation[];
};



export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [topK, setTopK] = useState(5);
  const [loading, setLoading] = useState(false);
  const [lastCitations, setLastCitations] = useState<Citation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const API_BASE = import.meta.env.VITE_API_BASE;


  useEffect(() => {
    try {
      const saved = localStorage.getItem("chat_history");
      if (saved) setMessages(JSON.parse(saved));
    } catch (e) {
      console.warn("Failed to load chat_history:", e);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return; // ✅ prevents overwriting with []
    localStorage.setItem("chat_history", JSON.stringify(messages));
  }, [messages, hydrated]);

  async function sendMessage() {
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      ts: Date.now(),
    };
    const nextMessages = [...messages, userMsg];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const payload = {
        messages: nextMessages.map(({ role, content }) => ({ role, content })),
        top_k: topK,
      };

      const r = await fetch(`${API_BASE}/chat`, {  /*Remove  ${API_BASE} for local testing */
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: ChatResponse = await r.json();
      if (!r.ok) throw new Error((data as any)?.detail ?? `HTTP ${r.status}`);

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.answer,
        ts: Date.now(),
      };

      setMessages([...nextMessages, assistantMsg]);
      setLastCitations((prev) => {
        const citationKey = (c: Citation) =>
          [c.title, c.source, c.path, c.chunk_id].filter(Boolean).join("|");
        const seen = new Set(prev.map(citationKey));
        const unique = (data.citations || []).filter((c) => {
          const key = citationKey(c);
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        return [...prev, ...unique];
      });
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: `Error: ${e?.message ?? "Unknown error"}`,
          ts: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brandDot" />
          <div className="brandText">
            <div className="brandTitle">Healthcare Bot</div>
            <div className="brandSub">Your personal health assistant</div>
          </div>
        </div>

        <button className="newChatBtn" onClick={() => {
          setMessages([]);
          setLastCitations([]);
          localStorage.removeItem("chat_history");
        }}>
          + New chat
        </button>

        <div className="sidebarHint">
          <div className="chatHeaderTitle">Citations</div>
          {lastCitations.map((c, i) => (
          <div key={i}>[{i+1}] - {c.title}</div>
        ))}
        </div>
      </aside>

      {/* Chat */}
      <main className="chat">
        <header className="chatHeader">
          <div className="chatHeaderTitle">Conversation</div>
          <div className="chatHeaderSub">Assistant left • You right</div>
        </header>

        <div className="messages">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`msgRow ${m.role === "user" ? "right" : "left"}`}
            >
              {/* Avatar on the side */}
              <div className={`avatar ${m.role}`}>
                {m.role === "user" ? "You" : "AI"}
              </div>

              {/* Bubble area */}
              <div className="msgBody">
                <div className="msgMeta">
                  <span className="msgName">{m.role === "user" ? "You" : "AI"}</span>
                  <span className="msgTime">
                    {new Date(m.ts).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className={`bubble ${m.role}`}>
                  {m.content.split("\n").map((line, idx) => (
                    <span key={idx}>
                      {line}
                      <br />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div ref={endRef} />
        </div>
        {loading && (
        <div className="msgTime">
          <div className="composerHint">Assistant Thinking…</div>
        </div>
      )}

        {/* Composer */}
        <div className="composerWrap">
          <div className="composer">
            <textarea
              placeholder="Ask anything…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              
              rows={1}
            />
           
<div className="row">
  <select
    className="topK"
    value={topK}
    onChange={(e) => setTopK(Number(e.target.value))}
  >
    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
      <option key={n} value={n}>
        {n}
      </option>
    ))}
  </select>
</div>


            <button className="sendBtn"   disabled={loading || input.trim().length < 2}
            onClick={sendMessage}
          >
            {loading ? "Asking..." : "Ask"}
            </button>
          </div>

          <div className="composerHint">
            Enter to send • Shift+Enter for newline
          </div>
        </div>
         <div></div>  
      </main>
    </div>

    
  );
}