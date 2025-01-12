from typing import Dict

from starlette.responses import StreamingResponse
import uvicorn
from langchain_community.document_loaders import BraveSearchLoader
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
import json
from contextlib import asynccontextmanager
from app.core import SUPPORTED_CONTENT_TYPES, logger
from app.services import DocumentProcessor, Reranker, Retriever
from app.services.web_fetcher import WebFetcher
from dotenv import load_dotenv
import os
import time
from functools import lru_cache

document_processor = None
reranker = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize on startup
    global document_processor, reranker
    logger.info("Initializing DocumentProcessor and Reranker module")
    document_processor = DocumentProcessor()
    reranker = Reranker()
    yield
    document_processor = None
    reranker = None


app = FastAPI(lifespan=lifespan)

# TODO: Other features to consider:
# - GitHub repo integration


@app.get("/api/v1/search")
async def search_documents(query: str) -> StreamingResponse:
    """
    Endpoint to perform document retrieval based on a query.

    Args:
        query (str): The search query to retrieve relevant content

    Returns:
        StreamingResponse: Server-sent events with status updates and results

    Raises:
        HTTPException: If query is empty or if an error occurs
    """
    global document_processor, reranker
    if not query or query.isspace():
        logger.warning("Empty query")
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    try:
        load_dotenv()
        BRAVE_API_KEY = os.getenv("BRAVE_API_KEY")

        if not BRAVE_API_KEY:
            logger.error("Missing Brave API key")
            raise HTTPException(
                status_code=500, detail="Missing Brave API key in environment"
            )

        async def event_generator():
            try:
                yield f"data: {json.dumps({'status': 'searching'})}\n\n"

                loader = BraveSearchLoader(
                    query=query, api_key=BRAVE_API_KEY, search_kwargs={"count": 3}
                )
                raw_results = loader.load()

                yield f"data: {json.dumps({'status': 'found_results'})}\n\n"
                logger.info("Search results loaded", count=len(raw_results))

                urls = []
                url_metadata = {}

                # FIXME: meteadata not attached/used
                for i, result in enumerate(raw_results):
                    url = result.metadata["link"]
                    urls.append(url)
                    url_metadata[url] = {
                        "title": result.metadata["title"],
                        "url": url,
                        "source": "brave",
                        "result_index": i,
                    }

                yield f"data: {json.dumps({'status': 'indexing'})}\n\n"

                fetcher = WebFetcher()
                url_contents = await fetcher.fetch_all(urls)

                yield f"data: {json.dumps({'status': 'fetched'})}\n\n"

                combined_content = ""
                content_metadata = {}

                for i, (url, (title, content)) in enumerate(url_contents.items()):
                    if content:
                        content_metadata[i] = {
                            "title": title or url_metadata[url]["title"],
                            "url": url,
                            "source": "web",
                            "result_index": i,
                        }
                        combined_content += f"{content}\n\n"

                yield f"data: {json.dumps({'status': 'running_rag'})}\n\n"

                chunks, embeddings, bm25 = document_processor.process_documents(
                    combined_content.encode("utf-8"),
                    content_type="text/plain",
                )

                retriever = Retriever(document_processor.model)
                results = retriever.retrieve(
                    query=query,
                    chunks=chunks,
                    embeddings=embeddings,
                    bm25=bm25,
                    top_k=3,
                )

                reranked_results = reranker.rerank(
                    query, [result["chunk"] for result in results]
                )

                search_results = [
                    {
                        "content": result["chunk"].content,
                        "metadata": result["chunk"].metadata,
                        "score": result.get("score", 0),
                    }
                    for result in reranked_results
                ]

                yield f"data: {json.dumps({
                    'query': query,
                    'results': search_results,
                    'count': len(search_results),
                    'status': "completed"
                })}\n\n"

            except Exception as e:
                logger.error("Event generation failed", error=str(e))
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return StreamingResponse(event_generator(), media_type="text/event-stream")

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
    global document_processor, reranker

    timings = {}
    total_start = time.perf_counter()

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
        file_read_start = time.perf_counter()
        file_content = await file.read()
        timings["file_read"] = time.perf_counter() - file_read_start
        logger.info("File read successfully", content_length=len(file_content))

        processing_start = time.perf_counter()
        chunks, embeddings, bm25 = document_processor.process_documents(
            file_content, file.content_type
        )
        timings["document_processing"] = time.perf_counter() - processing_start

        retrieval_start = time.perf_counter()
        retriever = Retriever(document_processor.model)
        results = retriever.retrieve(
            query=query, chunks=chunks, embeddings=embeddings, bm25=bm25
        )
        timings["retrieval"] = time.perf_counter() - retrieval_start

        rerank_start = time.perf_counter()
        reranked_results = reranker.rerank(
            query, [result["chunk"] for result in results]
        )
        timings["reranking"] = time.perf_counter() - rerank_start

        search_results = [
            {
                "content": result["chunk"].content,
                "metadata": result["chunk"].metadata,
                "score": result.get("score", 0),
            }
            for result in reranked_results
        ]

        total_time = time.perf_counter() - total_start

        return {
            "query": query,
            "results": search_results,
            "count": len(search_results),
            "timings": {"total": total_time, **timings},
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
