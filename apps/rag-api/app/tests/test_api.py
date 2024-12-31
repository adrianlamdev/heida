from fastapi.testclient import TestClient
from unittest.mock import patch
from io import BytesIO
from app.main import app
from app.services.document_processor import Chunk

client = TestClient(app)


def test_retrieve_endpoint_returns_results(sample_pdf_content):
    mock_file = BytesIO(sample_pdf_content)

    with patch("app.main.DocumentProcessor") as mock_processor, patch(
        "app.main.Retriever"
    ) as mock_retriever, patch("app.main.Reranker") as mock_reranker:
        mock_processor_instance = mock_processor.return_value
        mock_chunks = [
            Chunk(
                content="chunk1",
                metadata={"chunk_index": 0, "total_chunks": 2},
                index=0,
            ),
            Chunk(
                content="chunk2",
                metadata={"chunk_index": 1, "total_chunks": 2},
                index=1,
            ),
        ]
        mock_processor_instance.process_documents.return_value = (
            mock_chunks,
            "mock_embeddings",
            "mock_bm25",
        )

        mock_retriever_instance = mock_retriever.return_value
        mock_retriever_instance.retrieve.return_value = [
            {"chunk": mock_chunks[0], "score": 0.9},
            {"chunk": mock_chunks[1], "score": 0.8},
        ]

        mock_reranker_instance = mock_reranker.return_value
        mock_reranker_instance.rerank.return_value = [
            {"chunk": mock_chunks[0], "score": 0.95},
            {"chunk": mock_chunks[1], "score": 0.85},
        ]

        response = client.post(
            "/api/v1/retrieve",
            data={"query": "test query"},
            files={"file": ("test.pdf", mock_file, "application/pdf")},
        )

        assert response.status_code == 200
        assert response.json() == {
            "query": "test query",
            "results": [
                {
                    "content": "chunk1",
                    "metadata": {"chunk_index": 0, "total_chunks": 2},
                    "score": 0.95,
                },
                {
                    "content": "chunk2",
                    "metadata": {"chunk_index": 1, "total_chunks": 2},
                    "score": 0.85,
                },
            ],
            "count": 2,
        }


def test_retrieve_endpoint_handles_unsupported_file_type():
    file_content = b"Mock file content"
    mock_file = BytesIO(file_content)
    response = client.post(
        "/api/v1/retrieve",
        data={"query": "test query"},
        files={"file": ("test.unsupported", mock_file, "application/unsupported")},
    )
    assert response.status_code == 400
    assert "Unsupported file type" in response.json()["detail"]


def test_retrieve_endpoint_handles_empty_query(sample_pdf_content):
    mock_file = BytesIO(sample_pdf_content)
    response = client.post(
        "/api/v1/retrieve",
        data={"query": ""},
        files={"file": ("test.pdf", mock_file, "application/pdf")},
    )
    assert response.status_code == 422


def test_retrieve_endpoint_handles_empty_file():
    mock_file = BytesIO(b"")
    response = client.post(
        "/api/v1/retrieve",
        data={"query": "test query"},
        files={"file": ("empty.pdf", mock_file, "application/pdf")},
    )
    assert response.status_code == 500
    assert "An error occurred during retrieval" in response.json()["detail"]


def test_retrieve_endpoint_handles_processing_error(sample_pdf_content):
    mock_file = BytesIO(sample_pdf_content)
    with patch("app.main.DocumentProcessor") as mock_processor:
        mock_processor_instance = mock_processor.return_value
        mock_processor_instance.process_documents.side_effect = Exception(
            "Mock processing error"
        )
        response = client.post(
            "/api/v1/retrieve",
            data={"query": "test query"},
            files={"file": ("test.pdf", mock_file, "application/pdf")},
        )
        assert response.status_code == 500
        assert "An error occurred during retrieval" in response.json()["detail"]
