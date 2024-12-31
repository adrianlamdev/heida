from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from app.services import Retriever, DocumentProcessor, Reranker
from app.core import SUPPORTED_CONTENT_TYPES, logger
import uvicorn


app = FastAPI()


@app.post("/api/v1/retrieve")
async def retrieve(query: str = Form(..., min_length=1), file: UploadFile = File(...)):
    """
    Endpoint to perform document retrieval based on a query and uploaded file.

    Args:
        query (str): The search query to retrieve relevant content
        file (UploadFile): The document file to search through

    Returns:
        dict: Contains the query, retrieval results, and result count

    Raises:
        HTTPException: If file type is unsupported or processing fails
    """
    logger.info(
        "Received retrieval request",
        file_type=file.content_type,
    )

    if not query or query.isspace():
        logger.warning("Empty query")
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    elif not file:
        logger.warning("No file uploaded")
        raise HTTPException(status_code=400, detail="No file")
    elif file.content_type not in SUPPORTED_CONTENT_TYPES:
        logger.warning("Unsupported file type", content_type=file.content_type)
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Supported types are: {', '.join(SUPPORTED_CONTENT_TYPES)}",
        )
    # elif len(await file.read()) > 10 * 1024 * 1024:
    #     logger.warning("File size too large", file_size=file.size)
    #     raise HTTPException(
    #         status_code=400, detail="File size too large. Max size is 10MB"
    #     )

    try:
        file_content = await file.read()
        logger.info("File read successfully", content_length=len(file_content))

        processor = DocumentProcessor()
        chunks, embeddings, bm25 = processor.process_documents(
            file_content, file.content_type
        )
        logger.info("Document processed", chunk_count=len(chunks))

        retriever = Retriever(processor.model)

        results = retriever.retrieve(
            query=query, chunks=chunks, embeddings=embeddings, bm25=bm25
        )

        reranker = Reranker()
        reranked_results = reranker.rerank(
            query, [result["chunk"] for result in results]
        )

        return {
            "query": query,
            "results": reranked_results,
            "count": len(reranked_results),
        }

    except Exception as e:
        logger.error(
            "Retrieval failed",
            error=str(e),
            error_type=type(e).__name__,
            query=query if query else None,
        )
        raise HTTPException(
            status_code=500, detail=f"An error occurred during retrieval: {str(e)}"
        )


if __name__ == "__main__":
    uvicorn.run(app)
