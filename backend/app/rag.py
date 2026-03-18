from app.search_client import search_top_k
from app.llm_client import chat_completion
from app.config import settings

SYSTEM_PROMPT = """You are a healthcare assistant for a demo app.
You MUST follow these rules:
1) Only answer using the provided SOURCES.
2) If the sources do not contain enough information, say you don't have enough information.
3) Cite sources using [1], [2], etc. after relevant sentences.
4) Do NOT fabricate patient details or medical advice. Provide informational summaries only.
"""

def _format_sources(items):
    lines = []
    citations = []
    for idx, it in enumerate(items, start=1):
        content = (it.get("content") or "").strip()
        if len(content) > 1200:
            content = content[:1200] + "…"
        lines.append(
            f"[{idx}] title={it.get('title')}\n"
            f"source={it.get('source')}\n"
            f"path={it.get('path')}\n"
            f"content={content}\n"
        )
        citations.append({
            "title": it.get("title"),
            "source": it.get("source"),
            "path": it.get("path"),
            "chunk_id": it.get("chunk_id"),
            "score": it.get("score"),
        })
    return "\n".join(lines), citations

def _has_enough_signal(items, min_score: float):
    # If scores are missing, allow; otherwise require at least one decent score.
    scores = [it.get("score") for it in items if it.get("score") is not None]
    if not scores:
        return True
    return max(scores) >= min_score

async def answer_question(question: str, top_k: int | None = None):
    k = top_k or settings.top_k
    retrieved = search_top_k(question, k)

    if not retrieved:
        return {
            "answer": "I don't have enough information in the indexed data to answer that question.",
            "grounded": False,
            "reason": "No results returned from search.",
            "citations": []
        }

    if not _has_enough_signal(retrieved, settings.min_score):
        return {
            "answer": "I don't have enough information in the indexed data to answer that question.",
            "grounded": False,
            "reason": "Search results did not meet relevance threshold.",
            "citations": []
        }

    sources_block, citations = _format_sources(retrieved)

    user_prompt = f"""QUESTION:
{question}

SOURCES:
{sources_block}

INSTRUCTIONS:
- Use only SOURCES.
- Provide a concise answer.
- Add citations like [1], [2].
- If missing info, say so clearly.
"""

    text = await chat_completion(
        system_prompt=SYSTEM_PROMPT,
        user_prompt=user_prompt,
        temperature=0.2,
        max_tokens=500
    )

    return {
        "answer": text.strip(),
        "grounded": True,
        "reason": None,
        "citations": citations
    }