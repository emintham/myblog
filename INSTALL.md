# Installation

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [pnpm](https://pnpm.io/installation)

## Setup

1. **Clone/Use Template:**

   ```bash
   git clone https://github.com/emintham/blog-template.git your-blog-name
   cd your-blog-name
   pnpm install
   ```

2. **Configure:**

   - Set `site` URL in `astro.config.mjs`
   - Update `src/config/index.ts` with your details
   - Customize `src/pages/about.astro`
   - Replace `public/favicon.svg`
   - Create `images/originals/` directory

3. **Clear Example Content (Optional):**

   ```bash
   pnpm clear-posts
   ```

4. **Install Ollama (Required):**

   Required for RAG semantic search and AI writing assistant.

   ```bash
   # Install from https://ollama.com/download
   ollama pull nomic-embed-text    # Embedding model
   ollama pull llama3.2            # Chat model
   ollama serve                    # Start (auto-starts on macOS/Windows)
   ```

   Auto-detected on dev start. Configure model in `src/config/index.ts`.

   Without Ollama: RAG falls back to transformers.js for embeddings; AI assistant shows error.
