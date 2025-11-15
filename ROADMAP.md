# Project Roadmap

Consolidated tasks, features, and improvements for the blog template.

## Current Maintainability Tasks

### High Priority

#### Replace `any` Types with Specific Types

**Effort:** Medium
**Impact:** Improves type safety and prevents bugs

**Files to update:**
- `src/hooks/usePostSubmission.ts`
- `src/components/admin/FeedbackDisplay.tsx`
- `src/components/admin/FeedbackDisplay.test.tsx`
- `src/components/admin/CloseReadingAnalyzer.tsx`
- `src/utils/adminApiHelpers.ts`
- `src/api/__tests__/create-post-handler.test.ts`
- `src/api/__tests__/update-post-handler.test.ts`
- `src/api/__tests__/delete-post-handler.test.ts`

**Tasks:**
- [ ] Create proper type definitions for API responses
- [ ] Type form event handlers properly
- [ ] Type test mocks with accurate interfaces
- [ ] Replace `any` in catch blocks with `unknown` or specific Error types
- [ ] Document any remaining justified `any` usages with comments

---

### Medium Priority

#### Improve Image Processing Script Error Handling

**Effort:** Low
**Impact:** Better developer experience, clearer error messages

**Current state:** Basic error handling exists but could be more robust.

**Tasks:**
- [ ] Add check for missing `images/originals/` directory
- [ ] Handle corrupted/invalid image files gracefully
- [ ] Improve error messages for Sharp processing failures
- [ ] Add summary output (X succeeded, Y failed)
- [ ] Exit with proper exit codes (0 = success, 1 = errors occurred)

---

#### Create Environment Variables Configuration

**Effort:** Low
**Impact:** Better configuration management, easier deployment

**Tasks:**
- [ ] Create `.env.example` with all available configuration options:
  - `SITE_TITLE`
  - `SITE_DESCRIPTION`
  - `AUTHOR_NAME`
  - `REMARK42_HOST`
  - `REMARK42_SITE_ID`
  - `PUBLIC_SITE_URL`
- [ ] Update `src/siteConfig.ts` to read from environment variables with fallbacks
- [ ] Add validation for required environment variables
- [ ] Document in INSTALL.md and CLAUDE.md

---

### Low Priority

#### Create Utility for Image Path Resolution

**Effort:** Low
**Impact:** Reduces code duplication, centralizes configuration

**Tasks:**
- [ ] Create `src/utils/imagePaths.ts` with functions:
  - `getOriginalImagePath(imageName: string): string`
  - `getProcessedImagePath(imageName: string, width: number, format: 'webp' | 'jpg'): string`
  - `getPublicImageUrl(imageName: string, width: number, format: 'webp' | 'jpg'): string`
  - Export `IMAGE_WIDTHS` constant: `[100, 150, 200, 480, 800, 1200, 1600, 1920]`
- [ ] Update components to use utility functions:
  - `ResponsiveImage.astro`
  - `adminApiHelpers.ts`
- [ ] Update `scripts/process-images.mjs` to import `IMAGE_WIDTHS`
- [ ] Add JSDoc comments with usage examples
- [ ] Add unit tests for path resolution

---

## Feature Ideas

### High Priority

#### Scheduled Publishing

**Effort:** Medium
**Impact:** Enables content planning and batch writing

**Description:**
Allow authors to schedule posts for future publication, enabling better content planning.

**Features:**
- [ ] Add `scheduledPublishDate` field to post schema
- [ ] Update `getCollection` filter to check scheduled date vs current date
- [ ] Add visual indicator in admin for scheduled posts
- [ ] Create admin view showing upcoming scheduled posts
- [ ] Add timezone handling
- [ ] Setup automated rebuild trigger:
  - Option 1: GitHub Actions scheduled workflow
  - Option 2: Netlify/Vercel scheduled builds
  - Option 3: External cron service with webhook

**Build filter example:**
```javascript
const posts = await getCollection("blog", ({ data }) => {
  const now = new Date();
  const publishDate = data.scheduledPublishDate || data.pubDate;

  if (import.meta.env.PROD) {
    return data.draft !== true && publishDate <= now;
  }
  return true;
});
```

