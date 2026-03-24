from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from pipeline import ingest_document, query_document, delete_document_index
import os

load_dotenv()

app = FastAPI(title="Lexis RAG API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        os.environ.get("WEB_URL", ""),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Auth ────────────────────────────────────────────────────────────────
def verify_internal_token(x_internal_token: str = Header(...)):
    if x_internal_token != os.environ["INTERNAL_API_SECRET"]:
        raise HTTPException(status_code=401, detail="Unauthorized")


# ── Request/Response models ─────────────────────────────────────────────

class IngestRequest(BaseModel):
    doc_id: str
    file_url: str

class IngestResponse(BaseModel):
    success: bool
    doc_id: str
    chunks_stored: int

class QueryRequest(BaseModel):
    doc_id: str
    question: str

class SourceChunk(BaseModel):
    content: str
    page: int | None

class QueryResponse(BaseModel):
    doc_id: str
    question: str
    sources: list[SourceChunk]


# ── Routes ──────────────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/ingest", response_model=IngestResponse)
def ingest(req: IngestRequest, x_internal_token: str = Header(...)):
    """
    Called by Next.js after a successful PDF upload.
    Downloads the PDF, chunks + embeds it, saves FAISS index to disk.
    """
    verify_internal_token(x_internal_token)

    try:
        chunks_stored = ingest_document(
            file_url=req.file_url,
            doc_id=req.doc_id,
        )
        return IngestResponse(
            success=True,
            doc_id=req.doc_id,
            chunks_stored=chunks_stored,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/query", response_model=QueryResponse)
def query(req: QueryRequest, x_internal_token: str = Header(...)):
    """
    Called by Next.js when the user sends a chat message.
    Returns the most relevant chunks from the document.
    The LLM call happens in Next.js, not here.
    """
    verify_internal_token(x_internal_token)

    try:
        sources = query_document(
            question=req.question,
            doc_id=req.doc_id,
        )
        return QueryResponse(
            doc_id=req.doc_id,
            question=req.question,
            sources=[SourceChunk(**s) for s in sources],
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/document/{doc_id}")
def delete_document(doc_id: str, x_internal_token: str = Header(...)):
    """
    Called by Next.js when a user deletes a document.
    Removes the FAISS index from disk.
    """
    verify_internal_token(x_internal_token)

    try:
        existed = delete_document_index(doc_id)
        return {
            "success": True,
            "doc_id": doc_id,
            "index_existed": existed,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))