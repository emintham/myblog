# Local RAG System Implementation

## Overview

A persistent, local-first RAG (Retrieval-Augmented Generation) system for semantic search across all blog content during authoring. The system automatically indexes content on save and provides real-time related content suggestions in the admin interface.

## Design Principles

1. **Persistent by default**: Index survives dev server restarts
2. **Incremental updates**: Only re-embed changed content
3. **Offline-capable**: Works via CLI even without dev server
4. **Flexible embedding**: Auto-detects Ollama MCP, falls back to transformers.js
5. **Zero-config**: Works out of the box with sensible defaults

## Architecture

```
┌─────────────────────────────────────┐
│  Admin UI (React)                   │
│  - PostForm.tsx                     │
│  - RelatedContentPanel.tsx          │
│  - useRAGQuery() hook               │
└──────────────┬──────────────────────┘
               │
               │ HTTP API
               ▼
┌─────────────────────────────────────┐
│  API Handlers                       │
│  /api/rag-query.ts (NEW)            │
│  /api/create-post-handler.ts ───────┼──> Auto-index on save
│  /api/update-post-handler.ts        │
│  /api/delete-post-handler.ts        │
└──────────────┬──────────────────────┘
               │
               │ Import
               ▼
┌─────────────────────────────────────┐
│  RAG Service Layer                  │
│  src/services/rag/                  │
│  - index.ts (public API)            │
│  - embeddings.ts (provider logic)   │
│  - chunking.ts (paragraph split)    │
│  - storage.ts (LanceDB wrapper)     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Vector Database (LanceDB)          │
│  data/rag/                          │
│  - posts.lance (post paragraphs)    │
│  - quotes.lance (book quotes)       │
│  - metadata.json (config, stats)    │
└─────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Embedding Providers (auto-detect)  │
│  1. Ollama MCP (preferred)          │
│  2. @xenova/transformers (fallback) │
└─────────────────────────────────────┘
```

## Storage Structure

```
data/rag/                      # Gitignored
├── posts.lance/               # LanceDB table for post paragraphs
│   ├── data/                  # Arrow files
│   └── versions/              # Version metadata
├── quotes.lance/              # LanceDB table for book quotes
│   ├── data/
│   └── versions/
└── metadata.json              # Index metadata
    {
      "version": "1.0.0",
      "created": "2025-11-17T...",
      "lastUpdated": "2025-11-17T...",
      "embeddingModel": "nomic-embed-text",
      "embeddingDim": 768,
      "stats": {
        "totalPosts": 42,
        "totalParagraphs": 456,
        "totalQuotes": 89
      }
    }
```

## Content Chunking Strategy

### Posts (all types: standard, fleeting, bookNote)

**Paragraph-level chunking:**
- Split on double newlines (`\n\n`)
- Min paragraph length: 50 characters (filter out short fragments)
- Max paragraph length: 2000 characters (split long paragraphs at sentence boundaries)
- Include metadata: `slug`, `title`, `postType`, `tags`, `series`, `pubDate`

**Example document:**
```json
{
  "id": "post:my-first-post:0",
  "content": "This is the first paragraph of my post...",
  "vector": [0.123, 0.456, ...],
  "metadata": {
    "slug": "my-first-post",
    "title": "My First Post",
    "postType": "standard",
    "paragraphIndex": 0,
    "tags": ["tech", "writing"],
    "series": "Getting Started",
    "pubDate": "2025-01-15"
  }
}
```

### Book Quotes

**Quote-level chunking:**
- Each quote is a separate document
- Include book metadata: `quotesRef`, `bookTitle`, `bookAuthor`
- Include quote metadata: `tags`, `quoteAuthor`, `quoteSource`

**Example document:**
```json
{
  "id": "quote:atomic-habits:0",
  "content": "You do not rise to the level of your goals...",
  "vector": [0.789, 0.012, ...],
  "metadata": {
    "quotesRef": "atomic-habits",
    "bookTitle": "Atomic Habits",
    "bookAuthor": "James Clear",
    "tags": ["habits", "systems"],
    "quoteAuthor": "James Clear",
    "quoteSource": "Chapter 1"
  }
}
```

