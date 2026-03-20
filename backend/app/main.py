from fastapi import FastAPI
from app.schemas import AskRequest, AskResponse, HealthCheck
from app.rag import answer_question
from app.config import settings
from app.logging_setup import setup_logging
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import ChatRequest, ChatResponse
from app.rag import answer_chat



setup_logging()

app = FastAPI(title=settings.app_name)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173/"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthCheck)
def health():
    return {"status": "ok", "service": settings.app_name}

@app.post("/ask", response_model=AskResponse)
async def ask(req: AskRequest):
    result = await answer_question(req.question, req.top_k)
    return result


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    return await answer_chat(req.messages, req.top_k)