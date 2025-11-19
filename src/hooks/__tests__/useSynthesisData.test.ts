import { renderHook, waitFor } from "@testing-library/react";
import { useSynthesisData } from "../useSynthesisData";

// Mock the fetch API
global.fetch = vi.fn();

describe("useSynthesisData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch synthesis data on mount", async () => {
    const mockData = {
      fleetingThoughts: [
        {
          slug: "post1",
          title: "Post 1",
          relatedCount: 2,
          relatedPosts: [],
        },
      ],
      orphanedContent: [],
      unreferencedQuotes: [],
      counts: {
        fleetingThoughts: 1,
        orphanedContent: 0,
        unreferencedQuotes: 0,
      },
    };

    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      {
        ok: true,
        json: async () => ({ data: mockData }),
      }
    );

    const { result } = renderHook(() => useSynthesisData());

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it("should handle errors when fetch fails", async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("API error")
    );

    const { result } = renderHook(() => useSynthesisData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeNull();
  });

  it("should refetch data when refetch is called", async () => {
    const mockData1 = {
      fleetingThoughts: [
        {
          slug: "post1",
          title: "Post 1",
          relatedCount: 2,
          relatedPosts: [],
        },
      ],
      orphanedContent: [],
      unreferencedQuotes: [],
      counts: {
        fleetingThoughts: 1,
        orphanedContent: 0,
        unreferencedQuotes: 0,
      },
    };

    const mockData2 = {
      fleetingThoughts: [
        {
          slug: "post2",
          title: "Post 2",
          relatedCount: 3,
          relatedPosts: [],
        },
      ],
      orphanedContent: [],
      unreferencedQuotes: [],
      counts: {
        fleetingThoughts: 1,
        orphanedContent: 0,
        unreferencedQuotes: 0,
      },
    };

    (global.fetch as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockData1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockData2 }),
      });

    const { result } = renderHook(() => useSynthesisData());

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData1);
    });

    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData2);
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("should have correct initial state", () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => useSynthesisData());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(typeof result.current.refetch).toBe("function");
  });
});