## Embedding Providers

### Provider 1: Ollama MCP (Preferred)

**Detection:**
```typescript
async function isOllamaMCPAvailable(): Promise<boolean> {
  try {
    const client = await createMCPClient();
    await client.connect();
    const tools = await client.listTools();
    return tools.some(t => t.name === 'generate_embeddings');
  } catch {
    return false;
  }
}
```

**Usage:**
- Model: `nomic-embed-text` (768 dimensions)
- Batch size: 10 documents at a time
- Timeout: 30 seconds per batch

**Advantages:**
- Better quality embeddings
- Larger context window
- User's local models
- No external API calls

### Provider 2: Transformers.js (Fallback)

**Model:** `Xenova/all-MiniLM-L6-v2`
- Dimensions: 384
- Size: ~25MB download
- Performance: ~50ms per embedding

**Usage:**
```typescript
import { pipeline } from '@xenova/transformers';

const embedder = await pipeline('feature-extraction',
  'Xenova/all-MiniLM-L6-v2'
);
const output = await embedder(text, {
  pooling: 'mean',
  normalize: true
});
```

**Advantages:**
- Zero setup
- Works offline
- Consistent performance

### Provider Selection

1. Check for Ollama MCP on first use
2. Cache selection in `metadata.json`
3. Allow override via environment variable: `RAG_EMBEDDING_PROVIDER=transformers`
4. Log warning if switching providers (requires reindex)

## API Endpoints

### POST /api/rag-query

Query the RAG index for related content.

**Request:**
```json
{
  "query": "text to search for",
  "topK": 5,
  "filter": {
    "postType": ["standard", "fleeting"],  // Optional
    "tags": ["tech"],                       // Optional
    "contentType": "posts"                  // Optional: "posts" | "quotes" | "all"
  }
}
```

**Response:**
```json
{
  "results": [
    {
      "content": "Relevant paragraph text...",
      "score": 0.89,
      "metadata": {
        "slug": "related-post",
        "title": "Related Post",
        "postType": "standard",
        "paragraphIndex": 2,
        "url": "/blog/related-post"
      }
    }
  ],
  "queryTime": 45,
  "provider": "ollama"
}
```

### GET /api/rag-stats

Get index statistics.

**Response:**
```json
{
  "version": "1.0.0",
  "embeddingModel": "nomic-embed-text",
  "embeddingDim": 768,
  "stats": {
    "totalPosts": 42,
    "totalParagraphs": 456,
    "totalQuotes": 89,
    "lastUpdated": "2025-11-17T10:30:00Z"
  },
  "provider": "ollama"
}
```

## Service Layer API

### RAGService Class

```typescript
class RAGService {
  // Index management
  async upsertPost(slug: string, data: PostData): Promise<void>
  async deletePost(slug: string): Promise<void>
  async upsertQuotes(quotesRef: string, quotes: Quote[]): Promise<void>
  async deleteQuotes(quotesRef: string): Promise<void>

  // Querying
  async query(
    text: string,
    options: QueryOptions
  ): Promise<QueryResult[]>

  // Maintenance
  async rebuild(): Promise<RebuildStats>
  async getStats(): Promise<IndexStats>
  async optimize(): Promise<void>
}
```

### Integration Points

**In `/api/create-post-handler.ts`:**
```typescript
// After successful file write
await ragService.upsertPost(slug, {
  title: data.title,
  content: data.body,
  postType: data.postType,
  tags: data.tags,
  series: data.series,
  pubDate: data.pubDate
});

// For book notes
if (data.postType === 'bookNote' && data.quotes) {
  await ragService.upsertQuotes(data.quotesRef, data.quotes);
}
```

