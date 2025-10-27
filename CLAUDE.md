# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An Astro-powered minimalist blog template inspired by Kinfolk magazine, featuring advanced content management for writers and knowledge curators. The codebase supports three distinct post types (standard posts, fleeting thoughts, book notes) with sophisticated tagging and series organization.

## Commands

### Development
```bash
pnpm dev          # Start Astro dev server with hot-reload
pnpm start        # Alias for pnpm dev
pnpm preview      # Preview production build locally
```

### Build & Deploy
```bash
pnpm build        # Build static site for production (outputs to dist/)
```

### Code Quality
```bash
pnpm fmt          # Format code with Prettier (includes Astro files)
pnpm check-format # Check formatting without modifying files
pnpm lint         # Run ESLint on JS/TS/Astro files
pnpm lint:fix     # Auto-fix linting issues
pnpm style:fix    # Fix CSS/SCSS with Stylelint
```

### Content Management Scripts
```bash
pnpm new-post     # Interactive CLI to create new blog post
pnpm clear-posts  # Remove all posts (use with caution)
pnpm export-posts # Export posts to external format
pnpm import-posts # Import posts from external source
pnpm img          # Process images: convert to WebP, generate responsive variants
```

### Testing
Tests use Vitest with jsdom environment. Run tests with:
```bash
pnpm vitest       # Run tests in watch mode
pnpm vitest run   # Run tests once
pnpm vitest --ui  # Open Vitest UI
```

Test files are located in `src/utils/*.test.ts`, `src/components/admin/*.test.tsx`, and `src/api/__tests__/*.test.ts`.

### Testing Guidelines

**Focus on high-value tests. Avoid:**
- Testing obvious behavior (e.g., "should handle strings that are already slugs")
- Duplicate test cases with slight variations
- Implementation details (e.g., "should ensure a final newline character")
- Edge cases with no production impact (e.g., "should handle very long strings" when no limit exists)
- Trivial empty/undefined variations already covered by other tests

**Prioritize:**
- Core business logic and transformations
- API handlers and critical paths
- Edge cases that could cause production bugs
- Validation and error handling

**Keep tests concise and meaningful.**

## Development Practices

### Git Commit Messages

**Keep commit messages concise.** Follow this format:

