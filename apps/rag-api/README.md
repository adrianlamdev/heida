# Heida's RAG API

A hybrid retrieval API service for the Heida platform. This service implements a sophisticated RAG (Retrieval-Augmented Generation) system combining semantic search with BM25 lexical search and cross-encoder reranking.

## Features

- **Hybrid Retrieval**: Combines semantic search (using embeddings) and BM25 lexical search for document retrieval.
- **Cross-Encoder Reranking**: Uses a cross-encoder model to rerank results for improved relevance.
- **Multi-Format Support**: Processes various file types including PDF, JSON, HTML, JavaScript, plain text, CSS, Markdown, YAML, and XML.
- **Web Fetching**: Fetches and processes web content for enhanced retrieval.

## Default Model Configurations

- **Embeddings:** `BAAI/bge-base-en-v1.5`
- **Reranker:** `jinaai/jina-reranker-v2-base-multilingual`
  - Tokenizer: `cl100k_base`

## API Endpoints

### GET /api/v1/search

Performs document retrieval based on a query, fetching and processing web content for enhanced results.

#### Parameters

- `query` (string): The search query to retrieve relevant content.

#### Response

```json
{
  "query": "your search query",
  "results": [
    {
      "content": "relevant text chunk",
      "metadata": {
        "chunk_index": 0,
        "total_chunks": 2,
        "title": "Document Title",
        "url": "https://example.com",
        "source": "web"
      },
      "score": 0.95
    }
  ],
  "count": 2
}
```

### POST /api/v1/retrieve

Performs document retrieval based on a query and uploaded file, using a multi-stage ranking process:

1. **Initial Hybrid Retrieval**: Combines semantic search and BM25 lexical search.
2. **Cross-Encoder Reranking**: Reranks results for improved relevance.

#### Parameters

- `query` (string): The search query to retrieve relevant content.
- `file` (file, form data): The document file to search through.

#### Supported File Types

- PDF (application/pdf)
- JSON (application/json)
- HTML (text/html)
- JavaScript (text/javascript, application/javascript)
- Plain Text (text/plain)
- CSS (text/css)
- Markdown (text/markdown)
- YAML (text/yaml)
- XML (text/xml)

#### Response

```json
{
  "query": "your search query",
  "results": [
    {
      "content": "relevant text chunk",
      "metadata": {
        "chunk_index": 0,
        "total_chunks": 2,
        "title": "Document Title",
        "url": "https://example.com",
        "source": "user"
      },
      "score": 0.95
    }
  ],
  "count": 2
}
```

## Running the Application

### Development

```bash
# Directly run FastAPI
fastapi dev app/main.py

# Run with npm
npm run dev
```

### Docker

```bash
# Build container
docker build -t heida/rag-api .

# Run container
docker run -p 8000:8000 heida/rag-api
```

## Testing

Run the test suite:

```bash
npm run test
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
