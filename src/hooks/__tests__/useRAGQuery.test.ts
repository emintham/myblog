import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react";
import { useRAGQuery } from "../useRAGQuery";

// Mock the fetch API
global.fetch = vi.fn();

describe("useRAGQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useRAGQuery());

    expect(result.current.results).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.queryTime).toBe(0);
    expect(typeof result.current.query).toBe("function");
    expect(typeof result.current.clear).toBe("function");
  });

  it("should fetch results when query is called", async () => {
    const mockResults = [
      {
        content: "Test post",
        score: 0.9,
        metadata: { slug: "test", title: "Test" },
      },
    ];

    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      {
        ok: true,
        json: async () => ({
          data: { results: mockResults, queryTime: 123, count: 1 },
        }),
      }
    );

    const { result } = renderHook(() => useRAGQuery());

    await act(async () => {
      await result.current.query("test query");
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.results).toEqual(mockResults);
    expect(result.current.queryTime).toBe(123);
    expect(result.current.error).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith("/api/rag-query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: "test query",
        topK: 10,
        filter: {
          contentType: "all",
        },
      }),
    });
  });

  it("should handle errors when fetch fails", async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Network error")
    );

    const { result } = renderHook(() => useRAGQuery());

    await act(async () => {
      await result.current.query("test query");
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.results).toEqual([]);
  });

  it("should not execute query when query text is empty", async () => {
    const { result } = renderHook(() => useRAGQuery());

    await act(async () => {
      await result.current.query("");
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.results).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("should clear results when clear is called", async () => {
    const mockResults = [
      {
        content: "Test post",
        score: 0.9,
        metadata: { slug: "test", title: "Test" },
      },
    ];

    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      {
        ok: true,
        json: async () => ({
          data: { results: mockResults, queryTime: 123, count: 1 },
        }),
      }
    );

    const { result } = renderHook(() => useRAGQuery());

    // First query to populate results
    await act(async () => {
      await result.current.query("test query");
    });

    await waitFor(() => {
      expect(result.current.results).toEqual(mockResults);
    });

    // Then clear
    act(() => {
      result.current.clear();
    });

    expect(result.current.results).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.queryTime).toBe(0);
  });

  it("should support custom options", async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      {
        ok: true,
        json: async () => ({
          data: { results: [], queryTime: 0, count: 0 },
        }),
      }
    );

    const { result } = renderHook(() => useRAGQuery());

    await act(async () => {
      await result.current.query("test query", {
        topK: 5,
        contentType: "posts",
      });
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/rag-query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: "test query",
        topK: 5,
        filter: {
          contentType: "posts",
        },
      }),
    });
  });
});
