import { useState, useEffect } from "react";
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

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [topK, setTopK] = useState(5);
  const [loading, setLoading] = useState(false);
  const [lastCitations, setLastCitations] = useState<Citation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

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

      const r = await fetch("/chat", {
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
      setLastCitations(data.citations || []);
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
    <div className="chat">
      {messages.map((m, i) => (
        <div key={i} className={`bubble ${m.role}`}>
          <div className="meta">{m.role === "user" ? "You" : "Assistant"}</div>
          <div className="text">{m.content}</div>
        </div>
      ))}
      {loading && (
        <div className="bubble assistant">
          <div className="meta">Assistant</div>
          <div className="text">Thinking…</div>
        </div>
      )}

      <div className="composer">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          rows={2}
        />
        <div className="row">
          <label>Top K</label>
          <input
            type="number"
            min={1}
            max={10}
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
          />
          <button
            disabled={loading || input.trim().length < 2}
            onClick={sendMessage}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
      <button
        onClick={() => {
          setMessages([]);
          setLastCitations([]);
          localStorage.removeItem("chat_history");
        }}
      >
        Clear
      </button>
    </div>
  );
}

export default App;
