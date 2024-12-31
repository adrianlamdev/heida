from typing import List, Tuple, Dict
import numpy as np
import nltk
from nltk.tokenize import word_tokenize
from rank_bm25 import BM25Okapi
from app.core import logger

nltk.download("punkt")
nltk.download("punkt_tab")


class Retriever:
    """
    Retriever class for hybrid semantic and BM25 search.

    This class implements a hybrid retrieval system that combines semantic search using
    embeddings with BM25 lexical search. Results are combined using a rank fusion
    approach with configurable weighting.

    Implementation is guided by approaches described in:
    "Contextual Retrieval" (Anthropic, 2024)
    https://www.anthropic.com/news/contextual-retrieval

    This implementation specifically adapts the hybrid semantic-lexical retrieval
    concept and rank fusion approach.

    Attributes:
        model: The embedding model used for semantic search
    """

    def __init__(self, model):
        logger.info("Initializing Retriever")
        self.model = model

    # NOTE: For token counting (in development)
    # self.token_counter = TokenCounter()
    # self.token_stats = {
    #     "total_query_tokens": 0,
    #     "total_retrieved_tokens": 0,
    #     "queries_processed": 0
    # }

    def retrieve(
        self,
        query: str,
        chunks: List[int],
        embeddings,
        bm25: BM25Okapi,
        top_k: int = 10,
    ) -> List[dict]:
        """
        Retrieve the most relevant documents using hybrid search.

        Performs both semantic and BM25 search and combines results using rank fusion.

        Args:
            query: The search query string
            chunks: List of text chunks to search through
            embeddings: Pre-computed embeddings for chunks with shape (n_chunks, dim)
            bm25: Pre-initialized BM25 index for chunks
            top_k: Number of results to return (default: 3)

        Returns:
            List of dicts containing {'chunk': str, 'score': float} for top_k results

        Raises:
            ValueError: If chunks, embeddings or bm25 are None
        """
        logger.info("Starting retrieval", query=query, top_k=top_k)
        if chunks is None or embeddings is None or bm25 is None:
            logger.error(
                "Missing required components",
                chunks_none=chunks is None,
                embeddings_none=embeddings is None,
                bm25_none=bm25 is None,
            )
            raise ValueError("chunks, embeddings, and bm25 must not be None")

        if top_k > len(chunks):
            top_k = len(chunks)

        semantic_results = self._semantic_search(query, embeddings, top_k)
        bm25_results = self._bm25_search(query, bm25, top_k)
        final_results = self._rank_fusion(semantic_results, bm25_results)

        # query_tokens = self.token_counter.count_tokens(query)
        # self.token_stats["total_query_tokens"] += query_tokens

        retrieved_docs = [
            {"chunk": chunks[chunk_id], "score": score}
            for chunk_id, score in final_results[:top_k]
        ]
        logger.info(
            "Completed retrieval",
            retrieved_count=len(retrieved_docs),
            semantic_score=semantic_results[0][1] if semantic_results else None,
            bm25_score=bm25_results[0][1] if bm25_results else None,
        )

        # retrieved_tokens = sum(self.token_counter.count_tokens(doc) for doc in retrieved_docs)
        # self.token_stats["total_retrieved_tokens"] += retrieved_tokens
        # self.token_stats["queries_processed"] += 1

        # print(
        #     f"\nRetrieval Operation Stats (Query #{self.token_stats['queries_processed']}):"
        # )
        # print(f"Query tokens: {query_tokens}")
        # print(f"Retrieved document tokens: {retrieved_tokens}")
        # print(
        #     f"Average tokens per retrieved document: {retrieved_tokens / len(retrieved_docs):.1f}"
        # )

        return retrieved_docs

    # NOTE: Get token stats later (in development)
    # def get_token_stats(self):
    #     stats = self.token_stats.copy()
    #     if stats["queries_processed"] > 0:
    #         stats["average_query_tokens"] = (
    #             stats["total_query_tokens"] / stats["queries_processed"]
    #         )
    #         stats["average_retrieved_tokens"] = (
    #             stats["total_retrieved_tokens"] / stats["queries_processed"]
    #         )
    #     return stats

    def _semantic_search(
        self, query: str, embeddings, top_k: int
    ) -> List[Tuple[int, float]]:
        """
        Perform semantic search using embedding similarity.

        Args:
            query: Search query
            embeddings: Document embeddings matrix
            top_k: Number of results to return

        Returns:
            List of tuples (doc_id, similarity_score) for top k matches
        """

        query_embedding = self.model.encode(
            f"Represent this sentence for searching relevant passages: {query}",
            normalize_embeddings=True,
        )
        similarities = query_embedding @ embeddings.T
        top_indices = np.argpartition(similarities, -top_k)[-top_k:]
        return [(idx, float(similarities[idx])) for idx in top_indices]

    def _bm25_search(
        self, query: str, bm25: BM25Okapi, top_k: int
    ) -> List[Tuple[int, float]]:
        """
        Perform lexical search using BM25 scoring.

        Args:
            query: Search query
            bm25: BM25 index
            top_k: Number of results to return

        Returns:
            List of tuples (doc_id, bm25_score) for top k matches
        """
        tokenized_query = word_tokenize(query.lower())
        scores = bm25.get_scores(tokenized_query)
        top_indices = np.argpartition(scores, -top_k)[-top_k:]
        return [(idx, float(scores[idx])) for idx in top_indices]

    def _rank_fusion(
        self,
        semantic_results: List[Tuple[int, float]],
        bm25_results: List[Tuple[int, float]],
        alpha: float = 0.5,
    ) -> List[Tuple[int, float]]:
        """
        Combine semantic and BM25 results using rank fusion.

        Normalizes scores from both methods and combines them using weighted sum.

        Args:
            semantic_results: List of (doc_id, score) from semantic search
            bm25_results: List of (doc_id, score) from BM25
            k: Smoothing parameter for CombSUM fusion (default: 60)
            alpha: Weight for semantic scores, 1-alpha for BM25 (default: 0.5)

        Returns:
            List of (doc_id, combined_score) tuples, sorted by score
        """

        def normalize_scores(
            results: List[Tuple[int, float]],
        ) -> List[Tuple[int, float]]:
            if not results:
                return []
            scores = [score for _, score in results]
            min_score = min(scores)
            max_score = max(scores)
            if max_score == min_score:
                return [(id_, 1.0) for id_, _ in results]
            return [
                (id_, (score - min_score) / (max_score - min_score))
                for id_, score in results
            ]

        semantic_normalized = dict(normalize_scores(semantic_results))
        bm25_normalized = dict(normalize_scores(bm25_results))

        scores = {}
        all_ids = set(semantic_normalized.keys()) | set(bm25_normalized.keys())
        for chunk_id in all_ids:
            semantic_score = semantic_normalized.get(chunk_id, 0.0)
            bm25_score = bm25_normalized.get(chunk_id, 0.0)
            scores[chunk_id] = alpha * semantic_score + (1 - alpha) * bm25_score

        return sorted(scores.items(), key=lambda x: x[1], reverse=True)