**In `/api/update-post-handler.ts`:**
```typescript
// After successful update
if (slugChanged) {
  await ragService.deletePost(oldSlug);
}
await ragService.upsertPost(newSlug, postData);
```

**In `/api/delete-post-handler.ts`:**
```typescript
// After successful deletion
await ragService.deletePost(slug);

if (quotesRef) {
  await ragService.deleteQuotes(quotesRef);
}
```

## CLI Tools

### rag-query

**Usage:**
```bash
pnpm rag-query "semantic search concept" [--top-k 5] [--type posts|quotes]
```

**Output:**
```
🔍 Searching for: "semantic search concept"

📝 Post: "Understanding Embeddings" (score: 0.89)
   /blog/understanding-embeddings#para-3
   "Semantic search works by converting text into dense vectors..."

📝 Post: "Vector Databases Explained" (score: 0.82)
   /blog/vector-databases#para-1
   "Traditional keyword search fails to capture meaning..."

💬 Quote from "Designing Data-Intensive Applications" (score: 0.76)
   Tags: databases, search
   "Full-text search indexes are optimized for..."

Found 3 results in 45ms
```

### rag-rebuild

**Usage:**
```bash
pnpm rag-rebuild [--force]
```

**Output:**
```
🔄 Rebuilding RAG index...

📂 Scanning content...
   - Found 42 posts
   - Found 15 book quote files

🧮 Generating embeddings...
   - Provider: Ollama (nomic-embed-text)
   - Posts: [========================================] 456/456 paragraphs
   - Quotes: [========================================] 89/89 quotes

💾 Writing to database...
   - Posts table: 456 documents
   - Quotes table: 89 documents

✅ Index rebuilt successfully in 23.4s
```

### rag-stats

**Usage:**
```bash
pnpm rag-stats
```

**Output:**
```
📊 RAG Index Statistics

Embedding Model: nomic-embed-text (768 dimensions)
Provider: Ollama MCP
Last Updated: 2025-11-17 10:30:00

Content:
  Posts: 42
  Paragraphs: 456
  Quotes: 89

Storage:
  Posts table: 12.3 MB
  Quotes table: 2.1 MB
  Total: 14.4 MB

Performance (last 100 queries):
  Avg query time: 45ms
  P95 query time: 78ms
```

## Admin UI Components

### RelatedContentPanel

**Location:** Right sidebar in `/admin/edit`

**Features:**
- Real-time updates as user types (debounced 2s)
- Tabs: "Related Posts" | "Relevant Quotes"
- Click to insert reference
- Show/hide toggle
- Loading states

**UI Mockup:**
```
┌─────────────────────────────────┐
│ 📚 Related Content              │
├─────────────────────────────────┤
│ [Posts] [Quotes]                │
├─────────────────────────────────┤
│ 📝 Understanding Embeddings     │
│    Series: ML Basics · 2024     │
│    "Semantic search works..."   │
│    [Insert Link]                │
├─────────────────────────────────┤
│ 📝 Vector Databases             │
│    Tags: tech, databases        │
│    "Traditional keyword..."     │
│    [Insert Link]                │
├─────────────────────────────────┤
│ 💬 Quote from "Designing..."    │
│    Tags: databases, search      │
│    "Full-text search..."        │
│    [Insert Quote]               │
└─────────────────────────────────┘
```

### Tag/Series Suggestions

**Location:** Below tag input in PostForm

**Logic:**
- Extract key phrases from post body
- Query RAG for similar content
- Suggest tags/series from top matches
- Show confidence scores

**Example:**
```
Suggested tags based on content:
  [+ embeddings] (89% match)
  [+ machine-learning] (76% match)
  [+ vector-search] (65% match)
```

### Quote Finder (Book Notes)

**Location:** Modal dialog, triggered by button in PostForm

**Features:**
- Search across all book quotes
- Filter by book, author, tags
- Preview quote in context
- Insert into post with citation

## Documentation Update Plan

Each phase requires specific documentation updates to keep all files in sync:

