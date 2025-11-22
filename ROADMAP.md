# Project Roadmap

## Completed

- ✅ **Local RAG System** - Semantic search, auto-indexing, Ollama integration, Content Intelligence Dashboard, AI Writing Assistant
- ✅ **Image Processing** - Error handling, directory checks, summary output
- ✅ **Environment Variables** - `.env.example`, config fallbacks

## In Progress

### Refactor Large API Handlers (Medium)

- [ ] Break down `update-post-handler.ts` into smaller functions
- [ ] Extract slug change and quotes logic to separate helpers
- [ ] Add unit tests

## Planned

### Image Path Resolution (Low)

- [ ] Create `src/utils/imagePaths.ts` with path helpers
- [ ] Update ResponsiveImage, adminApiHelpers, process-images

### Scheduled Publishing (Medium)

- [ ] Add `scheduledPublishDate` field
- [ ] Filter by publish date in production
- [ ] Admin visual indicators
- [ ] Rebuild trigger setup

### Link Helper (Low-Medium)

- [ ] Quick link dialog in CodeMirror
- [ ] Internal post search
- [ ] Link validation

## Future RAG Features

- [ ] Content clusters
- [ ] Tag suggester in PostForm
- [ ] Series builder
- [ ] Embedding visualization
- [ ] Writing metrics
