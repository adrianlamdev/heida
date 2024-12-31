from typing import List
from sentence_transformers import CrossEncoder
import tiktoken
from app.core import logger
from app.services.document_processor import Chunk


class Reranker:
    """
    Reranker service for hybrid retrieval system.

    This class implements a reranker for hybrid retrieval that uses a sentence transformer model.

    Implementation uses a tokenization model from TikToken for encoding.

    Attributes:
        model: SentenceTransformer model for reranking (default: jinaai/jina-reranker-v2-base-multilingual)
        tokenizer: TikToken tokenizer for encoding (default: cl100k_base)
    """

    def __init__(
        self,
        model: str = "jinaai/jina-reranker-v2-base-multilingual",
        tokenizer=tiktoken.get_encoding("cl100k_base"),
    ):
        self.model = CrossEncoder(
            model,
            automodel_args={"torch_dtype": "auto"},
            trust_remote_code=True,
        )
        self.tokenizer = tokenizer

    def rerank(self, query: str, chunks: List[Chunk]) -> List[dict]:
        """
        Rerank chunks based on semantic similarity to query.

        Args:
            query: The search query string
            chunks: List of Chunk objects to reranker

        Returns:
            List[dict]: Reranked chunks with scores
        """

        chunk_texts = [chunk.content for chunk in chunks]

        sentence_pairs = [[query, text] for text in chunk_texts]
        scores = self.model.predict(sentence_pairs, convert_to_tensor=True).tolist()
        rankings = [
            {"chunk": chunk, "score": score} for chunk, score in zip(chunks, scores)
        ]

        rankings.sort(key=lambda x: x["score"], reverse=True)

        logger.info(
            "Completed reranking",
            query=query,
            scores=[result["score"] for result in rankings],
            chunk_count=len(chunks),
        )

        return rankings
