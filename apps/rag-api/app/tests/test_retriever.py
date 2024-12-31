import pytest


def test_retrieve(retriever, sample_chunks, sample_embeddings, sample_bm25):
    query = "sample query"
    results = retriever.retrieve(
        query, sample_chunks, sample_embeddings, sample_bm25, top_k=2
    )
    assert isinstance(results, list)
    assert all(
        isinstance(result, dict) and "chunk" in result and "score" in result
        for result in results
    )
    assert len(results) <= 2


def test_retrieve_missing_args(
    retriever, sample_chunks, sample_embeddings, sample_bm25
):
    with pytest.raises(ValueError):
        retriever.retrieve("query", None, sample_embeddings, sample_bm25)
    with pytest.raises(ValueError):
        retriever.retrieve("query", sample_chunks, None, sample_bm25)
    with pytest.raises(ValueError):
        retriever.retrieve("query", sample_chunks, sample_embeddings, None)


def test_semantic_search(retriever, sample_embeddings):
    query = "sample query"
    results = retriever._semantic_search(query, sample_embeddings, top_k=2)
    assert isinstance(results, list)
    assert all(isinstance(result, tuple) and len(result) == 2 for result in results)
    assert len(results) <= 2


def test_bm25_search(retriever, sample_bm25):
    query = "sample query"
    results = retriever._bm25_search(query, sample_bm25, top_k=2)
    assert isinstance(results, list)
    assert all(isinstance(result, tuple) and len(result) == 2 for result in results)
    assert len(results) <= 2


def test_rank_fusion(retriever):
    semantic_results = [(0, 0.9), (1, 0.8)]
    bm25_results = [(0, 0.7), (1, 0.6)]
    fused_results = retriever._rank_fusion(semantic_results, bm25_results)
    assert isinstance(fused_results, list)
    assert all(
        isinstance(result, tuple) and len(result) == 2 for result in fused_results
    )
    assert fused_results == sorted(fused_results, key=lambda x: x[1], reverse=True)
