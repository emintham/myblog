// src/utils/postUpdateHelpers.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import {
  handleDraftToPublishedTransition,
  handleSlugChange,
  checkSlugConflict,
  handleQuotesUpdate,
  handleRAGIndexUpdate,
} from "./postUpdateHelpers";
import type { PostApiPayload } from "../types/admin";

// Mock dependencies
vi.mock("node:fs/promises");
vi.mock("js-yaml");

// Create persistent mock functions for RAG service
const mockDeletePost = vi.fn();
const mockUpsertPost = vi.fn();
const mockUpsertQuotes = vi.fn();

vi.mock("../services/rag/index", () => ({
  getRAGService: vi.fn(() => ({
    deletePost: mockDeletePost,
    upsertPost: mockUpsertPost,
    upsertQuotes: mockUpsertQuotes,
  })),
}));

describe("postUpdateHelpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("handleDraftToPublishedTransition", () => {
    it("should update pubDate when transitioning from draft to published", async () => {
      const mockFileContent = `---
title: Test Post
draft: true
pubDate: 2023-01-01
---
Content here`;

      vi.mocked(fs.readFile).mockResolvedValue(mockFileContent);

      const payload: PostApiPayload = {
        title: "Test Post",
        bodyContent: "Content here",
        postType: "standard",
        draft: false,
        pubDate: "2023-01-01",
      };

      const result = await handleDraftToPublishedTransition(
        "/path/to/file.mdx",
        payload
      );

      expect(result.pubDate).not.toBe("2023-01-01");
      expect(result.pubDate).toMatch(/^\d{4}-\d{2}-\d{2}$/); // Should be today's date in YYYY-MM-DD format
    });

    it("should not update pubDate when not transitioning from draft", async () => {
      const mockFileContent = `---
title: Test Post
draft: false
pubDate: 2023-01-01
---
Content here`;

      vi.mocked(fs.readFile).mockResolvedValue(mockFileContent);

      const payload: PostApiPayload = {
        title: "Test Post",
        bodyContent: "Content here",
        postType: "standard",
        draft: false,
        pubDate: "2023-01-01",
      };

      const result = await handleDraftToPublishedTransition(
        "/path/to/file.mdx",
        payload
      );

      expect(result.pubDate).toBe("2023-01-01"); // Should remain unchanged
    });

    it("should return payload unchanged if no originalFilePath", async () => {
      const payload: PostApiPayload = {
        title: "Test Post",
        bodyContent: "Content here",
        postType: "standard",
        draft: false,
        pubDate: "2023-01-01",
      };

      const result = await handleDraftToPublishedTransition(undefined, payload);

      expect(result).toBe(payload); // Should be the same object
    });

    it("should handle file read errors gracefully", async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error("File not found"));

      const payload: PostApiPayload = {
        title: "Test Post",
        bodyContent: "Content here",
        postType: "standard",
        draft: false,
        pubDate: "2023-01-01",
      };

      const result = await handleDraftToPublishedTransition(
        "/path/to/file.mdx",
        payload
      );

      expect(result).toBe(payload); // Should return original payload
    });
  });

  describe("handleSlugChange", () => {
    it("should delete old file when slug changes", async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.unlink).mockResolvedValue(undefined);

      const result = await handleSlugChange(
        "/path/to/old-file.mdx",
        "/path/to/new-file.mdx"
      );

      expect(fs.access).toHaveBeenCalledWith("/path/to/old-file.mdx");
      expect(fs.unlink).toHaveBeenCalledWith("/path/to/old-file.mdx");
      expect(result).toBe(true);
    });

    it("should not delete file when slug has not changed", async () => {
      const result = await handleSlugChange(
        "/path/to/file.mdx",
        "/path/to/file.mdx"
      );

      expect(fs.access).not.toHaveBeenCalled();
      expect(fs.unlink).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it("should not delete file when originalFilePath is undefined", async () => {
      const result = await handleSlugChange(undefined, "/path/to/new-file.mdx");

      expect(fs.access).not.toHaveBeenCalled();
      expect(fs.unlink).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it("should handle file deletion errors gracefully", async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.unlink).mockRejectedValue(new Error("Permission denied"));

      const result = await handleSlugChange(
        "/path/to/old-file.mdx",
        "/path/to/new-file.mdx"
      );

      expect(result).toBe(false);
    });
  });

  describe("checkSlugConflict", () => {
    it("should throw error when different file exists at new path", async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined); // File exists

      await expect(
        checkSlugConflict(
          "/path/to/old-file.mdx",
          "/path/to/new-file.mdx",
          "new-file.mdx"
        )
      ).rejects.toThrow(/already exists with the new title\/slug/);
    });

    it("should not throw error when paths are the same", async () => {
      await expect(
        checkSlugConflict("/path/to/file.mdx", "/path/to/file.mdx", "file.mdx")
      ).resolves.not.toThrow();

      expect(fs.access).not.toHaveBeenCalled();
    });

    it("should not throw error when file does not exist at new path", async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error("File not found")); // File does not exist

      await expect(
        checkSlugConflict(
          "/path/to/old-file.mdx",
          "/path/to/new-file.mdx",
          "new-file.mdx"
        )
      ).resolves.not.toThrow();
    });
  });

  describe("handleQuotesUpdate", () => {
    it("should create quotes file for bookNote with quotes", async () => {
      const yaml = await import("js-yaml");
      vi.mocked(yaml.dump).mockReturnValue("bookSlug: test-slug\nquotes: []");
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      const payload: PostApiPayload = {
        title: "Test Book",
        bodyContent: "Content here",
        postType: "bookNote",
        bookTitle: "Test Book",
        bookAuthor: "Test Author",
        quotesRef: "test-quotes",
        inlineQuotes: [
          {
            text: "Quote text",
            quoteAuthor: "Author",
            tags: ["tag1"],
            quoteSource: "Page 1",
          },
        ],
      };

      await handleQuotesUpdate(payload, "test-slug", "/project/root");

      expect(fs.mkdir).toHaveBeenCalledWith(
        path.join("/project/root", "src", "content", "bookQuotes"),
        { recursive: true }
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(
          "/project/root",
          "src",
          "content",
          "bookQuotes",
          "test-quotes.yaml"
        ),
        expect.any(String)
      );
    });

    it("should not create quotes file for non-bookNote posts", async () => {
      const payload: PostApiPayload = {
        title: "Test Post",
        bodyContent: "Content here",
        postType: "standard",
      };

      await handleQuotesUpdate(payload, "test-slug", "/project/root");

      expect(fs.mkdir).not.toHaveBeenCalled();
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it("should not create quotes file if quotesRef is missing", async () => {
      const payload: PostApiPayload = {
        title: "Test Book",
        bodyContent: "Content here",
        postType: "bookNote",
        bookTitle: "Test Book",
        bookAuthor: "Test Author",
      };

      await handleQuotesUpdate(payload, "test-slug", "/project/root");

      expect(fs.mkdir).not.toHaveBeenCalled();
      expect(fs.writeFile).not.toHaveBeenCalled();
    });
  });

  describe("handleRAGIndexUpdate", () => {
    it("should delete old post and index new post when slug changes", async () => {
      const payload: PostApiPayload = {
        title: "Test Post",
        bodyContent: "Content here",
        postType: "standard",
        tags: ["tag1"],
        pubDate: "2023-01-01",
      };

      const frontmatter = {
        title: "Test Post",
        tags: ["tag1"],
        pubDate: "2023-01-01",
      };

      await handleRAGIndexUpdate(payload, frontmatter, "old-slug", "new-slug");

      expect(mockDeletePost).toHaveBeenCalledWith("old-slug");
      expect(mockUpsertPost).toHaveBeenCalledWith("new-slug", {
        title: "Test Post",
        content: "Content here",
        postType: "standard",
        tags: ["tag1"],
        series: undefined,
        pubDate: "2023-01-01",
      });
    });

    it("should not delete old post when slug has not changed", async () => {
      const payload: PostApiPayload = {
        title: "Test Post",
        bodyContent: "Content here",
        postType: "standard",
        tags: ["tag1"],
        pubDate: "2023-01-01",
      };

      const frontmatter = {
        title: "Test Post",
        tags: ["tag1"],
        pubDate: "2023-01-01",
      };

      await handleRAGIndexUpdate(
        payload,
        frontmatter,
        "same-slug",
        "same-slug"
      );

      expect(mockDeletePost).not.toHaveBeenCalled();
      expect(mockUpsertPost).toHaveBeenCalledWith("same-slug", {
        title: "Test Post",
        content: "Content here",
        postType: "standard",
        tags: ["tag1"],
        series: undefined,
        pubDate: "2023-01-01",
      });
    });

    it("should index book quotes for bookNote posts", async () => {
      const payload: PostApiPayload = {
        title: "Test Book",
        bodyContent: "Content here",
        postType: "bookNote",
        bookTitle: "Test Book",
        bookAuthor: "Test Author",
        quotesRef: "test-quotes",
        inlineQuotes: [
          {
            text: "Quote text",
            quoteAuthor: "Author",
            tags: ["tag1"],
            quoteSource: "Page 1",
          },
        ],
        pubDate: "2023-01-01",
      };

      const frontmatter = {
        title: "Test Book",
        bookTitle: "Test Book",
        bookAuthor: "Test Author",
        tags: [],
        pubDate: "2023-01-01",
      };

      await handleRAGIndexUpdate(payload, frontmatter, undefined, "test-book");

      expect(mockUpsertQuotes).toHaveBeenCalledWith(
        "test-quotes",
        [
          {
            text: "Quote text",
            quoteAuthor: "Author",
            tags: ["tag1"],
            quoteSource: "Page 1",
          },
        ],
        {
          bookTitle: "Test Book",
          bookAuthor: "Test Author",
        }
      );
    });

    it("should handle RAG errors gracefully", async () => {
      mockUpsertPost.mockRejectedValueOnce(new Error("RAG error"));

      const payload: PostApiPayload = {
        title: "Test Post",
        bodyContent: "Content here",
        postType: "standard",
        pubDate: "2023-01-01",
      };

      const frontmatter = {
        title: "Test Post",
        tags: [],
        pubDate: "2023-01-01",
      };

      // Should not throw
      await expect(
        handleRAGIndexUpdate(payload, frontmatter, undefined, "test-slug")
      ).resolves.not.toThrow();
    });
  });
});
