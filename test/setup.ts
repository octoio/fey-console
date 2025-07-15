import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.mock("zustand"); // to make it work like Jest (auto-mocking)

// Mock window.matchMedia for Ant Design components
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// React Flow Test Setup - Custom ResizeObserver and DOMMatrixReadOnly implementation
// as recommended in React Flow testing documentation
class ResizeObserver {
  callback: globalThis.ResizeObserverCallback;

  constructor(callback: globalThis.ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    this.callback([{ target } as globalThis.ResizeObserverEntry], this);
  }

  unobserve() {
    // Mock implementation - no-op
  }

  disconnect() {
    // Mock implementation - no-op
  }
}

class DOMMatrixReadOnly {
  m22: number;
  constructor(transform: string) {
    const scale = transform?.match(/scale\(([1-9.])\)/)?.[1];
    this.m22 = scale !== undefined ? +scale : 1;
  }
}

// Only run the shim once when requested
let init = false;

export const mockReactFlow = () => {
  if (init) return;
  init = true;

  global.ResizeObserver = ResizeObserver;

  // @ts-expect-error - DOMMatrixReadOnly not available in test environment
  global.DOMMatrixReadOnly = DOMMatrixReadOnly;

  Object.defineProperties(global.HTMLElement.prototype, {
    offsetHeight: {
      get() {
        return parseFloat(this.style.height) || 1;
      },
    },
    offsetWidth: {
      get() {
        return parseFloat(this.style.width) || 1;
      },
    },
  });

  (
    global.SVGElement as unknown as { prototype: { getBBox: () => unknown } }
  ).prototype.getBBox = () => ({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
};

// Auto-initialize React Flow mocks for all tests
mockReactFlow();

// Mock getComputedStyle for tests
Object.defineProperty(window, "getComputedStyle", {
  value: () => ({
    getPropertyValue: () => "",
  }),
});
