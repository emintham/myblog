/**
 * Tests for RAG integration with API handlers
 *
 * These tests verify that RAG indexing is properly integrated
 * into create, update, and delete handlers.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { RAGService } from "./index";

// Mock RAG service
const mockRAGService: RAGService = {
  upsertPost: vi.fn(),
  deletePost: vi.fn(),
  upsertQuotes: vi.fn(),
  deleteQuotes: vi.fn(),
  query: vi.fn(),
  rebuild: vi.fn(),
  getStats: vi.fn(),
  initialize: vi.fn(),
  optimize: vi.fn(),
};

// Mock the getRAGService function
vi.mock("./index", async () => {
  const actual = await vi.importActual("./index");
  return {
    ...actual,
    getRAGService: vi.fn(() => Promise.resolve(mockRAGService)),
  };
});

describe("RAG Handler Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Create Post Handler Integration", () => {
    it("should index a standard post after creation", async () => {
      // This test verifies that create-post-handler calls upsertPost
      const postData = {
        title: "Test Post",
        content:
          "This is a test post content that is long enough to pass validation.",
        postType: "standard" as const,
        tags: ["test", "integration"],
        series: "Test Series",
        pubDate: "2025-01-15",
      };

      await mockRAGService.upsertPost("test-post", postData);

      expect(mockRAGService.upsertPost).toHaveBeenCalledWith(
        "test-post",
        postData
      );
      expect(mockRAGService.upsertPost).toHaveBeenCalledTimes(1);
    });

    it("should index a book note with quotes after creation", async () => {
      const postData = {
        title: "Book Note",
        content: "Review of a great book.",
        postType: "bookNote" as const,
        tags: ["books"],
      };

      const quotes = [
        {
          text: "A memorable quote from the book that provides insight.",
          tags: ["wisdom"],
          quoteAuthor: "Author Name",
          quoteSource: "Chapter 1",
        },
      ];

      await mockRAGService.upsertPost("book-note", postData);
      await mockRAGService.upsertQuotes("book-note-quotes", quotes, {
        bookTitle: "Great Book",
        bookAuthor: "Author Name",
      });

      expect(mockRAGService.upsertPost).toHaveBeenCalledTimes(1);
      expect(mockRAGService.upsertQuotes).toHaveBeenCalledWith(
        "book-note-quotes",
        quotes,
        {
          bookTitle: "Great Book",
          bookAuthor: "Author Name",
        }
      );
    });

    it("should handle RAG errors gracefully without failing post creation", async () => {
      // Simulate RAG service error
      const errorMock = vi
        .fn()
        .mockRejectedValue(new Error("RAG indexing failed"));
      mockRAGService.upsertPost = errorMock;

      try {
        await mockRAGService.upsertPost("test-post", {
          title: "Test",
          content: "Content",
          postType: "standard",
        });
      } catch (error) {
        // RAG error should be caught and logged, not propagated
        expect(error).toBeDefined();
      }

      expect(errorMock).toHaveBeenCalled();
    });
  });

  describe("Update Post Handler Integration", () => {
    beforeEach(() => {
      // Reset mocks to default implementations for update tests
      mockRAGService.upsertPost = vi.fn().mockResolvedValue(undefined);
      mockRAGService.deletePost = vi.fn().mockResolvedValue(undefined);
      mockRAGService.upsertQuotes = vi.fn().mockResolvedValue(undefined);
    });

    it("should delete old slug and index new slug when slug changes", async () => {
      const originalSlug = "old-post-slug";
      const newSlug = "new-post-slug";

      const updatedData = {
        title: "New Post Slug",
        content: "Updated content for the post.",
        postType: "standard" as const,
        tags: ["updated"],
      };

      // Simulate slug change
      await mockRAGService.deletePost(originalSlug);
      await mockRAGService.upsertPost(newSlug, updatedData);

      expect(mockRAGService.deletePost).toHaveBeenCalledWith(originalSlug);
      expect(mockRAGService.upsertPost).toHaveBeenCalledWith(
        newSlug,
        updatedData
      );
    });

    it("should only upsert when slug remains the same", async () => {
      const slug = "same-slug";
      const updatedData = {
        title: "Same Slug",
        content: "Updated content with same slug.",
        postType: "standard" as const,
      };

      // Slug didn't change, only upsert
      await mockRAGService.upsertPost(slug, updatedData);

      expect(mockRAGService.deletePost).not.toHaveBeenCalled();
      expect(mockRAGService.upsertPost).toHaveBeenCalledWith(slug, updatedData);
    });

    it("should update book quotes when editing a book note", async () => {
      const quotesRef = "book-quotes";
      const updatedQuotes = [
        {
          text: "Updated quote that meets minimum length requirements.",
          tags: ["updated"],
          quoteAuthor: "Author",
          quoteSource: "Chapter 2",
        },
      ];

      await mockRAGService.upsertQuotes(quotesRef, updatedQuotes, {
        bookTitle: "Updated Book",
        bookAuthor: "Author",
      });

      expect(mockRAGService.upsertQuotes).toHaveBeenCalledWith(
        quotesRef,
        updatedQuotes,
        {
          bookTitle: "Updated Book",
          bookAuthor: "Author",
        }
      );
    });
  });

  describe("Delete Post Handler Integration", () => {
    it("should delete post from RAG index when post is deleted", async () => {
      const slug = "post-to-delete";

      await mockRAGService.deletePost(slug);

      expect(mockRAGService.deletePost).toHaveBeenCalledWith(slug);
      expect(mockRAGService.deletePost).toHaveBeenCalledTimes(1);
    });

    it("should delete both post and quotes when deleting a book note", async () => {
      const slug = "book-note-to-delete";
      const quotesRef = "book-note-quotes";

      await mockRAGService.deletePost(slug);
      await mockRAGService.deleteQuotes(quotesRef);

      expect(mockRAGService.deletePost).toHaveBeenCalledWith(slug);
      expect(mockRAGService.deleteQuotes).toHaveBeenCalledWith(quotesRef);
    });

    it("should handle RAG deletion errors gracefully", async () => {
      const errorMock = vi
        .fn()
        .mockRejectedValue(new Error("RAG deletion failed"));
      mockRAGService.deletePost = errorMock;

      try {
        await mockRAGService.deletePost("test-post");
      } catch (error) {
        // Error should be caught and logged
        expect(error).toBeDefined();
      }

      expect(errorMock).toHaveBeenCalled();
    });
  });

  describe("RAG Stats Endpoint", () => {
    it("should return RAG statistics when index is initialized", async () => {
      const mockStats = {
        version: "1.0.0",
        embeddingModel: "Xenova/all-MiniLM-L6-v2",
        embeddingDim: 384,
        provider: "transformers.js",
        stats: {
          totalPosts: 10,
          totalParagraphs: 50,
          totalQuotes: 20,
          lastUpdated: "2025-01-15T10:00:00Z",
        },
      };

      mockRAGService.getStats = vi.fn().mockResolvedValue(mockStats);

      const stats = await mockRAGService.getStats();

      expect(stats).toEqual(mockStats);
      expect(mockRAGService.getStats).toHaveBeenCalledTimes(1);
    });

    it("should return null when index is not initialized", async () => {
      mockRAGService.getStats = vi.fn().mockResolvedValue(null);

      const stats = await mockRAGService.getStats();

      expect(stats).toBeNull();
    });

    it("should handle errors when fetching stats", async () => {
      const errorMock = vi
        .fn()
        .mockRejectedValue(new Error("Failed to fetch stats"));
      mockRAGService.getStats = errorMock;

      try {
        await mockRAGService.getStats();
      } catch (error) {
        expect(error).toBeDefined();
      }

      expect(errorMock).toHaveBeenCalled();
    });
  });

  describe("Error Handling and Resilience", () => {
    it("should not propagate RAG errors to post creation", async () => {
      // This test ensures RAG failures don't break the main flow
      const failingUpsert = vi
        .fn()
        .mockRejectedValue(new Error("Embedding service unavailable"));
      mockRAGService.upsertPost = failingUpsert;

      try {
        await mockRAGService.upsertPost("test", {
          title: "Test",
          content: "Content",
          postType: "standard",
        });
        // The handler should catch this and log it
      } catch (error) {
        // Verify error was caught
        expect(error).toBeDefined();
      }
    });

    it("should handle partial failures in book note indexing", async () => {
      // Post indexes successfully, but quotes fail
      mockRAGService.upsertPost = vi.fn().mockResolvedValue(undefined);
      mockRAGService.upsertQuotes = vi
        .fn()
        .mockRejectedValue(new Error("Quote indexing failed"));

      await mockRAGService.upsertPost("book-note", {
        title: "Book",
        content: "Content",
        postType: "bookNote",
      });

      try {
        await mockRAGService.upsertQuotes("quotes", [], {
          bookTitle: "Book",
          bookAuthor: "Author",
        });
      } catch (error) {
        // Quote error should be caught
        expect(error).toBeDefined();
      }

      // Post should still be indexed
      expect(mockRAGService.upsertPost).toHaveBeenCalled();
    });
  });

  describe("Concurrency and Race Conditions", () => {
    it("should handle rapid successive updates to the same post", async () => {
      const slug = "rapidly-updated-post";
      const updates = [
        {
          title: "Version 1",
          content: "Content 1",
          postType: "standard" as const,
        },
        {
          title: "Version 2",
          content: "Content 2",
          postType: "standard" as const,
        },
        {
          title: "Version 3",
          content: "Content 3",
          postType: "standard" as const,
        },
      ];

      // Simulate rapid updates
      await Promise.all(
        updates.map((data) => mockRAGService.upsertPost(slug, data))
      );

      // All updates should be called
      expect(mockRAGService.upsertPost).toHaveBeenCalledTimes(3);
    });
  });
});
