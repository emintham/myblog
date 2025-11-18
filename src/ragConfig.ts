/**
 * RAG (Retrieval-Augmented Generation) System Configuration
 *
 * Configure embedding providers, models, and storage for semantic search.
 * Changes to embedding model or dimensions require rebuilding the index: `pnpm rrb`
 */

export const ragConfig = {
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
   * Ollama configuration
   */
  ollama: {
    /**
     * Base URL for Ollama API
     * Default: http://localhost:11434
     */
    baseUrl:
      process.env.OLLAMA_BASE_URL ||
      process.env.OLLAMA_HOST ||
      "http://localhost:11434",

    /**
     * Embedding model to use with Ollama
     * Common options:
     * - nomic-embed-text - Recommended, good quality
     * - mxbai-embed-large - Higher quality, slower
     * - all-minilm - Faster, lower quality
     * - snowflake-arctic-embed - Good balance
     * - bge-large - High quality
     *
     * Dimensions are auto-detected from the model's response.
     * NOTE: Changing this requires rebuilding the index!
     */
    model: process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text",
  },

  /**
   * Transformers.js configuration
   */
  transformers: {
    /**
     * Hugging Face model identifier
     * Default: Xenova/all-MiniLM-L6-v2 (384 dimensions)
     */
    model:
      process.env.TRANSFORMERS_EMBEDDING_MODEL || "Xenova/all-MiniLM-L6-v2",

    /**
     * Embedding dimensions
     */
    dimensions: 384,
  },

  /**
   * Storage configuration
   */
  storage: {
    /**
     * Directory for RAG index storage
     * Default: ./data/rag
     */
    dataDir: process.env.RAG_DATA_DIR || "./data/rag",
  },
} as const;

/**
 * Display RAG configuration on startup
 */
export function logRagConfig(): void {
  console.log("\n🔍 RAG System Configuration:");
  console.log(`   Provider: ${ragConfig.provider}`);
  if (ragConfig.provider === "ollama" || ragConfig.provider === "auto") {
    console.log(`   Ollama URL: ${ragConfig.ollama.baseUrl}`);
    console.log(`   Ollama Model: ${ragConfig.ollama.model} (dimensions auto-detected)`);
  }
  console.log(`   Storage: ${ragConfig.storage.dataDir}`);
  console.log("");
}