### Phase 1: Core Infrastructure

**Update after completion:**

- **ROADMAP.md**: Check off Phase 1 tasks
- **INSTALL.md**: Add optional Ollama setup section
  ```markdown
  ## Optional: Ollama for Better Embeddings (Recommended)

  For higher-quality semantic search, install Ollama:
  1. Install Ollama: https://ollama.com/download
  2. Pull embedding model: `ollama pull nomic-embed-text`
  3. RAG system will auto-detect and use Ollama when available
  ```
- **GUIDE.md**: Add new "RAG Index Management" section
  ```markdown
  ## RAG Index Management

  The blog includes a local semantic search system that indexes your content:

  - **Automatic indexing**: Posts/quotes are indexed when you save them
  - **Manual rebuild**: `pnpm rag-rebuild` (run if index gets corrupted)
  - **Query index**: `pnpm rag-query "search term"`
  - **View stats**: `pnpm rag-stats`

  The index is stored in `data/rag/` and persists between dev server restarts.
  ```
- **package.json**: Verify new scripts are documented
- **CLAUDE.md**: Add RAG service to "Architecture Overview" and "Important Files Reference"
  ```markdown
  ### RAG System

  **Location:** `src/services/rag/`

  **Purpose:** Local semantic search across all content types

  **Components:**
  - `index.ts` - Public RAG service API
  - `storage.ts` - LanceDB wrapper
  - `chunking.ts` - Paragraph splitting
  - `embeddings.ts` - Provider abstraction

  **Integration:** Auto-indexes posts/quotes on save via API handlers

  **CLI Tools:** `rag-query`, `rag-rebuild`, `rag-stats`
  ```

### Phase 2: Ollama MCP Integration

**Update after completion:**

- **ROADMAP.md**: Check off Phase 2 tasks
- **INSTALL.md**: Enhance Ollama section with MCP server setup
  ```markdown
  ## Ollama MCP Server (Optional)

  For automatic Ollama detection:
  1. Install Ollama MCP server: `npm install -g @modelcontextprotocol/server-ollama`
  2. RAG system will detect and use it automatically
  3. Or force provider: `RAG_EMBEDDING_PROVIDER=ollama pnpm rag-rebuild`
  ```
- **GUIDE.md**: Update RAG section with provider info
  ```markdown
  ### Embedding Providers

  The RAG system supports two embedding providers:
  1. **Ollama** (preferred): Better quality, local models
  2. **Transformers.js** (fallback): Zero-config, works offline

  Check current provider: `pnpm rag-stats`
  ```
- **.env.example**: Create if doesn't exist, add RAG variables
  ```bash
  # RAG Configuration (optional)
  RAG_EMBEDDING_PROVIDER=ollama  # or 'transformers'
  RAG_DATA_DIR=./data/rag
  RAG_OLLAMA_MODEL=nomic-embed-text
  ```
- **CLAUDE.md**: Update RAG section with provider details

### Phase 3: Admin UI

**Update after completion:**

- **ROADMAP.md**: Check off Phase 3 tasks, mark entire RAG feature complete
- **README.md**: Add RAG to "Advanced Content & Knowledge Management" section
  ```markdown
  - **Semantic Search & Related Content:**
    - Real-time related content suggestions while writing
    - Semantic search across all posts and book quotes
    - Smart tag/series recommendations based on content
    - Quote finder for quick reference insertion
    ![Related Content Panel Screenshot](images/rag-panel.png)
  ```
- **GUIDE.md**: Add "Writing with RAG Assistance" section
  ```markdown
  ## Writing with RAG Assistance

  When editing posts in the admin interface, the Related Content panel
  shows semantically similar content as you type:

  - **Related Posts**: Similar posts from your archive
  - **Relevant Quotes**: Book quotes matching your content
  - **Tag Suggestions**: Recommended tags based on similar posts
  - **Insert Links**: Click to add markdown references

  The panel updates automatically every 2 seconds while typing.
  Toggle visibility with the sidebar button.
  ```
