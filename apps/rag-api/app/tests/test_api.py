from app.main import app
from fastapi.testclient import TestClient
from unittest.mock import patch
from io import BytesIO

client = TestClient(app)


def test_retrieve_endpoint_returns_results(sample_pdf_content):
    mock_file = BytesIO(sample_pdf_content)

    with patch("app.main.DocumentProcessor") as mock_processor, patch(
        "app.main.Retriever"
    ) as mock_retriever:
        mock_processor_instance = mock_processor.return_value
        mock_processor_instance.process_documents.return_value = (
            ["chunk1", "chunk2"],
            "mock_embeddings",
            "mock_bm25",
        )

        mock_retriever_instance = mock_retriever.return_value
        mock_retriever_instance.retrieve.return_value = ["result1", "result2"]

        response = client.post(
            "/api/v1/retrieve",
            data={"query": "test query"},
            files={"file": ("test.pdf", mock_file, "application/pdf")},
        )

        assert response.status_code == 200
        assert response.json() == {
            "query": "test query",
            "results": ["result1", "result2"],
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
