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

    expect(result.current.query).toBe("");
    expect(result.current.results).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should update query when setQuery is called", () => {
    const { result } = renderHook(() => useRAGQuery());

    act(() => {
      result.current.setQuery("test query");
    });

    expect(result.current.query).toBe("test query");
  });

  it("should fetch results when executeSearch is called", async () => {
    const mockResults = [
      { id: "1", content: "Test post", similarity: 0.9, type: "post" },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockResults }),
    });

    const { result } = renderHook(() => useRAGQuery());

    act(() => {
      result.current.setQuery("test query");
    });

    await act(async () => {
      await result.current.executeSearch();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.results).toEqual(mockResults);
    expect(result.current.error).toBeNull();
  });

  it("should handle errors when fetch fails", async () => {
    (global.fetch as any).mockRejectedValueOnce(
      new Error("Network error")
    );

    const { result } = renderHook(() => useRAGQuery());

    act(() => {
      result.current.setQuery("test query");
    });

    await act(async () => {
      await result.current.executeSearch();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.results).toEqual([]);
  });

  it("should not execute search when query is empty", async () => {
    const { result } = renderHook(() => useRAGQuery());

    await act(async () => {
      await result.current.executeSearch();
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
