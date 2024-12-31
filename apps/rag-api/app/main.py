from typing import Dict

import uvicorn
from duckduckgo_search import DDGS
from fastapi import FastAPI, File, Form, HTTPException, UploadFile

from app.core import SUPPORTED_CONTENT_TYPES, logger
from app.services import DocumentProcessor, Reranker, Retriever
from app.services.web_fetcher import WebFetcher

app = FastAPI()


@app.get("/api/v1/search")
async def search_documents(query: str) -> Dict:
    """
    Endpoint to perform document retrieval based on a query.

    Args:
        query (str): The search query to retrieve relevant content

    Returns:
        dict: Contains the query, retrieval results, and result count

    Raises:
        HTTPException: If query is empty
    """

    if not query or query.isspace():
        logger.warning("Empty query")
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    try:
        # First pass - Get initial search results
        raw_results = DDGS().text(query, max_results=5)

        if not raw_results:
            logger.warning("No results found", query=query)
            return {"query": query, "results": [], "count": 0}

        combined_content = ""
        result_metadata = {}

        for i, result in enumerate(raw_results):
            result_metadata[i] = {
                "title": result["title"],
                "url": result["href"],
                "source": "duckduckgo",
                "result_index": i,
            }
            combined_content += f"{result['body']}\n\n"

        processor = DocumentProcessor()
        chunks, embeddings, bm25 = processor.process_documents(
            combined_content.encode("utf-8"),
            content_type="text/plain",
        )

        for chunk in chunks:
            chunk_idx = chunk.metadata["chunk_index"]
            if chunk_idx in result_metadata:
                chunk.metadata.update(result_metadata[chunk_idx])

        retriever = Retriever(processor.model)
        results = retriever.retrieve(
            query=query, chunks=chunks, embeddings=embeddings, bm25=bm25, top_k=5
        )

        reranker = Reranker()
        reranked_results = reranker.rerank(
            query, [result["chunk"] for result in results]
        )

        urls = set()

        fetcher = WebFetcher()
        for result in reranked_results:
            url = result["chunk"].metadata.get("url")
            if url:
                urls.add(url)

        url_contents = await fetcher.fetch_all(list(urls))

        # Second pass - Process full url text content
        second_pass_content = ""
        second_pass_metadata = {}

        for i, result in enumerate(reranked_results):
            url = result["chunk"].metadata.get("url")
            if url and url in url_contents:
                title, full_text = url_contents[url]
                if full_text:
                    second_pass_metadata[i] = {
                        "title": title or result["chunk"].metadata.get("title"),
                        "url": url,
                        "source": "web",
                        "result_index": i,
                        "original_score": result.get("score", 0),
                    }
                    second_pass_content += f"{full_text}\n\n"

        if second_pass_content:
            chunks2, embeddings2, bm25_2 = processor.process_documents(
                second_pass_content.encode("utf-8"),
                content_type="text/plain",
            )

            for chunk in chunks2:
                chunk_idx = chunk.metadata["chunk_index"]
                if chunk_idx in second_pass_metadata:
                    chunk.metadata.update(second_pass_metadata[chunk_idx])

            results2 = retriever.retrieve(
                query=query,
                chunks=chunks2,
                embeddings=embeddings2,
                bm25=bm25_2,
                top_k=3,
            )
            reranked_results2 = reranker.rerank(
                query, [result["chunk"] for result in results2]
            )

            search_results = []
            for result in reranked_results2:
                search_results.append(
                    {
                        "content": result["chunk"].content,
                        "metadata": result["chunk"].metadata,
                        "score": result.get("score", 0),
                    }
                )

        else:
            search_results = [
                {
                    "content": result["chunk"].content,
                    "metadata": result["chunk"].metadata,
                    "score": result.get("score", 0),
                }
                for result in reranked_results
            ]

        return {"query": query, "results": search_results, "count": len(search_results)}

    except Exception as e:
        logger.error(
            "Search failed",
            error=str(e),
            error_type=type(e).__name__,
            query=query if query else None,
        )
        raise HTTPException(
            status_code=500, detail=f"An error occurred during retrieval: {str(e)}"
        )


@app.post("/api/v1/retrieve")
async def retrieve(
    query: str = Form(..., min_length=1), file: UploadFile = File(...)
) -> Dict:
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

    try:
        file_content = await file.read()
        logger.info("File read successfully", content_length=len(file_content))

        processor = DocumentProcessor()
        chunks, embeddings, bm25 = processor.process_documents(
            file_content, file.content_type
        )

        retriever = Retriever(processor.model)
        results = retriever.retrieve(
            query=query, chunks=chunks, embeddings=embeddings, bm25=bm25
        )

        reranker = Reranker()
        reranked_results = reranker.rerank(
            query, [result["chunk"] for result in results]
        )

        search_results = []
        for result in reranked_results:
            search_results.append(
                {
                    "content": result["chunk"].content,
                    "metadata": result["chunk"].metadata,
                    "score": result.get("score", 0),
                }
            )

        return {
            "query": query,
            "results": search_results,
            "count": len(search_results),
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
