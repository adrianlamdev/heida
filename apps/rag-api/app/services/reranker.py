from typing import List
from sentence_transformers import CrossEncoder
import tiktoken
from app.core import logger
from app.services.document_processor import Chunk
import torch


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
        model: str = "jinaai/jina-reranker-v1-tiny-en",
        tokenizer=tiktoken.get_encoding("cl100k_base"),
    ):
        self.model = CrossEncoder(
            model,
            automodel_args={
                "torch_dtype": torch.float16,
            },
            trust_remote_code=True,
        )
        self.tokenizer = tokenizer

    def _get_optimal_batch_size(self, chunks: List[Chunk]) -> int:
        # Get average chunk length
        if len(chunks) <= 4:
            return len(chunks)

        # Calculate token lengths using tokenizer for more accurate sizing
        token_lengths = [len(self.tokenizer.encode(chunk.content)) for chunk in chunks]
        avg_tokens = sum(token_lengths) / len(chunks)
        max_tokens = max(token_lengths)
        if avg_tokens < 256:
            return min(16, len(chunks))
        elif avg_tokens < 512:
            return min(8, len(chunks))
        elif avg_tokens < 1024:
            return min(4, len(chunks))
        else:
            return min(2, len(chunks))

    def rerank(self, query: str, chunks: List[Chunk]) -> List[dict]:
        """
        Rerank chunks based on semantic similarity to query.

        Args:
            query: The search query string
            chunks: List of Chunk objects to reranker

        Returns:
            List[dict]: Reranked chunks w ith scores
        """
        batch_size = self._get_optimal_batch_size(chunks)
        chunk_texts = [chunk.content for chunk in chunks]

        sentence_pairs = [[query, text] for text in chunk_texts]

        with torch.inference_mode():
            scores = self.model.predict(
                sentence_pairs,
                batch_size=batch_size,
                convert_to_tensor=True,
                show_progress_bar=False,
            ).tolist()

        rankings = [
            {"chunk": chunk, "score": score} for chunk, score in zip(chunks, scores)
        ]

        rankings.sort(key=lambda x: x["score"], reverse=True)

        return rankings
