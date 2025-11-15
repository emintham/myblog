# Future Enhancement Ideas

This document tracks ideas for improving the blog authoring experience. These features are on the wishlist for future implementation.

## Content Suggestions Panel

**Priority:** Medium
**Effort:** Medium
**Impact:** Improves content quality and consistency

### Description
A context-aware suggestions panel that helps writers maintain consistency and quality across posts.

### Features
- **Related Tags**: Analyze post content and suggest relevant tags based on similar posts
- **Series Continuation**: When writing in a series, suggest topics/themes from previous posts
- **Common Issues**: Detect common typos, style inconsistencies, and formatting issues
- **Internal Linking**: Suggest links to previously written posts when similar topics are mentioned
- **Tag Statistics**: Show how often each tag has been used to encourage consistent tagging

### Implementation Notes
- Could use simple text analysis (keyword extraction) or more advanced NLP
- Panel could appear in sidebar or as collapsible section in admin interface
- Make suggestions non-intrusive - easy to dismiss or ignore
- Cache suggestions to avoid re-computing on every keystroke

### Technical Considerations
- Build search index of existing posts for content matching
- Consider using TF-IDF or similar algorithm for content similarity
- Store tag co-occurrence data to suggest related tags
- May need debouncing for real-time suggestions

---

## Link Helper

**Priority:** Medium
**Effort:** Low-Medium
**Impact:** Better internal linking, fewer broken URLs

### Description
Enhanced link insertion workflow that makes it easy to link to internal posts and validates external URLs.

### Features
- **Quick Link Dialog**: Modal/dropdown for inserting links
- **Internal Post Search**: Search existing posts to link internally (show title + description)
- **URL Validation**: Check external URLs for broken links (404 detection)
- **Open Graph Preview**: Fetch and display preview cards for external links
- **Link Type Indication**: Visual indicator for internal vs external vs broken links
- **Bulk Link Checker**: Admin tool to scan all posts for broken links

### Implementation Notes
- Modal could reuse search functionality from global search
- URL validation could happen on save (async check)
- Store OG data in cache to avoid repeated fetches
- Consider using a service like `linkinator` for link checking

### Technical Considerations
- Need to handle markdown link syntax: `[text](url)`
- CodeMirror extension for link insertion UI
- Background job for link validation (don't block saves)
- Rate limiting for external URL checks

---

## Scheduled Publishing

**Priority:** High
**Effort:** Medium
**Impact:** Enables content planning and batch writing

### Description
Ability to schedule posts for future publication, allowing writers to plan content calendars and write ahead.

### Features
- **Future Publish Date**: Set a future date when draft should auto-publish
- **Draft Auto-Publishing**: Cron job or build hook to publish scheduled posts
- **Preview Mode**: Preview how post will appear before going live
- **Timezone Support**: Handle different timezones correctly
- **Publish Queue**: Admin view showing upcoming scheduled posts
- **Manual Override**: Ability to publish scheduled post early or reschedule

### Implementation Notes
- Store `scheduledPublishDate` in frontmatter
- During build, check if current date >= scheduled date
- Could use GitHub Actions cron job to trigger rebuilds
- Alternative: webhook-based system that rebuilds site at scheduled time

### Technical Considerations
- Astro builds are static, so need external trigger for publishing
- Options:
  1. GitHub Actions scheduled workflow (free, simple)
  2. Netlify/Vercel scheduled builds (may have limits)
  3. External cron service that triggers build webhook
- Need to handle timezone conversion correctly
- Update `getCollection` filter to check scheduled date
- Add visual indicator in admin for scheduled posts

### Build Integration
```javascript
// In getCollection filter:
const posts = await getCollection("blog", ({ data }) => {
  const now = new Date();
  const publishDate = data.scheduledPublishDate || data.pubDate;

  if (import.meta.env.PROD) {
    // Only show non-draft posts that have reached their publish date
    return data.draft !== true && publishDate <= now;
  }
  // In dev mode, show everything
  return true;
});
```

---

## AI Writing Assistant

**Priority:** Low-Medium
**Effort:** High
**Impact:** Helps with writer's block, improves quality

### Description
Integration with AI services to assist with writing, editing, and optimization.

### Features
- **Outline Generation**: Generate post outline from title/topic
- **Content Suggestions**: AI-suggested improvements for clarity, tone, grammar
- **Summary Generation**: Auto-generate post description from body content
- **Readability Analysis**: Check reading level, sentence complexity, passive voice
- **SEO Optimization**: Suggest meta descriptions, title improvements
- **Tone Adjustment**: Suggest rewrites for different tones (formal, casual, technical)
- **Expansion Prompts**: When stuck, AI suggests directions to expand current paragraph

### Implementation Notes
- Could integrate with OpenAI API, Claude API, or local models
- Make AI features opt-in (some writers prefer no AI assistance)
- Show AI suggestions inline or in sidebar panel
- Allow accepting/rejecting suggestions individually
- Cost consideration: API calls can be expensive for real-time assistance

### Technical Considerations
- API key management (secure storage, environment variables)
- Rate limiting and cost controls
- Privacy: consider whether post content leaves the system
- Caching AI responses to reduce duplicate API calls
- Graceful degradation if API is unavailable
- Consider local models (e.g., Ollama) for privacy-sensitive content

### Potential APIs
- **OpenAI GPT-4**: Best quality, moderate cost
- **Anthropic Claude**: Good for longer content, structured output
- **Local Models (Ollama)**: Free, private, but requires setup
- **Grammarly API**: Specialized for grammar/style
- **Hemingway API**: Readability scoring

### Example Integration Points
```typescript
// In MarkdownEditor component
const getSuggestions = async (content: string) => {
  const response = await fetch('/api/ai-assist', {
    method: 'POST',
    body: JSON.stringify({
      action: 'improve',
      content
    })
  });
  return response.json();
};
```

---

## Implementation Priority

Based on impact vs. effort:

1. **Scheduled Publishing** (High impact, Medium effort)
   - Most requested feature
   - Enables better workflow for consistent posting
   - Moderate complexity but well-defined scope

2. **Link Helper** (Medium impact, Low-Medium effort)
   - Quick win with immediate UX improvement
   - Prevents common mistakes (broken links)
   - Relatively simple to implement

3. **Content Suggestions Panel** (Medium impact, Medium effort)
   - Helpful for maintaining consistency
   - Can start simple and enhance over time
   - Depends on existing search infrastructure

4. **AI Writing Assistant** (Low-Medium impact, High effort)
   - High complexity and cost considerations
   - Privacy concerns for some users
   - Best implemented after core features are stable
   - Consider as opt-in beta feature first

---

## Notes

- These ideas complement the already-implemented features: auto-save, image upload, draft filtering, and admin search
- Each feature should maintain the minimalist, Kinfolk-inspired aesthetic
- Consider user preferences: some writers want lots of assistance, others prefer minimal UI
- Mobile optimization should be considered for any new admin features
