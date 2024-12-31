import pytest
import numpy as np
from rank_bm25 import BM25Okapi


def test_extract_text_pdf(document_processor, sample_pdf_content):
    text, metadata = document_processor.extract_text(
        sample_pdf_content, "application/pdf"
    )
    assert isinstance(text, str)
    assert isinstance(metadata, dict)


def test_extract_text_json(document_processor, sample_json_content):
    text, metadata = document_processor.extract_text(
        sample_json_content, "application/json"
    )
    assert isinstance(text, str)
    assert isinstance(metadata, dict)
    assert '"key": "value"' in text


def test_extract_text_html(document_processor, sample_html_content):
    text, metadata = document_processor.extract_text(sample_html_content, "text/html")
    assert isinstance(text, str)
    assert isinstance(metadata, dict)
    assert "Sample HTML" in text
    assert metadata["title"] == "Test"
    assert metadata["description"] == "Test description"


def test_extract_text_js(document_processor, sample_js_content):
    text, metadata = document_processor.extract_text(
        sample_js_content, "text/javascript"
    )
    assert isinstance(text, str)
    assert isinstance(metadata, dict)
    assert "Sample JavaScript" in text


def test_extract_text_unsupported_type(document_processor):
    with pytest.raises(ValueError):
        document_processor.extract_text(b"unsupported content", "unsupported/type")


def test_process_documents(document_processor, sample_pdf_content):
    chunks, embeddings, bm25 = document_processor.process_documents(
        sample_pdf_content, "application/pdf"
    )
    assert len(chunks) > 0
    assert isinstance(chunks[0].content, str)
    assert isinstance(chunks[0].metadata, dict)
    assert isinstance(chunks[0].index, int)
    assert isinstance(embeddings, np.ndarray)
    assert isinstance(bm25, BM25Okapi)
    assert len(chunks) == embeddings.shape[0]


def test_process_documents_no_chunks(document_processor):
    with pytest.raises(ValueError):
        document_processor.process_documents(b"", "application/pdf")
