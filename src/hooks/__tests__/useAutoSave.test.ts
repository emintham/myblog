import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react";
import { useAutoSave } from "../useAutoSave";

describe("useAutoSave", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with default state", () => {
    const mockOnSave = vi.fn();
    const { result } = renderHook(() =>
      useAutoSave({
        onSave: mockOnSave,
        delay: 2000,
        enabled: true,
      })
    );

    expect(result.current.isSaving).toBe(false);
    expect(result.current.lastSavedAt).toBeNull();
  });

  it("should trigger auto-save after delay when content changes", async () => {
    const mockOnSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useAutoSave({
        onSave: mockOnSave,
        delay: 2000,
        enabled: true,
      })
    );

    act(() => {
      result.current.trackChange("new content");
    });

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith("new content");
    });
  });

  it("should not trigger auto-save when disabled", () => {
    const mockOnSave = vi.fn();
    const { result } = renderHook(() =>
      useAutoSave({
        onSave: mockOnSave,
        delay: 2000,
        enabled: false,
      })
    );

    act(() => {
      result.current.trackChange("new content");
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it("should debounce multiple rapid changes", async () => {
    const mockOnSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useAutoSave({
        onSave: mockOnSave,
        delay: 2000,
        enabled: true,
      })
    );

    // Trigger multiple changes rapidly
    act(() => {
      result.current.trackChange("content 1");
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    act(() => {
      result.current.trackChange("content 2");
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    act(() => {
      result.current.trackChange("content 3");
    });

    // Fast-forward to trigger save
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(mockOnSave).toHaveBeenCalledWith("content 3");
    });
  });

  it("should update lastSavedAt after successful save", async () => {
    const mockOnSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useAutoSave({
        onSave: mockOnSave,
        delay: 2000,
        enabled: true,
      })
    );

    act(() => {
      result.current.trackChange("new content");
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(result.current.lastSavedAt).not.toBeNull();
    });
  });
});
