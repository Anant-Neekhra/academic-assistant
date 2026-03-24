from rag.loader import load_documents
from rag.chunker import split_documents
from rag.embedder import load_embedding_model
from rag.vector_store import create_vector_store
from rag.retriever import retrieve_context


class RAGPipeline:

    def __init__(self, data_path):

        documents = load_documents(data_path)

        chunks = split_documents(documents)

        embeddings = load_embedding_model()

        self.vector_db = create_vector_store(chunks, embeddings)

    def query(self, question, llm):

        context = retrieve_context(question, self.vector_db)

        prompt = f"""
        Use the context to answer the question.

        Context:
        {context}

        Question:
        {question}
        """

        response = llm(prompt)

        return response