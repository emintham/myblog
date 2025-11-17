This guide explains how to set up the Kinfolk Inspired Astro Blog Template.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended, check Astro's current requirements)
- [pnpm](https://pnpm.io/installation) (This template uses `pnpm` for package management)
- `sharp` and `glob` (installed via `pnpm install` if listed in `package.json`).

## Getting Started

1.  **Use This Template:**
    - Click the green "**Use this template**" button on the [GitHub repository page](https://github.com/emintham/blog-template).
    - Or, clone the repository: `git clone https://github.com/emintham/blog-template.git your-blog-name`
    - Navigate into your new project directory: `cd your-blog-name`

2.  **Install Dependencies:**

    ```bash
    pnpm install
    ```

3.  **Initial Configuration (Important TODOs):**
    - **Site URL:** Open `astro.config.mjs` and set the `site` property to your blog's final URL (e.g., `site: 'https://your-domain.com',`). This is crucial for SEO and sitemap generation.
    - **Site Name & Author Details:** Modify `src/siteConfig.ts` to match your details.
    - **About Page:** Customize the content in `src/pages/about.astro`.
    - **Favicon & Public Assets:** Replace `public/favicon.svg` with your own. Update other assets in `public/` as needed.
    - **Image Source Directory:** Create `images/originals/` in project root for your original images.

4.  **Clear Example Content (Optional):**
    The template may include example posts and quote files. To remove them:

    ```bash
    pnpm run clear-posts
    ```

    _(Clears `src/content/blog/` and `src/content/bookQuotes/`.)_

5.  **Optional: Enhanced Semantic Search with Ollama (Recommended):**

    The blog includes a RAG (Retrieval-Augmented Generation) system for semantic search. By default, it uses a smaller transformer model that downloads automatically. For better quality embeddings, you can optionally install Ollama:
    - **Install Ollama:** Visit [https://ollama.com/download](https://ollama.com/download) and follow instructions for your OS
    - **Pull embedding model:** `ollama pull nomic-embed-text`
    - **Future:** Phase 2 will auto-detect and use Ollama when available (768-dimensional embeddings vs. 384)

    The system works without Ollama, but you'll get higher-quality semantic search results with it installed.
