import pytest
from app.services import DocumentProcessor, Retriever
from sentence_transformers import SentenceTransformer
import numpy as np
from rank_bm25 import BM25Okapi
from nltk.tokenize import word_tokenize


@pytest.fixture
def document_processor():
    return DocumentProcessor()


@pytest.fixture
def retriever():
    model = SentenceTransformer("BAAI/bge-base-en-v1.5")
    return Retriever(model)


@pytest.fixture
def sample_pdf_content():
    return (
        b"%PDF-1.4\n"
        b"1 0 obj\n"
        b"<< /Type /Catalog /Pages 2 0 R >>\n"
        b"endobj\n"
        b"2 0 obj\n"
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n"
        b"endobj\n"
        b"3 0 obj\n"
        b"<< /Type /Page /Parent 2 0 R /Resources << >> /Contents 4 0 R >>\n"
        b"endobj\n"
        b"4 0 obj\n"
        b"<< /Length 44 >>\n"
        b"stream\n"
        b"BT /F1 12 Tf 72 720 Td (Hello, World!) Tj ET\n"
        b"endstream\n"
        b"endobj\n"
        b"xref\n"
        b"0 5\n"
        b"0000000000 65535 f \n"
        b"0000000010 00000 n \n"
        b"0000000060 00000 n \n"
        b"0000000110 00000 n \n"
        b"0000000200 00000 n \n"
        b"trailer\n"
        b"<< /Size 5 /Root 1 0 R >>\n"
        b"startxref\n"
        b"300\n"
        b"%%EOF\n"
    )


@pytest.fixture
def sample_json_content():
    return b'{"key": "value"}'


@pytest.fixture
def sample_html_content():
    return b"""
    <html>
        <head>
            <title>Test</title>
            <meta name="description" content="Test description">
        </head>
        <body>
            <p>Sample HTML</p>
        </body>
    </html>
    """


@pytest.fixture
def sample_js_content():
    return b"console.log('Sample JavaScript');"


@pytest.fixture
def sample_chunks():
    return ["This is a sample chunk.", "Another sample chunk."]


@pytest.fixture
def sample_embeddings():
    return np.random.rand(2, 768)


@pytest.fixture
def sample_bm25(sample_chunks):
    tokenized_corpus = [word_tokenize(doc.lower()) for doc in sample_chunks]
    return BM25Okapi(tokenized_corpus)
