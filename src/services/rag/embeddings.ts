/**
 * Embedding providers for RAG system
 *
 * Supports transformers.js as the primary provider
 * Future: Ollama MCP integration (Phase 2)
 */

import { pipeline, Pipeline } from "@xenova/transformers";

export interface EmbeddingProvider {
  name: string;
  dimensions: number;
  embed(texts: string[]): Promise<number[][]>;
  embedSingle(text: string): Promise<number[]>;
}

/**
 * Transformers.js embedding provider (fallback, zero-config)
 */
class TransformersEmbeddingProvider implements EmbeddingProvider {
  name = "transformers";
  dimensions = 384;
  private model = "Xenova/all-MiniLM-L6-v2";
  private embedder: Pipeline | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the embedding model (lazy loading)
   */
  private async initialize(): Promise<void> {
    if (this.embedder) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        console.log(`[RAG] Initializing ${this.model}...`);
        this.embedder = await pipeline("feature-extraction", this.model);
        console.log(`[RAG] Model loaded successfully`);
      } catch (error) {
        console.error("[RAG] Failed to initialize embedding model:", error);
        throw new Error(`Failed to load embedding model: ${error}`);
      }
    })();

    return this.initPromise;
  }

  /**
   * Generate embeddings for multiple texts
   */
  async embed(texts: string[]): Promise<number[][]> {
    await this.initialize();

    if (!this.embedder) {
      throw new Error("Embedding model not initialized");
    }

    try {
      const embeddings: number[][] = [];

      // Process in batches to avoid memory issues
      const batchSize = 10;
      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const batchEmbeddings = await Promise.all(
          batch.map((text) => this.embedSingle(text))
        );
        embeddings.push(...batchEmbeddings);

        // Log progress for large batches
        if (texts.length > 20 && (i + batchSize) % 50 === 0) {
          console.log(`[RAG] Embedded ${i + batchSize}/${texts.length} texts`);
        }
      }

      return embeddings;
    } catch (error) {
      console.error("[RAG] Error generating embeddings:", error);
      throw error;
    }
  }

  /**
   * Generate embedding for a single text
   */
  async embedSingle(text: string): Promise<number[]> {
    await this.initialize();

    if (!this.embedder) {
      throw new Error("Embedding model not initialized");
    }

    try {
      // Truncate very long texts to avoid performance issues
      const maxLength = 512;
      const truncated =
        text.length > maxLength ? text.slice(0, maxLength) : text;

      const output = await this.embedder(truncated, {
        pooling: "mean",
        normalize: true,
      });

      // Extract the embedding vector from the output
      const embedding = Array.from(output.data) as number[];

      return embedding;
    } catch (error) {
      console.error("[RAG] Error generating single embedding:", error);
      throw error;
    }
  }
}

/**
 * Get the active embedding provider
 *
 * Future: Will auto-detect Ollama MCP and fall back to transformers.js
 * For now, always returns transformers.js provider
 */
export async function getEmbeddingProvider(): Promise<EmbeddingProvider> {
  // Check for environment variable override
  const forcedProvider = process.env.RAG_EMBEDDING_PROVIDER;

  if (forcedProvider === "transformers") {
    console.log("[RAG] Using transformers.js provider (forced by env)");
    return new TransformersEmbeddingProvider();
  }

  // Phase 2: Add Ollama MCP detection here
  // const ollamaProvider = await detectOllamaMCP();
  // if (ollamaProvider) {
  //   console.log('[RAG] Using Ollama MCP provider');
  //   return ollamaProvider;
  // }

  // Default to transformers.js
  console.log("[RAG] Using transformers.js provider (default)");
  return new TransformersEmbeddingProvider();
}

/**
 * Compute cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}
