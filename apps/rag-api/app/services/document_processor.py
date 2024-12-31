from dataclasses import dataclass
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
        model: SentenceTransformer model for computing embeddings (default: BAAI/bge-base-en-v1.5)
        chunk_size (int): Size of text chunks (default: 500)
        chunk_overlap (int): Overlap between chunks (default: 50)
    """

    def __init__(
        self,
        model: str = "BAAI/bge-base-en-v1.5",
        chunk_size: int = 500,
        chunk_overlap: int = 50,
    ):
        logger.info(
            "Initializing DocumentProcessor",
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ". ", "—", ", ", " ", ""],
        )
        self.model = SentenceTransformer(model)

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
        logger.info("Extracting text from file", content_type=content_type)
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

    # NOTE: Contextual enrichment works but kinda slow/expensive
    # def create_context(self, chunk):
    #     prompt = f"""Please give a short succinct context to situate this chunk within the overall document for the purposes of improving search retrieval of the chunk. Answer only with the succinct context and nothing else.
    #     Chunk: {chunk}"""
    #     context_creator = ResponseGenerator()
    #     completion = context_creator.client.chat.completions.create(
    #         model="deepseek/deepseek-chat",
    #         messages=[{"role": "user", "content": prompt}],
    #     )
    #     return completion.choices[0].message.content
    #

    def process_documents(self, file_content, content_type: str) -> tuple:
        """
        Process document and metadata content into chunks with embeddings and BM25 index.

        Args:
            file_content: Raw file content bytes
            content_type: MIME type of the file

        Returns:
            tuple: Tuple containing chunks, embeddings, and BM25 index
        """
        logger.info("Processing document", content_type=content_type)
        text, doc_metadata = self.extract_text(file_content, content_type)
        raw_chunks = self.text_splitter.split_text(text)

        # NOTE: Contextual enrichment
        # for i, chunk in enumerate(chunks):
        #    context = self.create_context(chunk)
        #    chunks[i] = f"{context}; {chunk}"

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

        logger.info("Generated chunks", chunk_count=len(chunks))

        # NOTE: probably move to separate method
        chunk_texts = [chunk.content for chunk in chunks]
        embeddings = self.model.encode(chunk_texts, normalize_embeddings=True)
        logger.info("Generated embeddings", embedding_shape=embeddings.shape)

        tokenized_corpus = [word_tokenize(text.lower()) for text in chunk_texts]
        bm25 = BM25Okapi(tokenized_corpus)
        logger.info("Created BM25 index")

        logger.info("Document processed", chunk_count=len(chunks))

        return chunks, embeddings, bm25
