# Project Roadmap

## Maintainability Tasks

### High Priority

#### Local RAG System for Authoring ✅ **COMPLETED**

**See `docs/RAG_IMPLEMENTATION.md` for detailed requirements and architecture.**

Persistent semantic search across all content types during local authoring, with automatic indexing on save. Full implementation includes:
- RAG service layer with LanceDB and dual embedding providers (Ollama + Transformers.js)
- Automatic indexing on create/update/delete operations
- Content Intelligence Dashboard with semantic search and synthesis opportunities
- AI Writing Assistant with Ollama integration and conversation history

**Advanced Features (Future):**

- [ ] Content clusters (text-based)
- [ ] Manual tag suggester in PostForm
- [ ] Series builder
- [ ] Embedding visualization (2D/3D)
- [ ] Writing metrics

---

#### Improve Image Processing Error Handling ✅ **COMPLETED**

- [x] Check for missing `images/originals/` directory
- [x] Handle corrupted/invalid image files gracefully
- [x] Add summary output (X succeeded, Y failed)
- [x] Exit with proper codes (0 = success, 1 = error)

---

#### Environment Variables Configuration ✅ **COMPLETED**

- [x] Create `.env.example` with: `SITE_TITLE`, `SITE_DESCRIPTION`, `AUTHOR_NAME`, `REMARK42_HOST`, `REMARK42_SITE_ID`, `PUBLIC_SITE_URL`
- [x] Update `src/siteConfig.ts` to read from env with fallbacks
- [ ] Add validation for required variables (future enhancement)
- [x] Document in CLAUDE.md

---

#### Refactor Large API Handlers (Medium effort)

- [ ] Break down `update-post-handler.ts` (340 lines) into smaller, testable functions
- [ ] Extract slug change logic to `src/utils/postUpdateHelpers.ts`
- [ ] Extract quotes YAML update logic to separate function
- [ ] Add unit tests for extracted helpers

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

## Recently Completed

- ✅ Local RAG System (Phases 1-4B): Semantic search, auto-indexing, Ollama integration, Content Intelligence Dashboard, AI Writing Assistant
- ✅ Test scripts in package.json
- ✅ Error handling standardization
- ✅ Remark42 configuration
