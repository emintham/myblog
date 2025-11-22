# Changelog

## Nov 18, 2025

- Added AI Writing Assistant panel in PostForm with Ollama integration (RAG Phase 4B).
- Collapsible sidebar assistant with chat interface for brainstorming and editing help.
- Context-aware AI responses using current post content and RAG-powered related content.
- Prompt library system via YAML configuration with 11 built-in prompts.
- SQLite-based conversation history persistence per post/session.
- Three context modes: current post only, post + related content, or no context.
- Insert AI responses directly into markdown editor with one click.
- Error handling when Ollama is unavailable with helpful setup instructions.
- Added Ollama integration for RAG system (Phase 3).
- RAG system now supports dual embedding providers: Ollama HTTP API (preferred) and Transformers.js (fallback).
- Automatic provider detection via Ollama's HTTP API with graceful fallback to ensure zero-config operation.
- Created consolidated configuration in `src/config/index.ts` for all app settings.
- RAG configuration displays on dev server start showing active provider and model.
- Configurable Ollama embedding model via `OLLAMA_EMBEDDING_MODEL` (defaults to `nomic-embed-text`).
- Auto-detect embedding dimensions from Ollama API - no manual configuration needed.
- Enhanced logging shows embedding model and dimensions for both providers.
- Created `.env.example` with RAG configuration options.

## Nov 16, 2025

- Auto-bump publication date when posts transition from draft to published.
- Hide publication date from admin form (auto-populated in background).
- Add lastEdited field that auto-updates on every post save (not shown in form).
- Display "Updated" date next to publication date when post has been edited (skips if same as pub date).

## Nov 15, 2025

- Added collapsible sections to admin form (Core Information, Metadata, Book Note Details, Content).
- Added draft status filter to manage-posts page with post count display.
- Updated search to link directly to edit pages when in admin mode.

## Nov 14, 2025

- Added full-text search with keyboard shortcuts (⌘K/Ctrl+K).
- Added pagination to home page (10 posts per page).
- Added series navigation with prev/next links and progress indicators.

## Oct 28, 2025

- Added drag-and-drop image upload with custom filename, automatic processing, and ResponsiveImage component insertion.
- Auto-convert posts to .mdx when components are detected.

## Oct 26, 2025

- Fixed auto-save page refresh and cursor reset by ignoring content directory from Vite HMR.
- Reduced auto-save interval to 10 seconds.
- Added toast notifications for save feedback.
- Added Zod validation schemas for API handlers.
- Replaced textarea with CodeMirror 6 editor for markdown editing with syntax highlighting and collapsible headings.

## Oct 19, 2025

- Added TOC component.

## May 16, 2025

- Added support for marking articles as part of a series for better discovery.
- Added support for marking article tags for better discovery.
- Added styling for blockquotes.
- Fixed new-post script.
- Mark all example posts as drafts so that they are not accidentally published in prod but show up in dev.
- Make sidenote link style more apparent.
- Extract site-wide variables into a separate file for easier management.

## May 17

- Add Remark42 commenting system.
- Style changes.

## May 18

- Added support for shorter posts "fleeting".

## May 19

- Added support for book notes, quotes.

## May 21

- Script to process images for CLS.
- Using `srcset` for images, custom component.

## May 22

- Filter out draft posts in the index for PROD.

## May 23

- Generate alt text for book cover.

## May 25

- Jules cleaned up CSS and some components.
- Big update: Added support for dev mode authoring.

## May 31

- Big update: separate modes for author/reader
- Refactors.
- Tests.
- V1 of close reading function.
