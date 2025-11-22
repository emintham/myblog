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
    - **Site Name & Author Details:** Modify `src/config/index.ts` to match your details.
    - **About Page:** Customize the content in `src/pages/about.astro`.
    - **Favicon & Public Assets:** Replace `public/favicon.svg` with your own. Update other assets in `public/` as needed.
    - **Image Source Directory:** Create `images/originals/` in project root for your original images.

4.  **Clear Example Content (Optional):**
    The template may include example posts and quote files. To remove them:

    ```bash
    pnpm run clear-posts
    ```

    _(Clears `src/content/blog/` and `src/content/bookQuotes/`.)_

5.  **Install Ollama (Required):**

    The blog includes a RAG (Retrieval-Augmented Generation) system for semantic search and an AI writing assistant powered by Ollama. Ollama is a required dependency for full functionality.

    - **Install Ollama:** Visit [https://ollama.com/download](https://ollama.com/download) and follow instructions for your OS
    - **Pull embedding model:** `ollama pull nomic-embed-text` (or any other embedding model like `mxbai-embed-large`, `snowflake-arctic-embed`, etc.)
    - **Pull chat model (for AI assistant):** `ollama pull llama3.2` (or any other chat model)
    - **Start Ollama:** Run `ollama serve` (or Ollama starts automatically on macOS/Windows)
    - **Automatic detection:** The RAG system will auto-detect Ollama, the model, and embedding dimensions
    - **Configuration:** Edit `src/config/index.ts` to change the embedding model (no need to specify dimensions!)
    - **On dev start:** The system displays active provider and model configuration

    **Note:** Without Ollama, the RAG content intelligence dashboard and AI writing assistant will display error messages. The RAG system has a fallback to transformers.js for embeddings, but the AI assistant requires Ollama.
