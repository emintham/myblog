/**
 * Tests for chunking utilities
 */

import { describe, it, expect } from "vitest";
import { chunkPostContent, chunkBookQuotes, validateChunk } from "./chunking";

describe("chunkPostContent", () => {
  const baseMetadata = {
    slug: "test-post",
    title: "Test Post",
    postType: "standard" as const,
  };

  it("should split content on double newlines", () => {
    const content = `First paragraph with enough content to meet the minimum length requirement.

Second paragraph with enough content to meet the minimum length requirement.

Third paragraph with enough content to meet the minimum length requirement.`;

    const chunks = chunkPostContent(content, baseMetadata);

    expect(chunks).toHaveLength(3);
    expect(chunks[0].content).toContain("First paragraph");
    expect(chunks[1].content).toContain("Second paragraph");
    expect(chunks[2].content).toContain("Third paragraph");
  });

  it("should filter out paragraphs shorter than 50 characters", () => {
    const content = `This is a very long paragraph that definitely exceeds the minimum length requirement of fifty characters.

Short.

This is another very long paragraph that definitely exceeds the minimum length requirement.`;

    const chunks = chunkPostContent(content, baseMetadata);

    expect(chunks).toHaveLength(2);
    expect(chunks.some((c) => c.content.includes("Short"))).toBe(false);
  });

  it("should split long paragraphs at sentence boundaries", () => {
    // Create a paragraph longer than 2000 characters
    const longSentence =
      "This is a sentence that will be repeated many times. ";
    const longParagraph = longSentence.repeat(50); // ~2500 characters

    const chunks = chunkPostContent(longParagraph, baseMetadata);

    // Should be split into multiple chunks
    expect(chunks.length).toBeGreaterThan(1);

    // Each chunk should be under or near the limit
    chunks.forEach((chunk) => {
      expect(chunk.content.length).toBeLessThanOrEqual(2500);
    });
  });

  it("should include metadata with each chunk", () => {
    const content = `First paragraph with enough content to meet the minimum length requirement.

Second paragraph with enough content to meet the minimum length requirement.`;

    const metadata = {
      slug: "my-post",
      title: "My Post",
      postType: "standard" as const,
      tags: ["tech", "writing"],
      series: "Getting Started",
      pubDate: "2025-01-15",
    };

    const chunks = chunkPostContent(content, metadata);

    expect(chunks[0].metadata).toMatchObject({
      slug: "my-post",
      title: "My Post",
      postType: "standard",
      tags: ["tech", "writing"],
      series: "Getting Started",
      pubDate: "2025-01-15",
      paragraphIndex: 0,
    });

    expect(chunks[1].metadata.paragraphIndex).toBe(1);
  });

  it("should generate unique IDs for each chunk", () => {
    const content = `First paragraph with enough content to meet the minimum length requirement.

Second paragraph with enough content to meet the minimum length requirement.`;

    const chunks = chunkPostContent(content, baseMetadata);

    expect(chunks[0].id).toBe("post:test-post:0");
    expect(chunks[1].id).toBe("post:test-post:1");
  });

  it("should trim whitespace from paragraphs", () => {
    const content = `   First paragraph with whitespace and enough content to meet minimum.

   Second paragraph with whitespace and enough content to meet minimum.   `;

    const chunks = chunkPostContent(content, baseMetadata);

    expect(chunks[0].content).not.toMatch(/^\s+/);
    expect(chunks[0].content).not.toMatch(/\s+$/);
  });

  it("should handle empty content", () => {
    const chunks = chunkPostContent("", baseMetadata);
    expect(chunks).toHaveLength(0);
  });

  it("should handle content with only short paragraphs", () => {
    const content = "Short.\n\nAlso short.\n\nStill short.";
    const chunks = chunkPostContent(content, baseMetadata);
    expect(chunks).toHaveLength(0);
  });
});

