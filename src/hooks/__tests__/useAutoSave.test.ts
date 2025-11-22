import { renderHook } from "@testing-library/react";
import { act } from "react";
import { useAutoSave } from "../useAutoSave";
import type { PostFormData } from "../../types/admin";

describe("useAutoSave", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should set up interval and call submitFn when body changes", async () => {
    const mockSubmitFn = vi.fn().mockResolvedValue(undefined);
    const mockGetValues = vi.fn().mockReturnValue({
      title: "Test Post",
      bodyContent: "new content",
    } as PostFormData);

    renderHook(() =>
      useAutoSave({
        isSubmitting: false,
        getValues: mockGetValues,
        lastSavedBodyContent: "old content",
        submitFn: mockSubmitFn,
        intervalMs: 2000,
      })
    );

    // Fast-forward time to trigger interval
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    // Wait for async submitFn to resolve
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockSubmitFn).toHaveBeenCalledWith({
      title: "Test Post",
      bodyContent: "new content",
    });
  });

  it("should not call submitFn when isSubmitting is true", async () => {
    const mockSubmitFn = vi.fn().mockResolvedValue(undefined);
    const mockGetValues = vi.fn().mockReturnValue({
      title: "Test Post",
      bodyContent: "new content",
    } as PostFormData);

    renderHook(() =>
      useAutoSave({
        isSubmitting: true,
        getValues: mockGetValues,
        lastSavedBodyContent: "old content",
        submitFn: mockSubmitFn,
        intervalMs: 2000,
      })
    );

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockSubmitFn).not.toHaveBeenCalled();
  });

  it("should not call submitFn when body content has not changed", async () => {
    const mockSubmitFn = vi.fn().mockResolvedValue(undefined);
    const mockGetValues = vi.fn().mockReturnValue({
      title: "Test Post",
      bodyContent: "same content",
    } as PostFormData);

    renderHook(() =>
      useAutoSave({
        isSubmitting: false,
        getValues: mockGetValues,
        lastSavedBodyContent: "same content",
        submitFn: mockSubmitFn,
        intervalMs: 2000,
      })
    );

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockSubmitFn).not.toHaveBeenCalled();
  });

  it("should not call submitFn when title is empty", async () => {
    const mockSubmitFn = vi.fn().mockResolvedValue(undefined);
    const mockGetValues = vi.fn().mockReturnValue({
      title: "",
      bodyContent: "new content",
    } as PostFormData);

    renderHook(() =>
      useAutoSave({
        isSubmitting: false,
        getValues: mockGetValues,
        lastSavedBodyContent: "old content",
        submitFn: mockSubmitFn,
        intervalMs: 2000,
      })
    );

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockSubmitFn).not.toHaveBeenCalled();
  });

  it("should clear interval on unmount", async () => {
    const mockSubmitFn = vi.fn().mockResolvedValue(undefined);
    const mockGetValues = vi.fn().mockReturnValue({
      title: "Test Post",
      bodyContent: "new content",
    } as PostFormData);

    const { unmount } = renderHook(() =>
      useAutoSave({
        isSubmitting: false,
        getValues: mockGetValues,
        lastSavedBodyContent: "old content",
        submitFn: mockSubmitFn,
        intervalMs: 2000,
      })
    );

    // Unmount before interval fires
    unmount();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    await act(async () => {
      await Promise.resolve();
    });

    // Should not be called after unmount
    expect(mockSubmitFn).not.toHaveBeenCalled();
  });
});
