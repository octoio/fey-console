import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSkillStore } from "@store/skill.store";
import { renderHook } from "@testing-library/react";
import {
  useNodeOperations,
  createNodeDataHandler,
} from "@utils/node-operations";

// Mock the skill store
vi.mock("@store/skill.store", () => ({
  useSkillStore: vi.fn(),
}));

describe("node-operations", () => {
  const mockUpdateNode = vi.fn();
  const mockRemoveNode = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useSkillStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      updateNode: mockUpdateNode,
      removeNode: mockRemoveNode,
    });
  });

  describe("useNodeOperations", () => {
    it("should return handlers for node operations", () => {
      const { result } = renderHook(() => useNodeOperations("test-id"));

      expect(result.current).toHaveProperty("handleNameChange");
      expect(result.current).toHaveProperty("handleNodeDelete");
      expect(result.current).toHaveProperty("updateNodeData");

      expect(typeof result.current.handleNameChange).toBe("function");
      expect(typeof result.current.handleNodeDelete).toBe("function");
      expect(typeof result.current.updateNodeData).toBe("function");
    });

    it("should handle name change events", () => {
      const { result } = renderHook(() => useNodeOperations("test-id"));

      const mockEvent = {
        target: { value: "New Node Name" },
      } as React.ChangeEvent<HTMLInputElement>;

      result.current.handleNameChange(mockEvent);

      expect(mockUpdateNode).toHaveBeenCalledWith("test-id", {
        name: "New Node Name",
      });
    });

    it("should handle node deletion", () => {
      const { result } = renderHook(() => useNodeOperations("test-id"));

      result.current.handleNodeDelete();

      expect(mockRemoveNode).toHaveBeenCalledWith("test-id");
    });

    it("should handle node data updates", () => {
      const { result } = renderHook(() => useNodeOperations("test-id"));

      const testData = { someProperty: "someValue", number: 42 };
      result.current.updateNodeData(testData);

      expect(mockUpdateNode).toHaveBeenCalledWith("test-id", testData);
    });

    it("should handle empty string name changes", () => {
      const { result } = renderHook(() => useNodeOperations("test-id"));

      const mockEvent = {
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>;

      result.current.handleNameChange(mockEvent);

      expect(mockUpdateNode).toHaveBeenCalledWith("test-id", { name: "" });
    });

    it("should handle special characters in name", () => {
      const { result } = renderHook(() => useNodeOperations("test-id"));

      const mockEvent = {
        target: { value: "Node @#$%^&*()_+ Name" },
      } as React.ChangeEvent<HTMLInputElement>;

      result.current.handleNameChange(mockEvent);

      expect(mockUpdateNode).toHaveBeenCalledWith("test-id", {
        name: "Node @#$%^&*()_+ Name",
      });
    });

    it("should handle unicode characters in name", () => {
      const { result } = renderHook(() => useNodeOperations("test-id"));

      const mockEvent = {
        target: { value: "Node 中文 🎯 Name" },
      } as React.ChangeEvent<HTMLInputElement>;

      result.current.handleNameChange(mockEvent);

      expect(mockUpdateNode).toHaveBeenCalledWith("test-id", {
        name: "Node 中文 🎯 Name",
      });
    });

    it("should handle null/undefined data updates", () => {
      const { result } = renderHook(() => useNodeOperations("test-id"));

      result.current.updateNodeData(null);
      expect(mockUpdateNode).toHaveBeenCalledWith("test-id", null);

      result.current.updateNodeData(undefined);
      expect(mockUpdateNode).toHaveBeenCalledWith("test-id", undefined);
    });

    it("should handle complex data structures", () => {
      const { result } = renderHook(() => useNodeOperations("test-id"));

      const complexData = {
        nested: {
          array: [1, 2, 3],
          object: { key: "value" },
        },
        boolean: true,
        nullValue: null,
        undefinedValue: undefined,
      };

      result.current.updateNodeData(complexData);

      expect(mockUpdateNode).toHaveBeenCalledWith("test-id", complexData);
    });
  });

  describe("createNodeDataHandler", () => {
    it("should create a handler with correct data and onChange function", () => {
      const testData = { name: "Test Node", value: 42 };
      const handler = createNodeDataHandler("test-id", testData, "nodeData");

      expect(handler.data).toBe(testData);
      expect(typeof handler.onChange).toBe("function");
    });

    it("should call updateNode when onChange is triggered", () => {
      const testData = { name: "Test Node", value: 42 };
      const handler = createNodeDataHandler("test-id", testData, "nodeData");

      const updatedData = { name: "Updated Node", value: 100 };
      handler.onChange(updatedData);

      expect(mockUpdateNode).toHaveBeenCalledWith("test-id", {
        nodeData: updatedData,
      });
    });

    it("should handle different field names", () => {
      const testData = { config: "value" };
      const handler = createNodeDataHandler(
        "test-id",
        testData,
        "configuration",
      );

      const updatedData = { config: "new value" };
      handler.onChange(updatedData);

      expect(mockUpdateNode).toHaveBeenCalledWith("test-id", {
        configuration: updatedData,
      });
    });

    it("should handle primitive data types", () => {
      // String data
      const stringHandler = createNodeDataHandler(
        "test-id",
        "test string",
        "stringField",
      );
      stringHandler.onChange("updated string");
      expect(mockUpdateNode).toHaveBeenCalledWith("test-id", {
        stringField: "updated string",
      });

      // Number data
      const numberHandler = createNodeDataHandler("test-id", 42, "numberField");
      numberHandler.onChange(100);
      expect(mockUpdateNode).toHaveBeenCalledWith("test-id", {
        numberField: 100,
      });

      // Boolean data
      const boolHandler = createNodeDataHandler("test-id", true, "boolField");
      boolHandler.onChange(false);
      expect(mockUpdateNode).toHaveBeenCalledWith("test-id", {
        boolField: false,
      });
    });

    it("should handle array data", () => {
      const arrayData = [1, 2, 3];
      const handler = createNodeDataHandler("test-id", arrayData, "arrayField");

      const updatedArray = [4, 5, 6];
      handler.onChange(updatedArray);

      expect(mockUpdateNode).toHaveBeenCalledWith("test-id", {
        arrayField: updatedArray,
      });
    });

    it("should handle null and undefined data", () => {
      const nullHandler = createNodeDataHandler("test-id", null, "nullField");
      nullHandler.onChange(null);
      expect(mockUpdateNode).toHaveBeenCalledWith("test-id", {
        nullField: null,
      });

      const undefinedHandler = createNodeDataHandler(
        "test-id",
        undefined,
        "undefinedField",
      );
      undefinedHandler.onChange(undefined);
      expect(mockUpdateNode).toHaveBeenCalledWith("test-id", {
        undefinedField: undefined,
      });
    });

    it("should preserve object references correctly", () => {
      const originalData = { prop: "value" };
      const handler = createNodeDataHandler(
        "test-id",
        originalData,
        "objectField",
      );

      expect(handler.data).toBe(originalData);
      expect(handler.data === originalData).toBe(true);
    });

    it("should handle deeply nested object updates", () => {
      const complexData = {
        level1: {
          level2: {
            level3: {
              value: "deep value",
            },
          },
        },
      };

      const handler = createNodeDataHandler(
        "test-id",
        complexData,
        "deepField",
      );

      const updatedComplex = {
        level1: {
          level2: {
            level3: {
              value: "updated deep value",
            },
          },
        },
      };

      handler.onChange(updatedComplex);

      expect(mockUpdateNode).toHaveBeenCalledWith("test-id", {
        deepField: updatedComplex,
      });
    });

    it("should handle field names with special characters", () => {
      const testData = { value: "test" };
      const handler = createNodeDataHandler(
        "test-id",
        testData,
        "field-with-dashes_and_underscores",
      );

      handler.onChange({ value: "updated" });

      expect(mockUpdateNode).toHaveBeenCalledWith("test-id", {
        "field-with-dashes_and_underscores": { value: "updated" },
      });
    });
  });
});