```
type: brief description (50 chars or less)

- Bullet point 1 (concise)
- Bullet point 2 (concise)
- Bullet point 3 (concise)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Examples:**
- Good: "feat: add toast notifications for save feedback"
- Too verbose: "feat: add toast notifications to provide user feedback when saving posts in the admin interface"

**Changelog entries** should also be concise, following the style of existing entries.

## Architecture Overview

### Content Type System

The codebase implements three distinct post types with conditional rendering throughout:

**1. Standard Posts** (`postType: "standard"`)
- Traditional long-form blog articles
- Full metadata display (tags, series, comments)
- Truncated previews with "Read more" links

**2. Fleeting Thoughts** (`postType: "fleeting"`)
- Short-form posts for quick insights
- Fully displayed in preview cards (no truncation)
- Minimal metadata display

**3. Book Notes** (`postType: "bookNote"`)
- Specialized content type for book reviews and knowledge curation
- Requires: `bookTitle`, `bookAuthor`, `bookCover` (image metadata), `bookTags`
- Associated quotes stored in separate YAML files via `quotesRef` field
- Rich display with book cover image, collapsible quotes section
- Distinct preview cards and detail pages

**Critical Pattern:** Always check `postType` when adding features that render or process posts. Components like `PostPreview.astro` act as routers that dispatch to type-specific implementations.

### Four Parallel Tagging Systems

1. **General Post Tags** (`tags` field) - Categorize all post types, displayed at `/tags/`
2. **Book Tags** (`bookTags` field) - Only on bookNote posts, displayed at `/book-tags/`
3. **Quote Tags** (on individual quotes in YAML) - Tag quotes within books, displayed at `/quote-tags/`
4. **Series** (`series` field) - Group related posts chronologically, displayed at `/series/`

**Implementation:** All tag systems use shared utilities in `src/utils/contentUtils.ts` (`getUniqueValuesFromCollection()`), ensuring consistent behavior across tag types.

### Content-to-File Relationship

**Posts:** `src/content/blog/{slug}.md` (or `.mdx`)
- Frontmatter validated by Zod schema in `src/content/config.ts`
- Content rendered via Astro's Content Collections API
- File name = slug (generated via `src/utils/slugify.ts`)

**Book Quotes:** `src/content/bookQuotes/{quotesRef}.yaml`
- Separate data collection referenced by `quotesRef` field in book note frontmatter
- Each quote has: `text`, `tags[]`, `quoteAuthor`, `quoteSource`
- Loaded via `getEntry("bookQuotes", quotesRef)` in book note pages

**Images:** Three-layer system
1. Place originals in `images/originals/`
2. Run `pnpm img` to generate responsive variants in `public/images/processed/`
3. Reference in frontmatter as `imageName: "filename-base"` (without extension)
4. `ResponsiveImage.astro` component generates `<picture>` elements with WebP + fallbacks

### Development-Only Admin Interface

**Access:** `/admin/*` routes (automatically disabled in production builds)

**Pages:**
- `/admin/create-post` - Form to create new posts with auto-save
- `/admin/edit/[slug]` - Edit existing posts
- `/admin/manage-posts` - List all posts with edit/delete actions
- `/admin/analyze` - Rhetorical analysis tool

**Auto-Save System:**
- Runs every 2 minutes when form body content changes
- Silent saves (no UI feedback unless error)
- Uses same API handlers as manual submit
- Implemented via `useAutoSave()` hook in `src/hooks/useAutoSave.ts`

**Important:** Admin pages are server-rendered (`prerender = false`). They read/write files directly via Node.js fs module, which only works in dev mode.

### API Handler Architecture

Three POST endpoints handle file system operations:

**`/api/create-post-handler`**
- Validates input, generates slug, checks for conflicts
- Transforms form data → frontmatter object → YAML string
- Writes markdown file to `src/content/blog/`
- If bookNote: also creates matching `bookQuotes/{quotesRef}.yaml`

**`/api/update-post-handler`**
- Handles slug changes (renames file if title changed)
- Updates existing file with new content
- Deletes old file if slug changed
- If bookNote: updates/creates associated quotes file

**`/api/delete-post-handler`**
- Deletes markdown file from `src/content/blog/`
- If bookNote: also deletes associated quotes YAML file

**Data Flow:**
```
PostFormData (React state)
  → PostApiPayload (JSON)
  → FrontmatterObject (with type coercion)
  → YAML string + markdown body
  → File system write
```

Type definitions in `src/types/admin.d.ts` document each transformation step.

### React Component Integration

**Pattern:** Astro components for static content, React components for interactivity

**Key React Components:**
- `PostForm.tsx` - Master form using react-hook-form
- `TagsComponent.tsx` - Multi-select creatable dropdown (react-select)
- `SeriesComponent.tsx` - Single-select creatable dropdown
- `InlineQuotesManager.tsx` - Dynamic quote editor for book notes
- `FeedbackDisplay.tsx` - Event-driven submission feedback

**Hydration:** All admin components use `client:load` directive for immediate interactivity

**State Management:**
- Forms use react-hook-form for validation and submission
- Custom hooks (`usePostFormInitialization`, `useInlineQuotes`, `usePostSubmission`, `useAutoSave`) encapsulate complex logic
- Event-driven pattern for form feedback (custom events: `postFormSubmitting`, `postFormSuccess`, `postFormError`)

### Image Processing Workflow

**Manual Process:**
1. Add original image to `images/originals/` (any size, JPG/PNG)
2. Update post frontmatter: `bookCover: { imageName: "filename-base", alt: "...", originalWidth: 1200 }`
3. Run `pnpm img` to generate responsive variants

**Script Behavior (`scripts/process-images.mjs`):**
- Uses Sharp library to generate WebP + JPG variants
- Target widths: [100, 150, 200, 480, 800, 1200, 1600, 1920]
- Skips widths larger than original image
- Outputs to `public/images/processed/filename-{width}w.{webp|jpg}`

**API Auto-Processing (Book Covers):**
- When creating/updating book notes via admin, API handler reads original image
- Automatically extracts `originalWidth` using Sharp
- Stores in frontmatter so ResponsiveImage knows which variants exist

**Display (`ResponsiveImage.astro`):**
- Generates `<picture>` element with media queries
- Provides WebP with JPG fallback
- Uses `originalWidth` to optimize srcset generation

## Development Patterns

### Adding a New Post Type

If you need to add a fourth post type (e.g., "podcast"):

1. **Update Schema:** `src/content/config.ts` - add to `postType` enum
2. **Update Types:** `src/types/admin.d.ts` - add conditional fields
3. **Create Preview Component:** `src/components/PodcastPreview.astro`
4. **Update Router:** `src/components/PostPreview.astro` - add case for "podcast"
5. **Update Form:** `src/components/admin/PostForm.tsx` - add conditional fields
6. **Update API Handlers:** Handle podcast-specific logic in create/update/delete handlers
7. **Add Dedicated Page:** `src/pages/podcasts.astro` for filtered listing

### Adding a New Tag System

Pattern to follow (see existing book tags/quote tags implementation):

1. **Add Field:** Update schema in `src/content/config.ts`
2. **Extract Values:** Use `getUniqueValuesFromCollection()` in `contentUtils.ts`
3. **Create Pages:**
   - Index: `src/pages/new-tag-type/index.astro`
   - Detail: `src/pages/new-tag-type/[tag].astro`
4. **Update Form:** Add tag input component in `PostForm.tsx`
5. **Display:** Show tags in preview/detail components

### Working with Content Collections

**Always use Astro's Content Collections API:**
```typescript
import { getCollection, getEntry } from "astro:content";

// Get all posts (with filtering)
const posts = await getCollection("blog", ({ data }) => {
  return import.meta.env.PROD ? data.draft !== true : true;
});

// Get single post
const post = await getEntry("blog", slug);
```

**Never** read markdown files directly with fs - this bypasses schema validation and content processing.

### Slug Generation

All slugs generated via `src/utils/slugify.ts`:
- Converts to lowercase
- Replaces spaces/special chars with hyphens
- Removes non-alphanumeric (except hyphens)
- Deduplicates consecutive hyphens
- Fallback: "untitled-post" if empty

**Important:** When updating titles, API handlers regenerate slugs, which can change file names and URLs. The update handler manages this gracefully.

### Form Submission Flow

**Manual Submit:**
1. User clicks Save/Update button
2. `usePostSubmission()` hook receives form data
3. Transforms to `PostApiPayload`, sends POST to API
4. API handler processes, writes files
5. Custom events dispatched (`postFormSuccess`/`postFormError`)
6. `FeedbackDisplay` shows feedback
7. Form resets (create) or refills with saved data (edit)

**Auto-Save:**
1. `useAutoSave()` hook checks every 2 minutes
2. Compares current body with last saved body
3. If changed (and title exists), triggers submit with `isAutoSave = true`
4. Same API flow, but no form reset
5. Updates `lastSavedBodyContent` to prevent navigation issues

## Configuration

### Site URL
Update `site` in `astro.config.mjs` before deploying:
```javascript
site: "https://your-actual-domain.com"
```
Used for sitemap generation and canonical URLs.

### Build Exclusions
Test files are excluded from builds via:
```javascript
exclude: ["**/__tests__/**", "**/*.test.ts", "**/*.spec.ts"]
```

### Integrations
- `@astrojs/sitemap` - Auto-generates sitemap.xml
- `@astrojs/mdx` - Enables MDX in content (components in markdown)
- `@astrojs/react` - Enables React component integration

## Important Files Reference

| Concern | Key Files |
|---------|-----------|
| Content schemas | `src/content/config.ts` |
| Type definitions | `src/types/admin.d.ts` |
| Slug generation | `src/utils/slugify.ts` |
| Tag utilities | `src/utils/contentUtils.ts` |
| Content preview extraction | `src/utils/content.ts` |
| API transformation logic | `src/utils/adminApiHelpers.ts` |
| Form state management | `src/components/admin/PostForm.tsx`, `src/hooks/*.ts` |
| Post routing | `src/components/PostPreview.astro` |
| Image processing | `scripts/process-images.mjs`, `src/components/ResponsiveImage.astro` |
| API handlers | `src/pages/api/*-handler.ts` |

## Known Patterns to Maintain

**1. Event-Driven Form Feedback**
Forms dispatch custom events rather than managing UI state directly. This allows multiple listeners and clean separation.

**2. Ref-Based Data Relationships**
Book notes use `quotesRef` to link to external YAML files rather than embedding quotes in frontmatter. This keeps quotes independently manageable.

**3. Type-Based Component Dispatch**
Router components (like `PostPreview.astro`) check `postType` and render appropriate component. Never use if/else chains - use component selection pattern.

**4. Utility-First Tag Processing**
Generic `getUniqueValuesFromCollection()` underlies all tag systems. When adding new taxonomies, create a facade function that calls this utility rather than reimplementing logic.

**5. Conditional Field Rendering**
Form fields that only apply to certain post types are wrapped in conditional blocks that watch the `postType` field via react-hook-form's `watch()`.

**6. Production Environment Guards**
Admin pages and API routes check `import.meta.env.PROD` and return 404/403 in production. Never remove these guards.

**7. Static Generation with Filtering**
Use `getCollection()` with predicate functions to filter drafts in production while showing them in development.
