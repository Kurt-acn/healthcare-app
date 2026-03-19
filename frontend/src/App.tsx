import { useState } from 'react'
import './App.css'


type Citation = {
  title?: string | null;
  source?: string | null;
  path?: string | null;
  chunk_id?: string | null;
  score?: number | null;
};

type AskResponse = {
  answer: string;
  grounded: boolean;
  reason?: string | null;
  citations: Citation[];
};


function App() {
  
const [question, setQuestion] = useState("What does the data say about pneumonia?");
  const [topK, setTopK] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<AskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const API_BASE = import.meta.env.VITE_API_BASE;

  async function ask() {
    setLoading(true);
    setError(null);
    setResp(null);

    try {
      const r = await fetch(`${API_BASE}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, top_k: topK })
      });

      const data = await r.json();
      if (!r.ok) throw new Error(data?.detail ?? `HTTP ${r.status}`);

      setResp(data);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }
    
return (
    <div className="page">
      <header className="header">
        <h1>Healthcare RAG Assistant</h1>
        <p>Local demo: React (Vite) + FastAPI RAG backend</p>
      </header>

      <section className="card">
        <label className="label">Question</label>
        <textarea
          className="textarea"
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <div className="row">
          <label className="labelInline">Top K</label>
          <input
            className="input"
            type="number"
            min={1}
            max={10}
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
          />

          <button className="btn" onClick={ask} disabled={loading || question.trim().length < 3}>
            {loading ? "Asking..." : "Ask"}
          </button>

          <a className="link" href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer">API Docs</a>
        </div>
        {error && <div className="error">Error: {error}</div>}
      </section>

      <section className="card">
        <h2>Answer</h2>
        {!resp && !error && <div className="muted">Ask a question to see results.</div>}
        {resp && <pre className="answer">{resp.answer}</pre>}
        {resp && !resp.grounded && resp.reason && <div className="muted">Reason: {resp.reason}</div>}
      </section>

      <section className="card">
        <h2>Citations</h2>
        {!resp?.citations?.length && <div className="muted">No citations yet.</div>}
        {!!resp?.citations?.length && (
          <ul className="citations">
            {resp.citations.map((c, i) => (
              <li key={i} className="citationItem">
                <div>
                  <strong>[{i + 1}]</strong>{" "}
                  {c.path ? (
                    <a className="link" href={c.path} target="_blank" rel="noreferrer">
                      {c.title ?? "source"}
                    </a>
                  ) : (
                    <span>{c.title ?? "source"}</span>
                  )}
                  {c.score != null && <span className="muted small"> — score: {c.score.toFixed(3)}</span>}
                </div>
                {c.chunk_id && <div className="muted small">chunk_id: {c.chunk_id}</div>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App
