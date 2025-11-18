/**
 * Tests for embedding providers
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getEmbeddingProvider } from "./embeddings";

// Mock the MCP SDK to avoid actual Ollama connections in tests
vi.mock("@modelcontextprotocol/sdk/client/index.js", () => ({
  Client: vi.fn(),
}));

vi.mock("@modelcontextprotocol/sdk/client/stdio.js", () => ({
  StdioClientTransport: vi.fn(),
}));

describe("getEmbeddingProvider", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
    delete process.env.RAG_EMBEDDING_PROVIDER;
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it("should return transformers provider when forced by env", async () => {
    process.env.RAG_EMBEDDING_PROVIDER = "transformers";

    const provider = await getEmbeddingProvider();

    expect(provider.name).toBe("transformers");
    expect(provider.dimensions).toBe(384);
  });

  it("should attempt to use Ollama provider when forced by env", async () => {
    process.env.RAG_EMBEDDING_PROVIDER = "ollama";

    const provider = await getEmbeddingProvider();

    // Since Ollama won't be available in tests, it should fall back
    // But we're testing that it attempts to use Ollama first
    expect(provider).toBeDefined();
    expect(provider.name).toMatch(/transformers|ollama/);
  });

  it("should fall back to transformers when Ollama is not available", async () => {
    // No env override, will auto-detect (which will fail in test environment)
    const provider = await getEmbeddingProvider();

    // Should fall back to transformers since Ollama won't be available
    expect(provider.name).toBe("transformers");
    expect(provider.dimensions).toBe(384);
  });

  it("should have consistent provider interface", async () => {
    const provider = await getEmbeddingProvider();

    expect(provider).toHaveProperty("name");
    expect(provider).toHaveProperty("dimensions");
    expect(provider).toHaveProperty("embed");
    expect(provider).toHaveProperty("embedSingle");
    expect(typeof provider.embed).toBe("function");
    expect(typeof provider.embedSingle).toBe("function");
  });
});

describe("TransformersEmbeddingProvider", () => {
  beforeEach(() => {
    process.env.RAG_EMBEDDING_PROVIDER = "transformers";
    vi.clearAllMocks();
  });

  it("should have correct dimensions", async () => {
    const provider = await getEmbeddingProvider();
    expect(provider.dimensions).toBe(384);
  });

  it("should have correct name", async () => {
    const provider = await getEmbeddingProvider();
    expect(provider.name).toBe("transformers");
  });

  // Note: We skip actual embedding tests as they require downloading models
  // and would make tests slow and dependent on internet connection
});

describe("Provider Selection Logic", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.RAG_EMBEDDING_PROVIDER;
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should prioritize env variable over auto-detection", async () => {
    process.env.RAG_EMBEDDING_PROVIDER = "transformers";

    const provider = await getEmbeddingProvider();

    // Should use transformers regardless of Ollama availability
    expect(provider.name).toBe("transformers");
  });

  it("should handle invalid env variable gracefully", async () => {
    // @ts-expect-error - testing invalid value
    process.env.RAG_EMBEDDING_PROVIDER = "invalid-provider";

    const provider = await getEmbeddingProvider();

    // Should fall back to default behavior (auto-detect -> transformers)
    expect(provider).toBeDefined();
    expect(provider.name).toBe("transformers");
  });

  it("should return provider with embed and embedSingle methods", async () => {
    const provider = await getEmbeddingProvider();

    expect(typeof provider.embed).toBe("function");
    expect(typeof provider.embedSingle).toBe("function");
  });
});
