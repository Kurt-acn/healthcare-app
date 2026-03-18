from azure.search.documents import SearchClient
from azure.core.credentials import AzureKeyCredential
from app.config import settings

def get_search_client() -> SearchClient:
    return SearchClient(
        endpoint=settings.azure_search_endpoint,
        index_name=settings.azure_search_index,
        credential=AzureKeyCredential(settings.azure_search_key)
    )

def search_top_k(question: str, top_k: int):
    client = get_search_client()

    # Keyword/hybrid-safe baseline: rely on the service ranking and semantic ranker (if enabled).
    results = client.search(
        search_text=question,
        top=top_k,
        include_total_count=False
    )

    items = []
    for r in results:
        items.append({
            "id": r.get("chunk_id"),
            "content": r.get("chunk") or "",
            "source": r.get("source"),
            "path": r.get("metadata_storage_path") or r.get("path"),
            "title": r.get("title") or r.get("metadata_storage_name"),
            "chunk_id": r.get("chunk_id"),
            "score": r.get("@search.score"),
        })
    return items