describe("chunkBookQuotes", () => {
  const bookMetadata = {
    quotesRef: "atomic-habits",
    bookTitle: "Atomic Habits",
    bookAuthor: "James Clear",
  };

  it("should create one chunk per quote", () => {
    const quotes = [
      {
        text: "Quote one with enough content to meet the minimum length requirement.",
      },
      {
        text: "Quote two with enough content to meet the minimum length requirement.",
      },
      {
        text: "Quote three with enough content to meet the minimum length requirement.",
      },
    ];

    const chunks = chunkBookQuotes(quotes, bookMetadata);

    expect(chunks).toHaveLength(3);
    expect(chunks[0].content).toBe(quotes[0].text);
    expect(chunks[1].content).toBe(quotes[1].text);
    expect(chunks[2].content).toBe(quotes[2].text);
  });

  it("should include book and quote metadata", () => {
    const quotes = [
      {
        text: "You do not rise to the level of your goals. You fall to the level of your systems.",
        tags: ["habits", "systems"],
        quoteAuthor: "James Clear",
        quoteSource: "Chapter 1",
      },
    ];

    const chunks = chunkBookQuotes(quotes, bookMetadata);

    expect(chunks[0].metadata).toMatchObject({
      quotesRef: "atomic-habits",
      bookTitle: "Atomic Habits",
      bookAuthor: "James Clear",
      tags: ["habits", "systems"],
      quoteAuthor: "James Clear",
      quoteSource: "Chapter 1",
      quoteIndex: 0,
    });
  });

  it("should generate unique IDs for each quote", () => {
    const quotes = [
      {
        text: "First quote with enough content to meet the minimum length requirement.",
      },
      {
        text: "Second quote with enough content to meet the minimum length requirement.",
      },
    ];

    const chunks = chunkBookQuotes(quotes, bookMetadata);

    expect(chunks[0].id).toBe("quote:atomic-habits:0");
    expect(chunks[1].id).toBe("quote:atomic-habits:1");
  });

  it("should handle quotes without optional metadata", () => {
    const quotes = [
      {
        text: "A quote without tags or author information but with enough content to meet minimum.",
      },
    ];

    const chunks = chunkBookQuotes(quotes, bookMetadata);

    expect(chunks[0].metadata.tags).toBeUndefined();
    expect(chunks[0].metadata.quoteAuthor).toBeUndefined();
    expect(chunks[0].metadata.quoteSource).toBeUndefined();
  });

  it("should handle empty quotes array", () => {
    const chunks = chunkBookQuotes([], bookMetadata);
    expect(chunks).toHaveLength(0);
  });
});

describe("validateChunk", () => {
  it("should validate valid chunks", () => {
    const chunk = {
      id: "post:test:0",
      content:
        "This is valid content that meets the minimum length requirement of fifty characters.",
      metadata: {
        slug: "test",
        title: "Test",
        postType: "standard" as const,
        paragraphIndex: 0,
      },
    };

    expect(validateChunk(chunk)).toBe(true);
  });

  it("should reject chunks without ID", () => {
    const chunk = {
      id: "",
      content:
        "This is valid content that meets the minimum length requirement of fifty characters.",
      metadata: {
        slug: "test",
        title: "Test",
        postType: "standard" as const,
        paragraphIndex: 0,
      },
    };

    expect(validateChunk(chunk)).toBe(false);
  });

  it("should reject chunks without content", () => {
    const chunk = {
      id: "post:test:0",
      content: "",
      metadata: {
        slug: "test",
        title: "Test",
        postType: "standard" as const,
        paragraphIndex: 0,
      },
    };

    expect(validateChunk(chunk)).toBe(false);
  });

  it("should reject chunks with content shorter than 50 characters", () => {
    const chunk = {
      id: "post:test:0",
      content: "Too short",
      metadata: {
        slug: "test",
        title: "Test",
        postType: "standard" as const,
        paragraphIndex: 0,
      },
    };

    expect(validateChunk(chunk)).toBe(false);
  });
});
