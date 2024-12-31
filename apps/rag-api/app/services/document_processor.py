from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from rank_bm25 import BM25Okapi
from nltk.tokenize import word_tokenize
import json
from bs4 import BeautifulSoup
from app.core import logger
from pypdf import PdfReader
import io


"""
Document processing class for hybrid retrieval system.

This class handles document ingestion, chunking, and preprocessing for retrieval.
It supports multiple file formats and creates both semantic embeddings and BM25 indices
for hybrid search.

Implementation uses RecursiveCharacterTextSplitter from LangChain for chunking,
BGE embeddings for semantic representations, and BM25Okapi for lexical search.

Attributes:
    text_splitter: RecursiveCharacterTextSplitter for document chunking
    model: SentenceTransformer model for computing embeddings
    chunk_size: Size of text chunks (default: 500)
    chunk_overlap: Overlap between chunks (default: 50)
"""


class DocumentProcessor:
    def __init__(self, chunk_size=500, chunk_overlap=50):
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
        self.model = SentenceTransformer("BAAI/bge-base-en-v1.5")

    def extract_text(self, file_content, content_type: str) -> str:
        """Extract plain text from various file formats.

        Supports PDF, JSON, HTML, and JavaScript files. Handles text extraction
        with appropriate preprocessing for each format.

        Args:
            file_content: Raw file content bytes
            content_type: MIME type of the file

        Returns:
            str: Extracted plain text

        Raises:
        ValueError: If file type is unsupported or processing fails
        """
        logger.info("Extracting text from file", content_type=content_type)
        try:
            if content_type == "application/pdf":
                pdf_file = io.BytesIO(file_content)
                pdf_reader = PdfReader(pdf_file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text

            content = file_content.decode("utf-8")
            if content_type == "application/json":
                json_data = json.loads(content)
                return json.dumps(json_data, indent=2)
            elif content_type == "text/html":
                soup = BeautifulSoup(content, "html.parser")
                for script in soup(["script", "style"]):
                    script.decompose()
                return soup.get_text(separator=" ", strip=True)
            elif content_type in ["text/javascript", "application/javascript"]:
                return content
            # NOTE: Probably add more file types here instead of erroring out
            raise ValueError(f"Unsupported file type: {content_type}")
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
        """Process document content into chunks with embeddings and BM25 index."""
        logger.info("Processing document", content_type=content_type)
        text = self.extract_text(file_content, content_type)
        chunks = self.text_splitter.split_text(text)

        # NOTE: Contextual enrichment
        # for i, chunk in enumerate(chunks):
        #    context = self.create_context(chunk)
        #    chunks[i] = f"{context}; {chunk}"

        if not chunks:
            logger.error("No chunks generated from document")
            raise ValueError("No text chunks were generated from the document")

        logger.info("Generated chunks", chunk_count=len(chunks))
        embeddings = self.model.encode(chunks, normalize_embeddings=True)
        logger.info("Generated embeddings", embedding_shape=embeddings.shape)

        tokenized_corpus = [word_tokenize(doc.lower()) for doc in chunks]
        bm25 = BM25Okapi(tokenized_corpus)
        logger.info("Created BM25 index")

        return chunks, embeddings, bm25
