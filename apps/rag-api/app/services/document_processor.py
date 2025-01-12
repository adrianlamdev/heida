from dataclasses import dataclass
import time
from typing import Dict, Tuple
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from rank_bm25 import BM25Okapi
from nltk.tokenize import word_tokenize
import json
from bs4 import BeautifulSoup, Tag
from app.core import logger
from pypdf import PdfReader
import io
from pathlib import Path
import hashlib
import numpy as np
import pickle


from app.core.config import SUPPORTED_CONTENT_TYPES


@dataclass
class Chunk:
    content: str
    metadata: Dict
    index: int


class DocumentProcessor:
    """
    Document processing class for hybrid retrieval system.

    This class handles document ingestion, chunking, and preprocessing for retrieval.
    It supports multiple file formats and creates both semantic embeddings and BM25 indices
    for hybrid search.

    Implementation uses RecursiveCharacterTextSplitter from LangChain for chunking,
    BGE embeddings for semantic representations, and BM25Okapi for lexical search.

    Attributes:
        text_splitter: RecursiveCharacterTextSplitter for document chunking
        model: SentenceTransformer model for computing embeddings (default: paraphrase-MiniLM-L3-v2)
        chunk_size (int): Size of text chunks (default: 500)
        chunk_overlap (int): Overlap between chunks (default: 50)
    """

    def __init__(
        self,
        model: str = "sentence-transformers/paraphrase-MiniLM-L3-v2",
        chunk_size: int = 500,
        chunk_overlap: int = 50,
        cache_dir: str = ".cache",
    ):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ". ", "—", ", ", " ", ""],
        )
        self.model = SentenceTransformer(model)
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)

    def _get_cache_key(self, file_content: bytes) -> str:
        """Generate a unique cache key based on file content and processing parameters"""
        params = f"{self.model.get_sentence_embedding_dimension()}_{self.text_splitter._chunk_size}_{self.text_splitter._chunk_overlap}"
        return hashlib.sha256(file_content + params.encode()).hexdigest()

    def _load_from_cache(
        self, cache_key: str
    ) -> Tuple[list, np.ndarray, BM25Okapi] | None:
        """Try to load processed data from cache"""
        try:
            cache_file = self.cache_dir / f"{cache_key}.pkl"
            if cache_file.exists():
                logger.info("Loading from cache", cache_key=cache_key)
                with cache_file.open("rb") as f:
                    return pickle.load(f)
        except Exception as e:
            logger.warning("Cache load failed", error=str(e))
        return None

    def _save_to_cache(
        self, cache_key: str, data: Tuple[list, np.ndarray, BM25Okapi]
    ) -> None:
        """Save processed data to cache"""
        try:
            cache_file = self.cache_dir / f"{cache_key}.pkl"
            with cache_file.open("wb") as f:
                pickle.dump(data, f)
        except Exception as e:
            logger.warning("Cache save failed", error=str(e))

    def extract_text(self, file_content, content_type: str) -> Tuple[str, Dict]:
        """
        Extract plain text and metadata if applicable from various file formats.

        Supports PDF, JSON, HTML, and JavaScript files. Handles text extraction
        with appropriate preprocessing for each format.

        Args:
            file_content: Raw file content bytes
            content_type: MIME type of the file

        Returns:
            Tuple[str, Dict] : Extracted text and metadata

        Raises:
            ValueError: If file type is unsupported or processing fails
        """
        if content_type not in SUPPORTED_CONTENT_TYPES:
            logger.error(f"Unsupported file type: {content_type}")
            raise ValueError(f"Unsupported file type: {content_type}")

        metadata = {}

        try:
            if content_type == "application/pdf":
                pdf_file = io.BytesIO(file_content)
                pdf_reader = PdfReader(pdf_file)
                text = ""
                if pdf_reader.metadata:
                    metadata.update(pdf_reader.metadata)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text, metadata

            content = file_content.decode("utf-8")
            if content_type == "application/json":
                json_data = json.loads(content)
                return json.dumps(json_data, indent=2), metadata
            elif content_type == "text/html":
                soup = BeautifulSoup(content, "html.parser")
                meta_tag = soup.find("meta", {"name": "description"})
                metadata.update(
                    {
                        "title": soup.title.string if soup.title else None,
                        "description": meta_tag["content"]
                        if meta_tag and isinstance(meta_tag, Tag)
                        else None,
                    }
                )
                for script in soup(["script", "style"]):
                    script.decompose()
                return soup.get_text(separator=" ", strip=True), metadata
            elif content_type in ["text/javascript", "application/javascript"]:
                return content, metadata
            # TODO: add more types or a fallback
            return content, metadata
        except Exception as e:
            logger.error(
                "Text extraction failed", error=str(e), content_type=content_type
            )
            raise ValueError(f"Error processing file: {str(e)}")

    def process_documents(self, file_content, content_type: str) -> Tuple:
        """
        Process document and metadata content into chunks with embeddings and BM25 index.

        Args:
            file_content: Raw file content bytes
            content_type: MIME type of the file

        Returns:
            tuple: Tuple containing chunks, embeddings, and BM25 index
        """
        start = time.time()

        cache_key = self._get_cache_key(file_content)
        cached_data = self._load_from_cache(cache_key)
        if cached_data is not None:
            return cached_data

        text, doc_metadata = self.extract_text(file_content, content_type)
        logger.info(f"Text extraction took: {time.time() - start:.2f}s")

        chunk_start = time.time()
        raw_chunks = self.text_splitter.split_text(text)
        logger.info(f"Chunking took: {time.time() - chunk_start:.2f}s")

        if not raw_chunks:
            logger.error("No chunks generated from document")
            raise ValueError("No text chunks were generated from the document")

        chunks = []
        for i, content in enumerate(raw_chunks):
            chunk = Chunk(
                content=content,
                metadata={
                    **doc_metadata,
                    "chunk_index": i,
                    "total_chunks": len(raw_chunks),
                },
                index=i,
            )
            chunks.append(chunk)

        # NOTE: probably move to separate method
        chunk_texts = [chunk.content for chunk in chunks]

        embed_start = time.time()
        embeddings = self.model.encode(chunk_texts, normalize_embeddings=True)
        logger.info(f"Embedding generation took: {time.time() - embed_start:.2f}s")

        tokenized_corpus = [word_tokenize(text.lower()) for text in chunk_texts]

        # TODO: adapative BM25 indexing based on chunk count
        # if len(chunks) > 10:
        #     tokenized_corpus = [word_tokenize(text.lower()) for text in chunk_texts]
        #     bm25 = BM25Okapi(tokenized_corpus)
        # else:
        #     bm25 = None

        bm25_start = time.time()
        bm25 = BM25Okapi(tokenized_corpus)
        logger.info(f"BM25 indexing took: {time.time() - bm25_start:.2f}s")

        results = (chunks, embeddings, bm25)
        self._save_to_cache(cache_key, results)

        return chunks, embeddings, bm25
