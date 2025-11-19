/**
 * Embedding providers for RAG system
 *
 * Supports:
 * - Ollama (preferred, better quality via HTTP API)
 * - Transformers.js (fallback, zero-config)
 */

import { pipeline, Pipeline } from "@xenova/transformers";
import { ragConfig } from "../../ragConfig.js";

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
 * Ollama embedding provider (preferred, better quality)
 * Uses Ollama's HTTP API directly
 */
class OllamaEmbeddingProvider implements EmbeddingProvider {
  name = "ollama";
  dimensions = 0; // Will be auto-detected on first use
  private model: string;
  private baseUrl: string;

  constructor(
    baseUrl = ragConfig.ollama.baseUrl,
    model = ragConfig.ollama.model
  ) {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  /**
   * Generate embeddings for multiple texts
   */
  async embed(texts: string[]): Promise<number[][]> {
    try {
      const embeddings: number[][] = [];

      // Process in batches to avoid overwhelming the server
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
      console.error("[RAG] Error generating embeddings via Ollama:", error);
      throw error;
    }
  }

  /**
   * Generate embedding for a single text
   */
  async embedSingle(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          prompt: text,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Ollama API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.embedding || !Array.isArray(data.embedding)) {
        throw new Error("Invalid response from Ollama API");
      }

      // Auto-detect dimensions on first use
      if (this.dimensions === 0) {
        this.dimensions = data.embedding.length;
        console.log(
          `[RAG] Auto-detected embedding dimensions: ${this.dimensions}d for model '${this.model}'`
        );
      }

      // Validate dimensions match expected
      if (data.embedding.length !== this.dimensions) {
        throw new Error(
          `Embedding dimension mismatch: expected ${this.dimensions}d, got ${data.embedding.length}d`
        );
      }

      return data.embedding;
    } catch (error) {
      console.error(
        "[RAG] Error generating single embedding via Ollama:",
        error
      );
      throw error;
    }
  }
}

/**
 * Check if Ollama is available via HTTP API
 */
async function isOllamaAvailable(
  baseUrl = ragConfig.ollama.baseUrl,
  requiredModel = ragConfig.ollama.model
): Promise<boolean> {
  // Skip auto-detection in test environment for faster tests
  if (process.env.VITEST || process.env.NODE_ENV === "test") {
    return false;
  }

  try {
    // Set a timeout for the health check
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${baseUrl}/api/tags`, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return false;
    }

    // Check if the configured model is available
    const data = await response.json();
    const hasModel = data.models?.some((m: { name: string }) =>
      m.name.includes(requiredModel)
    );

    if (!hasModel) {
      console.log(
        `[RAG] Ollama detected but model '${requiredModel}' not found. Run: ollama pull ${requiredModel}`
      );
    }

    return hasModel;
  } catch {
    // Ollama not available (connection refused, timeout, etc.)
    return false;
  }
}

/**
 * Get the active embedding provider
 *
 * Auto-detects Ollama and falls back to transformers.js
 * If an existing index is found, prioritizes matching its provider/dimensions
 */
export async function getEmbeddingProvider(
  existingMetadata?: { embeddingModel: string; embeddingDim: number } | null
): Promise<EmbeddingProvider> {
  const provider = ragConfig.provider;

  // If there's existing metadata, try to match it first (unless explicitly forced)
  if (existingMetadata && provider === "auto") {
    const { embeddingModel, embeddingDim } = existingMetadata;
    console.log(
      `[RAG] Found existing index: ${embeddingModel} (${embeddingDim}d)`
    );

    // Check if it's a transformers model
    if (embeddingDim === 384) {
      console.log(
        "[RAG] Using transformers.js provider to match existing index"
      );
      return new TransformersEmbeddingProvider();
    }

    // Check if it's an Ollama model (768d for nomic-embed-text, 1024d for mxbai-embed-large)
    if (embeddingDim === 768 || embeddingDim === 1024) {
      const ollamaAvailable = await isOllamaAvailable();
      if (ollamaAvailable) {
        console.log("[RAG] Using Ollama provider to match existing index");
        const provider = new OllamaEmbeddingProvider();
        // Set dimensions from existing index to avoid auto-detection
        provider.dimensions = embeddingDim;
        console.log(
          `[RAG] Detected: ${embeddingDim}d for model '${embeddingModel}'`
        );
        return provider;
      } else {
        console.warn(
          `[RAG] Existing index uses Ollama (${embeddingDim}d) but Ollama is not available!`
        );
        console.warn(
          "[RAG] Please start Ollama or rebuild index with transformers.js"
        );
        console.warn(
          "[RAG] To force transformers.js: Set RAG_EMBEDDING_PROVIDER=transformers and run 'pnpm rrb'"
        );
        throw new Error(
          "Existing index requires Ollama but it's not available. Start Ollama or rebuild index."
        );
      }
    }

    console.warn(
      `[RAG] Unknown embedding dimension: ${embeddingDim}d. Will auto-detect provider.`
    );
  }

  if (provider === "transformers") {
    console.log("[RAG] Using transformers.js provider (forced by config)");
    console.log(
      `[RAG] Model: ${ragConfig.transformers.model} (${ragConfig.transformers.dimensions}d)`
    );
    return new TransformersEmbeddingProvider();
  }

  if (provider === "ollama") {
    console.log("[RAG] Using Ollama provider (forced by config)");
    console.log(
      `[RAG] Model: ${ragConfig.ollama.model} (dimensions will be auto-detected)`
    );
    try {
      return new OllamaEmbeddingProvider();
    } catch (error) {
      console.error("[RAG] Failed to create Ollama provider:", error);
      console.log("[RAG] Falling back to transformers.js");
      return new TransformersEmbeddingProvider();
    }
  }

  // Auto-detect Ollama availability
  console.log("[RAG] Auto-detecting embedding provider...");
  const ollamaAvailable = await isOllamaAvailable();

  if (ollamaAvailable) {
    console.log("[RAG] Ollama detected, using Ollama provider");
    console.log(
      `[RAG] Model: ${ragConfig.ollama.model} (dimensions will be auto-detected)`
    );
    return new OllamaEmbeddingProvider();
  }

  // Fallback to transformers.js
  console.log("[RAG] Ollama not available, using transformers.js provider");
  console.log(
    `[RAG] Model: ${ragConfig.transformers.model} (${ragConfig.transformers.dimensions}d)`
  );
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
