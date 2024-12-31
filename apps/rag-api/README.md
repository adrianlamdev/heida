# Heida's RAG API

A hybrid retrieval API service for the Heida platform. This service implements a sophisticated RAG (Retrieval-Augmented Generation) system combining semantic search with BM25 lexical search.

## API Endpoints

### POST /api/v1/retrieve

Performs document retrieval based on a query and uploaded file.

#### Parameters

- `query`: The search query to retrieve relevant content
- `file` (file, form data): The document file to search through

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
    "results": [...],
    "count": number
}
```

## Running the Application

### Development

```bash
fastapi run app/main.py
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
