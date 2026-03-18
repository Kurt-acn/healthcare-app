from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class Citation(BaseModel):
    title: Optional[str] = None
    source: Optional[str] = None
    path: Optional[str] = None
    chunk_id: Optional[str] = None
    score: Optional[float] = None

class AskRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=500)
    top_k: Optional[int] = Field(None, ge=1, le=10)

class AskResponse(BaseModel):
    answer: str
    grounded: bool
    reason: Optional[str] = None
    citations: List[Citation] = Field(default_factory=list)

class HealthCheck(BaseModel):
    status: Literal["ok"]
    service: str