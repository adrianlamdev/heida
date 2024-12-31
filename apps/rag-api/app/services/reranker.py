from typing import List
from sentence_transformers import CrossEncoder
import tiktoken
from app.core import logger


"""
Reranker service for hybrid retrieval system.

This class implements a reranker for hybrid retrieval that uses a sentence transformer model.

Implementation uses a tokenization model from TikToken for encoding.

Attributes:
    model: SentenceTransformer model for reranking (default: jinaai/jina-reranker-v2-base-multilingual)
    tokenizer: TikToken tokenizer for encoding (default: cl100k_base)
"""


class Reranker:
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

    def rerank(self, query: str, chunks: List[str]) -> List[dict]:
        """
        Rerank chunks based on semantic similarity to query.

        Args:
            query: The search query string
            chunks: List of text chunks to reranker

        Returns:
            List[dict]: Reranked chunks with scores
        """

        sentence_pairs = [[query, chunk] for chunk in chunks]
        scores = self.model.predict(sentence_pairs, convert_to_tensor=True).tolist()
        results = self.model.rank(
            query, chunks, return_documents=True, convert_to_tensor=True
        )

        rankings = [
            {"chunk": result["text"], "score": score}
            for result, score in zip(results, scores)
        ]

        logger.info(
            "Completed reranking",
            query=query,
            scores=[result["score"] for result in rankings],
            chunk_count=len(chunks),
        )

        return rankings