- **CLAUDE.md**: Add to "Development Patterns" section
  ```markdown
  ### Working with RAG Suggestions

  The admin UI includes a RelatedContentPanel component:
  - Auto-queries RAG index as user types (debounced 2s)
  - Shows related posts and relevant quotes
  - Enables quick reference insertion
  - Gracefully degrades if RAG unavailable

  Location: `src/components/admin/RelatedContentPanel.tsx`
  Hook: `src/hooks/useRAGQuery.ts`
  ```
- **CHANGELOG.md**: Add entry for RAG feature
  ```markdown
  ## [Date]

  ### Added
  - Local RAG system for semantic search during authoring
  - Related content panel in post editor
  - Automatic content indexing on save
  - CLI tools for index management
  - Ollama MCP integration for better embeddings
  ```

### Post-Implementation (All Phases Complete)

**Final documentation tasks:**

- **README.md**: Add screenshots of RAG panel
- **docs/RAG_IMPLEMENTATION.md**: Mark as "IMPLEMENTED" at top
- **ROADMAP.md**: Move RAG to "Completed" section
- **.gitignore**: Verify `data/rag/` is listed
- **CLAUDE.md**: Final review of all RAG references

## Implementation Phases

### Phase 1: Core Infrastructure (Est: 8-12 hours)

**Goal:** Working RAG service with CLI tools

**Tasks:**
1. Install dependencies: `lancedb`, `@xenova/transformers`
2. Create service layer structure:
   - `src/services/rag/index.ts`
   - `src/services/rag/storage.ts`
   - `src/services/rag/chunking.ts`
   - `src/services/rag/embeddings.ts`
3. Implement transformers.js provider
4. Implement paragraph chunking
5. Create LanceDB tables (posts, quotes)
6. Build CLI tools: `rag-query`, `rag-rebuild`, `rag-stats`
7. Add to `.gitignore`: `data/rag/`
8. Add scripts to `package.json`
9. Write unit tests for chunking logic

**Testing:**
- Manually create test posts
- Run `pnpm rag-rebuild`
- Query via `pnpm rag-query`
- Verify results

**Success Criteria:**
- [ ] Can rebuild index from existing content
- [ ] Can query and get relevant results
- [ ] Index persists after restart
- [ ] CLI tools work correctly

### Phase 2: Auto-Indexing (Est: 4-6 hours)

**Goal:** Automatic incremental updates on save

**Tasks:**
1. Hook `ragService.upsertPost()` into create/update handlers
2. Hook `ragService.deletePost()` into delete handler
3. Handle book quotes separately (upsertQuotes/deleteQuotes)
4. Add error handling and fallbacks
5. Create `/api/rag-stats` endpoint
6. Add logging for index operations
7. Test all CRUD operations

**Testing:**
- Create new post → verify indexed
- Update post → verify re-indexed
- Delete post → verify removed
- Restart server → verify index intact

**Success Criteria:**
- [ ] New posts auto-indexed on creation
- [ ] Updates re-index only changed post
- [ ] Deletions remove from index
- [ ] No manual rebuild needed for normal workflow

### Phase 3: Ollama MCP Integration (Est: 6-8 hours)

**Goal:** Better embeddings via local Ollama

**Tasks:**
1. Install MCP SDK: `@modelcontextprotocol/sdk`
2. Create Ollama embedding provider
3. Implement auto-detection logic
4. Add provider fallback chain
5. Document Ollama setup in README
6. Add environment variable override
7. Test with/without Ollama running

**Testing:**
- Start Ollama with nomic-embed-text
- Rebuild index → verify Ollama used
- Stop Ollama → verify fallback to transformers.js
- Compare embedding quality

**Success Criteria:**
- [ ] Auto-detects Ollama MCP when available
- [ ] Falls back gracefully to transformers.js
- [ ] Can force provider via env var
- [ ] Logs which provider is used

### Phase 4: Admin UI (Est: 10-12 hours)

