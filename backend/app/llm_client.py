import httpx
from tenacity import (
    retry,
    stop_after_attempt,
    wait_random_exponential,
    retry_if_exception_type,
)
from app.config import settings


class RateLimitOrServerError(Exception):
    pass


def _headers():
    return {
        "api-key": settings.azure_openai_api_key,
        "Content-Type": "application/json",
    }


@retry(
    reraise=True,
    stop=stop_after_attempt(6),
    wait=wait_random_exponential(min=1, max=30),
    retry=retry_if_exception_type(
        (httpx.TimeoutException, httpx.NetworkError, RateLimitOrServerError)
    ),
)
async def chat_completion(
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.2,
    max_tokens: int = 500,
):
    url = (
        f"{settings.azure_openai_endpoint}/openai/deployments/"
        f"{settings.azure_openai_chat_deployment}/chat/completions"
        f"?api-version={settings.azure_openai_api_version}"
    )

    payload = {
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
        "top_p": 0.95,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, headers=_headers(), json=payload)

        # Rate limiting or transient failures
        if resp.status_code == 429 or 500 <= resp.status_code < 600:
            raise RateLimitOrServerError(f"AOAI error {resp.status_code}: {resp.text}")

        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]
