# Utilities Directory

This directory contains utility functions organized by purpose.

## File Organization

### API Utilities

- **`api-helpers.ts`** - General-purpose API utilities for both client and server
  - Error handling (`extractErrorMessage`)
  - Production guards (`createProductionGuard`)
  - Fetch utilities (`validateFetchResponse`, `fetchWithTimeout`)
  - Used by: Hooks, API endpoints, components

- **`adminApiHelpers.ts`** - Server-side admin API transformation logic
  - Post payload transformations (`transformApiPayloadToFrontmatter`)
  - File content generation (`generatePostFileContent`)
  - Image metadata extraction
  - Used by: Admin API handlers (create-post, update-post)

**Note:** These files serve different purposes and should not be consolidated.

### Content Utilities

- **`contentUtils.ts`** - Content collection helpers
  - Tag extraction (`getUniqueTagNames`)
  - Series extraction (`getUniqueSeriesNames`)

- **`seriesUtils.ts`** - Series navigation logic
  - Get series posts and navigation

- **`content.ts`** - Content processing
  - Preview extraction
  - Content truncation

### Form & Data Utilities

- **`slugify.ts`** - Slug generation from titles

- **`searchUtils.ts`** - Search index and Fuse.js integration

### UI Utilities

- **`clipboard.ts`** - Clipboard operations
- **`formatting.ts`** - Text formatting helpers
- **`navigation.ts`** - Navigation helpers
- **`prompts.ts`** - Prompt library loading (YAML)

### Image Utilities

- **`imagePaths.ts`** - Image path resolution (future - see ROADMAP)