**Goal:** Related content panel in post editor

**Tasks:**
1. Create `/api/rag-query` endpoint
2. Create `useRAGQuery` hook
3. Build `RelatedContentPanel` component
4. Add to `PostForm` layout (right sidebar)
5. Implement debounced queries (2s)
6. Add loading/error states
7. Create "insert link" functionality
8. Add show/hide toggle + localStorage
9. Style to match admin theme

**Testing:**
- Type in editor → see related content
- Click insert link → verify markdown added
- Test with long posts (performance)
- Test with no results
- Test error states

**Success Criteria:**
- [ ] Panel updates as user types
- [ ] Shows relevant posts and quotes
- [ ] Can insert references easily
- [ ] Doesn't impact editor performance
- [ ] Graceful degradation if RAG unavailable

### Phase 5: Advanced Features (Future)

**Tag/Series Suggestions:**
- Extract key phrases from draft
- Query RAG for similar content
- Suggest tags based on matches
- Detect potential series relationships

**Quote Finder Modal:**
- Search all quotes by semantic similarity
- Filter by book, author, tags
- Preview in context
- Insert with formatted citation

**Idea Synthesis:**
- Find "orphaned" fleeting thoughts
- Detect quotes never referenced
- Suggest connections between posts
- "Evolution view" for topics over time

**Writing Metrics:**
- Readability scores (Flesch-Kincaid)
- Passive voice detection
- Word/paragraph count stats
- Estimated reading time

## Configuration

### Environment Variables

```bash
# Optional: force specific embedding provider
RAG_EMBEDDING_PROVIDER=ollama|transformers

# Optional: custom data directory
RAG_DATA_DIR=./data/rag

# Optional: embedding model
RAG_OLLAMA_MODEL=nomic-embed-text
RAG_TRANSFORMERS_MODEL=Xenova/all-MiniLM-L6-v2
```

### .gitignore

```
# RAG index (do not commit)
data/rag/
```

### package.json Scripts

```json
{
  "scripts": {
    "rag-query": "node scripts/rag-query.mjs",
    "rag-rebuild": "node scripts/rag-rebuild.mjs",
    "rag-stats": "node scripts/rag-stats.mjs"
  }
}
```

## Performance Targets

- **Index rebuild**: < 30s for 100 posts
- **Incremental update**: < 1s per post
- **Query latency**: < 100ms (P95)
- **Memory usage**: < 200MB for 1000 posts
- **Storage size**: ~30KB per post (averaged)

## Error Handling

### Graceful Degradation

If RAG service fails:
1. Log error to console
2. Continue with post save/update
3. Show warning in admin UI
4. Provide "rebuild index" button

### Recovery Strategies

- **Corrupted index**: Auto-rebuild on startup
- **Embedding timeout**: Retry with exponential backoff
- **Out of disk**: Warn user, disable indexing
- **Provider unavailable**: Fall back to other provider

## Testing Strategy

### Unit Tests

- Chunking logic (paragraph splitting)
- Embedding provider selection
- Query result scoring
- Metadata extraction

### Integration Tests

- End-to-end indexing workflow
- API endpoint contracts
- CLI tool outputs
- Error scenarios

### Manual Testing

- Real content from blog
- Performance with large corpus
- UI responsiveness
- Cross-browser compatibility

## Future Enhancements

1. **Multi-modal embeddings**: Index images via CLIP
2. **Temporal filtering**: "Show related posts from last 6 months"
3. **Negative search**: "Similar to X but not about Y"
4. **Hybrid search**: Combine semantic + keyword (BM25)
5. **Export/import**: Share index between machines
6. **Analytics**: Track which suggestions are used
7. **A/B testing**: Compare embedding models

## References

- [LanceDB Documentation](https://lancedb.github.io/lancedb/)
- [Transformers.js](https://huggingface.co/docs/transformers.js)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Ollama Embeddings](https://ollama.com/blog/embedding-models)
