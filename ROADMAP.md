# Project Roadmap

## Maintainability Tasks

### High Priority

#### Replace `any` Types (Medium effort)

**Files:** `usePostSubmission.ts`, `FeedbackDisplay.tsx/.test.tsx`, `CloseReadingAnalyzer.tsx`, `adminApiHelpers.ts`, API test files

- [ ] Create proper type definitions for API responses
- [ ] Type form event handlers and test mocks
- [ ] Replace `any` in catch blocks with `unknown` or Error types
- [ ] Document justified `any` usages

---

### Medium Priority

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

#### Link Helper (Low-Medium effort)

Quick link insertion with internal post search and validation.

- [ ] Quick link dialog (CodeMirror extension)
- [ ] Internal post search (reuse global search)
- [ ] Visual indicators for internal/external links
- [ ] Optional: URL validation, bulk link checker

---

#### Content Suggestions Panel (Medium effort)

Context-aware suggestions for tags, series continuation, internal links.

- [ ] Build search index, use TF-IDF for similarity
- [ ] Tag co-occurrence data + usage statistics
- [ ] Common style/formatting detection
- [ ] Sidebar/collapsible panel with debouncing

---

### Low Priority

#### AI Writing Assistant (High effort)

Opt-in AI for outlines, suggestions, readability, SEO.

**Features:** Outline generation, content improvements, auto-descriptions, readability analysis, tone adjustment

**Options:** OpenAI GPT-4, Anthropic Claude, Ollama (local/private), Grammarly API

**Considerations:** API security, rate limits, privacy, graceful degradation

---

## Implementation Priority

**Quick Wins:** Env config, image path utility, image processing errors

**High Value:** Scheduled publishing, related posts, link helper

**Future:** Content suggestions, AI assistant (opt-in beta)

---

## Completed

- ✅ Test scripts in package.json
- ✅ Error handling standardization
- ✅ Remark42 configuration
