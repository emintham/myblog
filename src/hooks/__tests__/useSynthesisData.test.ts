import { renderHook, waitFor } from "@testing-library/react";
import { useSynthesisData } from "../useSynthesisData";

// Mock the fetch API
global.fetch = vi.fn();

describe("useSynthesisData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with loading state", () => {
    const { result } = renderHook(() => useSynthesisData());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should fetch synthesis data on mount", async () => {
    const mockData = {
      fleetingToExpand: [
        { slug: "post1", title: "Post 1", wordCount: 50 },
      ],
      orphanedContent: [],
      unreferencedQuotes: [],
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useSynthesisData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it("should handle errors when fetch fails", async () => {
    (global.fetch as any).mockRejectedValueOnce(
      new Error("API error")
    );

    const { result } = renderHook(() => useSynthesisData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeNull();
  });

  it("should refetch data when refresh is called", async () => {
    const mockData1 = {
      fleetingToExpand: [{ slug: "post1", title: "Post 1", wordCount: 50 }],
      orphanedContent: [],
      unreferencedQuotes: [],
    };

    const mockData2 = {
      fleetingToExpand: [{ slug: "post2", title: "Post 2", wordCount: 60 }],
      orphanedContent: [],
      unreferencedQuotes: [],
    };

    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData1,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData2,
      });

    const { result } = renderHook(() => useSynthesisData());

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData1);
    });

    await result.current.refresh();

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData2);
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
