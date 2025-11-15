# Project Roadmap

## Maintainability Tasks

### High Priority

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
  return import.meta.env.PROD ? data.draft !== true && publishDate <= now : true;
});
```

---

#### Related Posts (Medium effort)

Display 3-5 related posts via similarity scoring (series > tags > type).

- [ ] Create `src/utils/relatedPosts.ts` with scoring logic
- [ ] Create `RelatedPosts.astro` component
- [ ] Add to post detail pages
- [ ] Make count configurable

---

### Medium Priority

#### Idea Development Dashboard (Medium effort)

**Location:** Analyze tab (separate exploration mode)

Query-driven interface to review and develop captured ideas into articles.

**Core Features:**
- [ ] **Undeveloped quotes**: Book highlights not yet referenced in posts
- [ ] **Orphaned fleeting thoughts**: Quick notes that share tags but haven't been expanded
- [ ] **Synthesis suggestions**: "These 3 fleeting thoughts all touch on [theme]"
- [ ] **Evolution view**: How thinking on a tag/topic has progressed over time
- [ ] **Query interface**: "Show me all quotes about X that I haven't written about"

**Workflow:** Reading → Book Notes/Fleeting Thoughts → Dashboard → Standard Posts

**Replaces:** Close reading feature (better aligned with actual workflow)

---

#### Integrated Writing Assistant (Medium-High effort)

**Location:** PostForm editor (active writing help, low-friction)

Contextual suggestions and tools while writing, without breaking flow.

**Phase 1 - Local/Passive (Medium effort):**
- [ ] Related content sidebar (similar posts/quotes as you type)
- [ ] Writing quality metrics (readability scores, word count, passive voice)
- [ ] Tag co-occurrence suggestions
- [ ] Internal link suggestions (posts that share themes)

**Phase 2 - AI-Powered (High effort, opt-in):**
- [ ] Text selection → rewrite suggestions
- [ ] Idea expansion from fleeting thoughts
- [ ] Auto-generated descriptions/summaries
- [ ] Tone/style adjustments

**Technical:**
- Phase 1: Pure JavaScript/regex, TF-IDF similarity, local only
- Phase 2: OpenAI/Claude/Ollama, API security, rate limits, graceful degradation

**Design Principle:** Passive presence, no forced interaction, available when needed

---

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

**Quick Wins:** Env config, image path utility, image processing errors

**High Value:** Scheduled publishing, related posts, Idea Development Dashboard

**Future:** Integrated Writing Assistant (Phase 1 → Phase 2), link helper

---

## Completed

- ✅ Test scripts in package.json
- ✅ Error handling standardization
- ✅ Remark42 configuration
