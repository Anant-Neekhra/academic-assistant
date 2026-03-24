import os
from loader import load_document_from_url
from chunker import split_documents
from embedder import load_embedding_model
from vector_store import create_vector_store
import shutil

# All FAISS indexes saved here, one file per document
FAISS_STORE_PATH = os.path.join(os.path.dirname(__file__), "faiss_indexes")
os.makedirs(FAISS_STORE_PATH, exist_ok=True)


def _index_path(doc_id: str) -> str:
    """Returns the folder path where a document's FAISS index is saved."""
    return os.path.join(FAISS_STORE_PATH, doc_id)


def ingest_document(file_url: str, doc_id: str) -> int:
    """
    Download PDF → chunk → embed → save FAISS index to disk.
    This is the same flow as rag_pipeline.py __init__, 
    just for a single URL-based document.
    Returns number of chunks stored.
    """

    # 1. Load PDF from URL (new loader function)
    documents = load_document_from_url(file_url, doc_id)

    # 2. Split into chunks — uses your chunker.py untouched
    chunks = split_documents(documents)

    # 3. Load embedding model — uses your embedder.py untouched
    embeddings = load_embedding_model()

    # 4. Create FAISS vector store — uses your vector_store.py untouched
    vector_db = create_vector_store(chunks, embeddings)

    # 5. Save the index to disk so it survives server restarts
    vector_db.save_local(folder_path=_index_path(doc_id))

    return len(chunks)


def query_document(question: str, doc_id: str, top_k: int = 4) -> list[dict]:
    """
    Load the FAISS index for this document, find relevant chunks.
    Same logic as rag_pipeline.py query(), just loading from disk.
    Returns a list of { content, page } dicts for the API to return.
    """
    from langchain_community.vectorstores import FAISS

    index_path = _index_path(doc_id)

    if not os.path.exists(index_path):
        raise FileNotFoundError(
            f"No index found for doc_id '{doc_id}'. "
            "The document may not have been ingested yet."
        )

    embeddings = load_embedding_model()

    # Load the saved FAISS index from disk
    vector_db = FAISS.load_local(
        folder_path=index_path,
        embeddings=embeddings,
        allow_dangerous_deserialization=True,  # safe — we wrote this file ourselves
    )

    # Uses your retriever.py logic
    retriever = vector_db.as_retriever(search_kwargs={"k": top_k})
    docs = retriever.invoke(question)

    return [
        {
            "content": doc.page_content,
            "page": doc.metadata.get("page", None),
            "doc_id": doc.metadata.get("doc_id", doc_id),
        }
        for doc in docs
    ]

def delete_document_index(doc_id: str) -> bool:
    index_path = _index_path(doc_id)

    if not os.path.exists(index_path):
        return False  # Already gone — not an error

    shutil.rmtree(index_path)
    return True