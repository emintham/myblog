/**
 * Centralized application configuration
 *
 * All configuration is consolidated here for easier maintenance.
 * Environment variables can override defaults (see .env.example).
 */

export const config = {
  site: {
    title: import.meta.env?.SITE_TITLE || "Your Awesome Blog Name",
    description:
      import.meta.env?.SITE_DESCRIPTION ||
      "A thoughtful space for [your topics here].",
    author: import.meta.env?.AUTHOR_NAME || "Your Name",
    url: import.meta.env?.PUBLIC_SITE_URL || "",
    adminPrefix: "/admin",
  },

  ollama: {
    /**
     * Base URL for Ollama HTTP API
     * Default: http://localhost:11434
     */
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",

    /**
     * Model to use for chat (AI assistant)
     * Default: llama3.2
     */
    chatModel: process.env.OLLAMA_MODEL || "llama3.2",

    /**
     * Model to use for embeddings (RAG)
     * Common options: nomic-embed-text, mxbai-embed-large, all-minilm
     * NOTE: Changing this requires rebuilding the index: `pnpm rrb`
     */
    embeddingModel: process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text",

    /**
     * Request timeout in milliseconds
     */
    timeout: 60000,
  },

  rag: {
    /**
     * Embedding provider selection
     * - "auto": Auto-detect Ollama, fallback to transformers.js
     * - "ollama": Force Ollama (requires Ollama running)
     * - "transformers": Force transformers.js (zero-config, offline)
     */
    provider: (process.env.RAG_EMBEDDING_PROVIDER as
      | "auto"
      | "ollama"
      | "transformers") || "auto",

    /**
     * Directory for RAG index storage
     */
    dataDir: process.env.RAG_DATA_DIR || "./data/rag",

    /**
     * Transformers.js configuration (fallback provider)
     */
    transformers: {
      model: "Xenova/all-MiniLM-L6-v2",
      dimensions: 384,
    },
  },

  remark42: {
    host:
      import.meta.env?.REMARK42_HOST ||
      "https://YOUR_REMARK42_SERVER_DOMAIN.com",
    siteId: import.meta.env?.REMARK42_SITE_ID || "remark",
  },
} as const;

// Convenience exports for common values
export const SITE_TITLE = config.site.title;
export const SITE_DESCRIPTION = config.site.description;
export const AUTHOR_NAME = config.site.author;
export const PUBLIC_SITE_URL = config.site.url;
export const ADMIN_PATH_PREFIX = config.site.adminPrefix;
export const REMARK42_HOST = config.remark42.host;
export const REMARK42_SITE_ID = config.remark42.siteId;

// Legacy export for backwards compatibility during migration
export const OLLAMA_CONFIG = config.ollama;
export const ragConfig = {
  provider: config.rag.provider,
  ollama: {
    baseUrl: config.ollama.baseUrl,
    model: config.ollama.embeddingModel,
  },
  transformers: config.rag.transformers,
  storage: {
    dataDir: config.rag.dataDir,
  },
};

/**
 * Display RAG configuration on startup
 */
export function logRagConfig(): void {
  console.log("\n🔍 RAG System Configuration:");
  console.log(`   Provider: ${config.rag.provider}`);
  if (config.rag.provider === "ollama" || config.rag.provider === "auto") {
    console.log(`   Ollama URL: ${config.ollama.baseUrl}`);
    console.log(
      `   Ollama Model: ${config.ollama.embeddingModel} (dimensions auto-detected)`
    );
  }
  console.log(`   Storage: ${config.rag.dataDir}`);
  console.log("");
}
