# Project Roadmap

## Maintainability Tasks

### High Priority

#### Local RAG System for Authoring (High effort)

**See `docs/RAG_IMPLEMENTATION.md` for detailed requirements and architecture.**

Persistent semantic search across all content types during local authoring, with automatic indexing on save.

**Phase 1 - Core Infrastructure:** ✅ **COMPLETED**

- [x] RAG service layer with LanceDB
- [x] Paragraph-level chunking (posts + quotes)
- [x] Transformers.js embedding provider (384-dim)
- [x] Persistent storage in `data/rag/`
- [x] CLI tools: `rq`, `rrb`, `rst`
- [x] Unit tests (17 passing) and integration tests (14 passing)

**Phase 2 - Auto-Indexing:** ✅ **COMPLETED**

- [x] Hook `ragService.upsertPost()` into create/update handlers
- [x] Hook `ragService.deletePost()` into delete handler
- [x] Handle book quotes separately (upsertQuotes/deleteQuotes)
- [x] Add error handling and fallbacks
- [x] Create `/api/rag-stats` endpoint
- [x] Add logging for index operations
- [x] Write tests for all CRUD operations (15 passing)

**Phase 3 - Ollama MCP Integration:** ✅ **COMPLETED**

- [x] Auto-detect Ollama MCP server
- [x] Fallback to @xenova/transformers
- [x] Embedding provider abstraction
- [x] Environment variable override support
- [x] Unit tests for provider selection

**Phase 4A - Content Intelligence Dashboard:**

- [ ] Replace `/admin/analyze` with RAG-powered dashboard
- [ ] Unified semantic search (posts + quotes)
- [ ] Rich result cards with actions (open, insert, copy)
- [ ] Synthesis opportunities (fleeting to expand, orphaned, unreferenced quotes)
- [ ] Collapsible sections (synthesis, stats)
- [ ] `/api/rag-query` and `/api/rag-synthesis` endpoints

**Phase 4B - Ollama Writing Assistant:**

- [ ] AI assistant panel in PostForm (collapsible sidebar)
- [ ] Chat interface with Ollama
- [ ] Prompt library (`prompts.yaml`)
- [ ] Conversation history (SQLite)
- [ ] Context modes (current post, post + related, just prompt)
- [ ] `/api/ollama-chat`, `/api/ollama-status`, `/api/conversations` endpoints
- [ ] Error display if Ollama unavailable (required dependency)

**Phase 4C - Advanced Features (Future):**

- [ ] Content clusters (text-based)
- [ ] Manual tag suggester in PostForm
- [ ] Series builder
- [ ] Embedding visualization (2D/3D)
- [ ] Writing metrics

**Replaces:** Related Posts, Idea Development Dashboard, Integrated Writing Assistant Phase 1 (RAG powers all these features)

---

#### Improve Image Processing Error Handling (Low effort)

- [ ] Check for missing `images/originals/` directory
- [ ] Handle corrupted/invalid image files gracefully
- [ ] Add summary output (X succeeded, Y failed)
- [ ] Exit with proper codes (0 = success, 1 = error)

---

#### Environment Variables Configuration (Low effort)

- [ ] Create `.env.example` with: `SITE_TITLE`, `SITE_DESCRIPTION`, `AUTHOR_NAME`, `REMARK42_HOST`, `REMARK42_SITE_ID`, `PUBLIC_SITE_URL`
- [ ] Update `src/siteConfig.ts` to read from env with fallbacks
- [ ] Add validation for required variables
- [ ] Document in INSTALL.md and CLAUDE.md

---

### Low Priority

#### Image Path Resolution Utility (Low effort)

- [ ] Create `src/utils/imagePaths.ts` with path helpers and `IMAGE_WIDTHS` constant
- [ ] Update `ResponsiveImage.astro`, `adminApiHelpers.ts`, `process-images.mjs`
- [ ] Add JSDoc and unit tests

---

## Feature Ideas

### High Priority

#### Scheduled Publishing (Medium effort)

Schedule posts for future publication with automated rebuilds.

- [ ] Add `scheduledPublishDate` field to schema
- [ ] Update `getCollection` filter: `publishDate <= now` check
- [ ] Admin: visual indicator + upcoming posts view
- [ ] Timezone handling
- [ ] Setup rebuild trigger (GitHub Actions/Netlify/webhook)

```javascript
// Example filter
const posts = await getCollection("blog", ({ data }) => {
  const publishDate = data.scheduledPublishDate || data.pubDate;
  return import.meta.env.PROD
    ? data.draft !== true && publishDate <= now
    : true;
});
```

---

### Medium Priority

#### Link Helper (Low-Medium effort)

Quick link insertion with internal post search and validation.

- [ ] Quick link dialog (CodeMirror extension)
- [ ] Internal post search (reuse global search)
- [ ] Visual indicators for internal/external links
- [ ] Optional: URL validation, bulk link checker

---

### Low Priority

---

## Implementation Priority

**Highest:** Local RAG System (enables semantic search, related content, writing assistance)

**Quick Wins:** Env config, image path utility, image processing errors

**High Value:** Scheduled publishing, link helper

**Future:** Advanced RAG features (idea synthesis, writing metrics, AI-powered suggestions)

---

## Completed

- ✅ Test scripts in package.json
- ✅ Error handling standardization
- ✅ Remark42 configuration
