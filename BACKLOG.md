# Feature Backlog

This file tracks future feature ideas and improvements for the blog template.

## Planned Features

### Related Posts Suggestions

**Priority**: Medium
**Effort**: Moderate

Show 3-5 related posts at the bottom of each post based on shared tags, series membership, or post type. Would increase content discovery.

**Implementation approach:**

- Create utility function to score post similarity based on:
  - Shared tags (weight: high)
  - Same series (weight: very high)
  - Same post type (weight: low)
  - Exclude current post from results
- Add `RelatedPosts.astro` component
- Query and rank posts using the similarity scoring
- Display in a minimal grid/list at bottom of post detail pages
- Consider caching/memoization for performance

**Benefits:**

- Increases reader engagement and time on site
- Improves content discoverability
- Encourages exploration of related topics
