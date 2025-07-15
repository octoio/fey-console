import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useDebounce } from "@hooks/use-debounce";
import { renderHook, act } from "@testing-library/react";

describe("useDebounce Hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Basic Functionality", () => {
    it("should return initial value immediately", () => {
      const { result } = renderHook(() => useDebounce("initial", 500));

      expect(result.current).toBe("initial");
    });

    it("should debounce string value changes", () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: "initial", delay: 500 },
        },
      );

      expect(result.current).toBe("initial");

      // Change value
      rerender({ value: "updated", delay: 500 });

      // Should still return old value immediately
      expect(result.current).toBe("initial");

      // Fast forward time by 250ms - should still be old value
      act(() => {
        vi.advanceTimersByTime(250);
      });
      expect(result.current).toBe("initial");

      // Fast forward remaining time - should now be new value
      act(() => {
        vi.advanceTimersByTime(250);
      });
      expect(result.current).toBe("updated");
    });

    it("should debounce number value changes", () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: 0, delay: 300 },
        },
      );

      expect(result.current).toBe(0);

      rerender({ value: 42, delay: 300 });
      expect(result.current).toBe(0);

      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(result.current).toBe(42);
    });

    it("should debounce boolean value changes", () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: false, delay: 200 },
        },
      );

      expect(result.current).toBe(false);

      rerender({ value: true, delay: 200 });
      expect(result.current).toBe(false);

      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current).toBe(true);
    });

    it("should debounce object value changes", () => {
      const initialObj = { name: "test", count: 1 };
      const updatedObj = { name: "updated", count: 2 };

      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: initialObj, delay: 400 },
        },
      );

      expect(result.current).toEqual(initialObj);

      rerender({ value: updatedObj, delay: 400 });
      expect(result.current).toEqual(initialObj);

      act(() => {
        vi.advanceTimersByTime(400);
      });
      expect(result.current).toEqual(updatedObj);
    });
  });

  describe("Advanced Behavior", () => {
    it("should reset timer on rapid value changes", () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: "initial", delay: 500 },
        },
      );

      // First change
      rerender({ value: "change1", delay: 500 });

      // Advance time partially
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(result.current).toBe("initial");

      // Second change before timer completes - should reset timer
      rerender({ value: "change2", delay: 500 });

      // Advance another 300ms (600ms total, but timer was reset)
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(result.current).toBe("initial"); // Still old value

      // Advance remaining 200ms to complete the new timer
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current).toBe("change2"); // Now updated to latest value
    });

    it("should handle multiple rapid changes correctly", () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: "v0", delay: 300 },
        },
      );

      // Rapid sequence of changes
      rerender({ value: "v1", delay: 300 });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      rerender({ value: "v2", delay: 300 });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      rerender({ value: "v3", delay: 300 });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Still should be initial value
      expect(result.current).toBe("v0");

      // Complete the final timer
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Should jump directly to the last value
      expect(result.current).toBe("v3");
    });

    it("should handle delay changes", () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: "initial", delay: 500 },
        },
      );

      // Change both value and delay
      rerender({ value: "updated", delay: 200 });

      // Advance by the new delay amount
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current).toBe("updated");
    });

    it("should handle zero delay", () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: "initial", delay: 0 },
        },
      );

      rerender({ value: "immediate", delay: 0 });

      // Even with zero delay, still goes through setTimeout
      expect(result.current).toBe("initial");

      act(() => {
        vi.advanceTimersByTime(0);
      });
      expect(result.current).toBe("immediate");
    });
  });

  describe("Edge Cases", () => {
    it("should handle null and undefined values", () => {
      // Test with null values
      const { result: nullResult } = renderHook(() => useDebounce(null, 100));
      expect(nullResult.current).toBe(null);

      // Test with undefined values
      const { result: undefinedResult } = renderHook(() =>
        useDebounce(undefined, 100),
      );
      expect(undefinedResult.current).toBe(undefined);

      // Test with string | null union type
      const { result: stringNullResult, rerender: stringNullRerender } =
        renderHook(({ value, delay }) => useDebounce(value, delay), {
          initialProps: { value: null as string | null, delay: 100 },
        });

      expect(stringNullResult.current).toBe(null);

      stringNullRerender({ value: "not null", delay: 100 });
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(stringNullResult.current).toBe("not null");

      // Test transition back to null
      stringNullRerender({ value: null, delay: 100 });
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(stringNullResult.current).toBe(null);
    });

    it("should handle empty strings", () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: "not empty", delay: 100 },
        },
      );

      rerender({ value: "", delay: 100 });
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(result.current).toBe("");
    });

    it("should cleanup timer on unmount", () => {
      const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

      const { unmount, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: "initial", delay: 500 },
        },
      );

      rerender({ value: "updated", delay: 500 });

      // Unmount before timer completes
      unmount();

      // Verify cleanup was called
      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });
  });

  describe("Performance", () => {
    it("should handle high-frequency updates efficiently", () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: 0, delay: 100 },
        },
      );

      // Simulate rapid updates
      for (let i = 1; i <= 100; i++) {
        rerender({ value: i, delay: 100 });
        act(() => {
          vi.advanceTimersByTime(10); // Advance time by small amount
        });
      }

      // Should still be initial value
      expect(result.current).toBe(0);

      // Complete the final timer
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Should have the final value
      expect(result.current).toBe(100);
    });

    it("should work with complex objects without unnecessary re-renders", () => {
      const complexObj = {
        nested: { array: [1, 2, 3], deep: { value: "test" } },
        count: 0,
      };

      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: complexObj, delay: 200 },
        },
      );

      const updatedObj = {
        ...complexObj,
        count: 1,
        nested: { ...complexObj.nested, deep: { value: "updated" } },
      };

      rerender({ value: updatedObj, delay: 200 });

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(result.current).toEqual(updatedObj);
      expect(result.current).not.toBe(complexObj); // Different reference
    });
  });
});
