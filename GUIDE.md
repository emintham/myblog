# Usage Guide

## Development

```bash
pnpm dev          # Start dev server at localhost:4321
pnpm dev --host   # Allow network access
```

## Image Processing

1. Place originals in `images/originals/`
2. Run `pnpm img` to generate WebP variants in `public/images/processed/`

## Content Creation

Create posts via `/admin/create-post` in dev mode. Set `draft: false` in frontmatter to publish.

## RAG Index

```bash
pnpm rq "search"  # Query index
pnpm rrb          # Rebuild index
pnpm rst          # View stats
```

**Providers:** Ollama (preferred) or Transformers.js (fallback). Configure in `src/config/index.ts`.

Index stored in `data/rag/` (gitignored). Auto-indexes on save.

## Code Quality

```bash
pnpm fmt          # Format code
pnpm lint         # Check lint errors
pnpm lint:fix     # Auto-fix lint
```

## Deployment

Static site ready for Cloudflare Pages, Vercel, Netlify, or GitHub Pages. Include `public/images/processed/` in deployment.

## Updating from Template

1. Commit changes and export content: `pnpm export-posts`
2. Add upstream: `git remote add template_upstream git@github.com:emintham/blog-template.git`
3. Fetch and merge: `git fetch template_upstream && git merge template_upstream/master`
4. Resolve conflicts (keep your content files), run `pnpm install`, test with `pnpm dev`
5. Restore content if needed: `pnpm import-posts`

## Customization

- **Styles:** `src/styles/global.css`
- **Layouts:** `src/layouts/` and `src/components/`
