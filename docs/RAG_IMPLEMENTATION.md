# Local RAG System

Local semantic search across blog content with automatic indexing on save.

## Design Principles

- Persistent index survives dev server restarts
- Incremental updates (only re-embed changed content)
- Offline-capable via CLI
- Auto-detects Ollama, falls back to transformers.js
- Zero-config defaults

## Architecture

```
Admin UI (React) → API Handlers → RAG Service → LanceDB → Embedding Providers
```

**Storage:** `data/rag/` (gitignored)
- `posts.lance/` - Post paragraphs
- `quotes.lance/` - Book quotes
- `metadata.json` - Config and stats

## Content Chunking

**Posts:** Split on `\n\n`, min 50 chars, max 2000 chars with sentence splitting

**Quotes:** Each quote is a separate document with book metadata

## Embedding Providers

| Provider | Model | Dimensions | Notes |
|----------|-------|------------|-------|
| Ollama (preferred) | nomic-embed-text | 768 | Better quality, local |
| Transformers.js (fallback) | all-MiniLM-L6-v2 | 384 | Zero setup, offline |

## API Endpoints

**POST /api/rag-query** - Search for related content
```json
{ "query": "text", "topK": 5, "filter": { "postType": ["standard"], "contentType": "posts" } }
```

**GET /api/rag-stats** - Index statistics

**POST /api/rag-synthesis** - Get synthesis opportunities

## CLI Tools

```bash
pnpm rq "query"     # Search
pnpm rrb            # Rebuild index
pnpm rst            # View stats
```

## Service API

```typescript
class RAGService {
  async upsertPost(slug, data): Promise<void>
  async deletePost(slug): Promise<void>
  async upsertQuotes(quotesRef, quotes): Promise<void>
  async deleteQuotes(quotesRef): Promise<void>
  async query(text, options): Promise<QueryResult[]>
  async rebuild(): Promise<RebuildStats>
  async getStats(): Promise<IndexStats>
}
```

## Implementation Status

### ✅ Phase 1: Core Infrastructure
- LanceDB storage with Apache Arrow schemas
- Transformers.js embeddings
- Paragraph chunking
- CLI tools
- Unit and integration tests

### ✅ Phase 2: Auto-Indexing
- Hooks in create/update/delete handlers
- `/api/rag-stats` endpoint

### ✅ Phase 3: Ollama Integration
- Auto-detection with fallback
- Environment variable override

### ✅ Phase 4A: Content Intelligence Dashboard
- Unified semantic search
- Rich result cards
- Synthesis opportunities
- Action buttons (Open, Insert, Copy)

### ✅ Phase 4B: AI Writing Assistant
- Chat interface with Ollama
- Prompt library (YAML)
- SQLite conversation persistence
- Context injection modes

### Future (Phase 4C)
- Content clusters
- Tag suggester
- Series builder
- Embedding visualization
- Writing metrics

## Configuration

```bash
RAG_EMBEDDING_PROVIDER=ollama|transformers
RAG_DATA_DIR=./data/rag
RAG_OLLAMA_MODEL=nomic-embed-text
```

## Performance Targets

- Index rebuild: <30s for 100 posts
- Incremental update: <1s per post
- Query latency: <100ms (P95)
- Memory: <200MB for 1000 posts

## Error Handling

- Log errors, continue with save
- Show warning in admin UI
- Provide rebuild button
- Auto-rebuild on corrupted index
- Retry with backoff on timeout
- Fall back between providers

## References

- [LanceDB](https://lancedb.github.io/lancedb/)
- [Transformers.js](https://huggingface.co/docs/transformers.js)
- [Ollama Embeddings](https://ollama.com/blog/embedding-models)