---

#### Related Posts Suggestions

**Effort:** Medium
**Impact:** Increases reader engagement and content discovery

**Description:**
Display 3-5 related posts at the bottom of each post based on shared tags, series membership, or post type.

**Implementation:**
- [ ] Create `src/utils/relatedPosts.ts` with similarity scoring:
  - Same series (weight: very high)
  - Shared tags (weight: high)
  - Same post type (weight: low)
  - Exclude current post from results
- [ ] Create `RelatedPosts.astro` component
- [ ] Add to post detail pages
- [ ] Consider caching/memoization for performance
- [ ] Make number of related posts configurable

---

### Medium Priority

#### Link Helper

**Effort:** Low-Medium
**Impact:** Better internal linking, fewer broken URLs

**Description:**
Enhanced link insertion workflow for easier internal linking and URL validation.

**Features:**
- [ ] Quick link dialog for inserting links
- [ ] Internal post search (reuse existing search infrastructure)
- [ ] Show post title + description in search results
- [ ] Visual indicator for internal vs external links
- [ ] Optional: URL validation for external links (404 detection)
- [ ] Optional: Bulk link checker admin tool

**Technical notes:**
- Reuse search functionality from global search
- CodeMirror extension for link insertion UI
- Handle markdown link syntax: `[text](url)`

---

#### Content Suggestions Panel

**Effort:** Medium
**Impact:** Improves content quality and consistency

**Description:**
Context-aware suggestions panel to help writers maintain consistency.

**Features:**
- [ ] Related tags based on post content analysis
- [ ] Series continuation suggestions (when writing in a series)
- [ ] Common style/formatting issue detection
- [ ] Internal linking suggestions (similar topics)
- [ ] Tag usage statistics
- [ ] Make suggestions non-intrusive (easy to dismiss)

**Implementation:**
- [ ] Build search index of existing posts
- [ ] Use TF-IDF or similar for content similarity
- [ ] Store tag co-occurrence data
- [ ] Add debouncing for real-time suggestions
- [ ] Display in sidebar or collapsible panel

---

### Low Priority

#### AI Writing Assistant

**Effort:** High
**Impact:** Helps with writer's block, improves quality

**Description:**
Optional AI integration to assist with writing, editing, and optimization.

**Features:**
- [ ] Outline generation from title/topic
- [ ] Content improvement suggestions
- [ ] Auto-generate post description from body
- [ ] Readability analysis
- [ ] SEO optimization suggestions
- [ ] Tone adjustment suggestions
- [ ] Expansion prompts when stuck

**Considerations:**
- Make AI features opt-in
- API key management and security
- Rate limiting and cost controls
- Privacy considerations (content leaving system)
- Consider local models (Ollama) for privacy
- Graceful degradation if API unavailable

**Potential APIs:**
- OpenAI GPT-4 (best quality, moderate cost)
- Anthropic Claude (good for longer content)
- Local models via Ollama (free, private)
- Grammarly API (specialized grammar/style)

---

## Implementation Priorities

### Quick Wins (Low Effort, High Impact)
1. Environment variables configuration
2. Image path resolution utility
3. Image processing error handling

### High Value (Medium Effort, High Impact)
1. Scheduled publishing
2. Related posts suggestions
3. Link helper

### Future Enhancements (Higher Effort)
1. Content suggestions panel
2. AI writing assistant (consider as opt-in beta)

---

## Completed Tasks

The following tasks have been completed and removed from active tracking:

- ✅ Add test scripts to package.json (test, test:ui, test:run)
- ✅ Standardize error handling patterns (createErrorResponse/createSuccessResponse)
- ✅ Remark42 configuration centralization (using siteConfig.ts)

---

## Notes

- Tasks are organized by priority and effort
- Quick wins should be tackled first for immediate value
- High-value features require more planning and user feedback
- All new features should maintain the minimalist aesthetic
- Consider mobile optimization for admin features
- Some writers prefer minimal UI - make features opt-in where appropriate
