import { describe, it, expect } from "vitest";

// Simple utility tests to verify Vitest is working
describe("Test Setup Verification", () => {
  it("should run basic assertions", () => {
    expect(1 + 1).toBe(2);
    expect("hello").toBe("hello");
    expect(true).toBeTruthy();
    expect(false).toBeFalsy();
  });

  it("should handle arrays", () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
    expect(arr).toEqual([1, 2, 3]);
  });

  it("should handle objects", () => {
    const obj = { name: "test", value: 42 };
    expect(obj).toHaveProperty("name");
    expect(obj.name).toBe("test");
    expect(obj).toEqual({ name: "test", value: 42 });
  });

  it("should handle async operations", async () => {
    const asyncFunction = async () => "async result";
    const result = await asyncFunction();
    expect(result).toBe("async result");
  });
});

// Math utility tests
describe("Math Utilities", () => {
  it("should perform basic math operations", () => {
    const add = (a: number, b: number) => a + b;
    const multiply = (a: number, b: number) => a * b;

    expect(add(2, 3)).toBe(5);
    expect(multiply(4, 5)).toBe(20);
  });

  it("should handle edge cases", () => {
    const divide = (a: number, b: number) => {
      if (b === 0) throw new Error("Division by zero");
      return a / b;
    };

    expect(divide(10, 2)).toBe(5);
    expect(() => divide(10, 0)).toThrow("Division by zero");
  });
});

// String utility tests
describe("String Utilities", () => {
  it("should manipulate strings correctly", () => {
    const capitalize = (str: string) =>
      str.charAt(0).toUpperCase() + str.slice(1);
    const reverse = (str: string) => str.split("").reverse().join("");

    expect(capitalize("hello")).toBe("Hello");
    expect(reverse("hello")).toBe("olleh");
  });

  it("should handle empty strings", () => {
    const isEmpty = (str: string) => str.length === 0;

    expect(isEmpty("")).toBe(true);
    expect(isEmpty("test")).toBe(false);
  });
});
