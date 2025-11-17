/**
 * End-to-end sanity tests for RAG system
 *
 * These tests verify the core infrastructure works correctly
 * without requiring actual embedding model downloads
 */

import { describe, it, expect, afterAll } from "vitest";
import { chunkPostContent, chunkBookQuotes } from "./chunking";
import * as fs from "fs/promises";

describe("RAG System - End-to-End Sanity Tests", () => {
  describe("Chunking Integration", () => {
    it("should chunk a realistic blog post correctly", () => {
      const content = `This is the first paragraph of a blog post that discusses semantic search and embeddings. It needs to be at least 50 characters long to pass validation.

This is the second paragraph that talks about vector databases and how they enable similarity search. Again, we need enough content here to meet the minimum length requirement.

This is the final paragraph that wraps up the discussion and provides some conclusions about the topic. We make sure it's long enough for validation.`;

      const chunks = chunkPostContent(content, {
        slug: "test-post",
        title: "Test Post About RAG",
        postType: "standard",
        tags: ["rag", "embeddings"],
        series: "AI Series",
      });

      expect(chunks.length).toBe(3);
      expect(chunks[0].metadata.paragraphIndex).toBe(0);
      expect(chunks[1].metadata.paragraphIndex).toBe(1);
      expect(chunks[2].metadata.paragraphIndex).toBe(2);
      expect(chunks[0].metadata.tags).toEqual(["rag", "embeddings"]);
      expect(chunks[0].metadata.series).toBe("AI Series");
    });

    it("should chunk book quotes correctly", () => {
      const quotes = [
        {
          text: "The only way to do great work is to love what you do. This is a foundational principle.",
          tags: ["work", "passion"],
          quoteAuthor: "Steve Jobs",
          quoteSource: "Stanford Commencement Speech",
        },
        {
          text: "Innovation distinguishes between a leader and a follower. Leaders create the future.",
          tags: ["innovation", "leadership"],
        },
      ];

      const chunks = chunkBookQuotes(quotes, {
        quotesRef: "steve-jobs-quotes",
        bookTitle: "Steve Jobs",
        bookAuthor: "Walter Isaacson",
      });

      expect(chunks.length).toBe(2);
      expect(chunks[0].id).toBe("quote:steve-jobs-quotes:0");
      expect(chunks[1].id).toBe("quote:steve-jobs-quotes:1");
      expect(chunks[0].metadata.bookTitle).toBe("Steve Jobs");
      expect(chunks[0].metadata.quoteAuthor).toBe("Steve Jobs");
      expect(chunks[1].metadata.quoteAuthor).toBeUndefined();
    });

    it("should handle very long paragraphs by splitting at sentence boundaries", () => {
      const longSentence =
        "This is a sentence that will be repeated many times. ";
      const veryLongParagraph = longSentence.repeat(50); // ~2500 characters

      const chunks = chunkPostContent(veryLongParagraph, {
        slug: "long-post",
        title: "Long Post",
        postType: "standard",
      });

      // Should split into multiple chunks
      expect(chunks.length).toBeGreaterThan(1);

      // Each chunk should be under or near the limit
      chunks.forEach((chunk) => {
        expect(chunk.content.length).toBeLessThanOrEqual(2500);
      });
    });
  });

  describe("Storage Infrastructure", () => {
    const testDataDir = "./test-rag-data";

    afterAll(async () => {
      // Clean up test data
      try {
        await fs.rm(testDataDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    });

    it("should create data directory structure", async () => {
      await fs.mkdir(testDataDir, { recursive: true });
      const stat = await fs.stat(testDataDir);
      expect(stat.isDirectory()).toBe(true);
    });

    it("should write and read metadata file", async () => {
      const metadata = {
        version: "1.0.0",
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        embeddingModel: "test-model",
        embeddingDim: 384,
        stats: {
          totalPosts: 10,
          totalParagraphs: 50,
          totalQuotes: 20,
        },
      };

      const metadataPath = `${testDataDir}/metadata.json`;
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

      const loaded = JSON.parse(await fs.readFile(metadataPath, "utf-8"));
      expect(loaded.version).toBe("1.0.0");
      expect(loaded.embeddingDim).toBe(384);
      expect(loaded.stats.totalPosts).toBe(10);
    });
  });

  describe("Data Validation", () => {
    it("should reject chunks that are too short", () => {
      const shortContent = "Too short.";

      const chunks = chunkPostContent(shortContent, {
        slug: "short",
        title: "Short",
        postType: "fleeting",
      });

      expect(chunks.length).toBe(0);
    });

    it("should preserve special characters in content", () => {
      const content = `This paragraph contains special characters: @#$%^&*()
and various symbols like <>, [], {}, and quotes "like this" which need to be preserved correctly for semantic search.`;

      const chunks = chunkPostContent(content, {
        slug: "special-chars",
        title: "Special Characters",
        postType: "standard",
      });

      expect(chunks.length).toBe(1);
      expect(chunks[0].content).toContain("@#$%^&*()");
      expect(chunks[0].content).toContain('"like this"');
    });

    it("should handle markdown formatting in content", () => {
      const content = `This paragraph has **bold text** and *italic text* along with [links](https://example.com) and code blocks.

The second paragraph continues with more markdown like \`inline code\` and should be chunked separately for better semantic search.`;

      const chunks = chunkPostContent(content, {
        slug: "markdown-test",
        title: "Markdown Test",
        postType: "standard",
      });

      expect(chunks.length).toBe(2);
      expect(chunks[0].content).toContain("**bold text**");
      expect(chunks[1].content).toContain("`inline code`");
    });
  });

  describe("Metadata Integrity", () => {
    it("should preserve all metadata fields through chunking", () => {
      const content =
        "This is a test paragraph with enough content to pass the minimum length validation requirement.";

      const metadata = {
        slug: "metadata-test",
        title: "Metadata Test",
        postType: "standard" as const,
        tags: ["test", "metadata", "rag"],
        series: "Testing Series",
        pubDate: "2025-01-15T00:00:00.000Z",
      };

      const chunks = chunkPostContent(content, metadata);

      expect(chunks[0].metadata).toMatchObject({
        slug: "metadata-test",
        title: "Metadata Test",
        postType: "standard",
        tags: ["test", "metadata", "rag"],
        series: "Testing Series",
        pubDate: "2025-01-15T00:00:00.000Z",
        paragraphIndex: 0,
      });
    });

    it("should handle optional metadata fields correctly", () => {
      const content =
        "This is a minimal post with only required fields and enough content to pass validation.";

      const chunks = chunkPostContent(content, {
        slug: "minimal",
        title: "Minimal",
        postType: "fleeting",
      });

      expect(chunks[0].metadata.tags).toBeUndefined();
      expect(chunks[0].metadata.series).toBeUndefined();
      expect(chunks[0].metadata.pubDate).toBeUndefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty content gracefully", () => {
      const chunks = chunkPostContent("", {
        slug: "empty",
        title: "Empty",
        postType: "standard",
      });

      expect(chunks).toEqual([]);
    });

    it("should handle content with only whitespace", () => {
      const chunks = chunkPostContent("   \n\n   \n\n   ", {
        slug: "whitespace",
        title: "Whitespace",
        postType: "standard",
      });

      expect(chunks).toEqual([]);
    });

    it("should handle quotes with minimal text", () => {
      const quotes = [
        { text: "Short." }, // Too short, but should still be included as a quote
        {
          text: "This quote is long enough to meet the minimum length requirement for validation.",
        },
      ];

      const chunks = chunkBookQuotes(quotes, {
        quotesRef: "mixed-quotes",
        bookTitle: "Mixed Quotes",
        bookAuthor: "Test Author",
      });

      // All quotes are included, even short ones (different from posts)
      expect(chunks.length).toBe(2);
    });

    it("should generate unique IDs for all chunks", () => {
      const content = `First paragraph with enough content to meet the minimum length requirement.

Second paragraph with enough content to meet the minimum length requirement.

Third paragraph with enough content to meet the minimum length requirement.`;

      const chunks = chunkPostContent(content, {
        slug: "unique-ids",
        title: "Unique IDs",
        postType: "standard",
      });

      const ids = chunks.map((c) => c.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(chunks.length);
      expect(ids).toEqual([
        "post:unique-ids:0",
        "post:unique-ids:1",
        "post:unique-ids:2",
      ]);
    });
  });
});
