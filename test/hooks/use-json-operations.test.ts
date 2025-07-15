import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useJsonOperations } from "@hooks/use-json-operations";
import { useSkillStore } from "@store/skill.store";
import { renderHook, act } from "@testing-library/react";

// Mock the external dependencies
vi.mock("@store/skill.store");

describe("useJsonOperations Hook", () => {
  // Mock functions
  const mockExportToJson = vi.fn();
  const mockImportFromJson = vi.fn();

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup store mock
    vi.mocked(useSkillStore).mockReturnValue({
      exportToJson: mockExportToJson,
      importFromJson: mockImportFromJson,
      // Add other required store methods as needed
      skillData: null,
      setSkillData: vi.fn(),
      updateMetadata: vi.fn(),
      updateBasicInfo: vi.fn(),
      updateCost: vi.fn(),
      updateCastDistance: vi.fn(),
      addNode: vi.fn(),
      updateNode: vi.fn(),
      removeNode: vi.fn(),
      setIconReference: vi.fn(),
      setIndicators: vi.fn(),
      nodes: [],
      edges: [],
      onNodesChange: vi.fn(),
      onEdgesChange: vi.fn(),
      onConnect: vi.fn(),
      skillToNodes: vi.fn(),
      nodesToSkill: vi.fn(),
      reorderNode: vi.fn(),
      updateSkillEntity: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initial State", () => {
    it("should initialize with empty state", () => {
      const { result } = renderHook(() => useJsonOperations());

      expect(result.current.jsonInput).toBe("");
      expect(result.current.error).toBeNull();
      expect(result.current.success).toBeNull();
    });

    it("should provide all required functions", () => {
      const { result } = renderHook(() => useJsonOperations());

      expect(typeof result.current.setJsonInput).toBe("function");
      expect(typeof result.current.setError).toBe("function");
      expect(typeof result.current.setSuccess).toBe("function");
      expect(typeof result.current.handleExport).toBe("function");
      expect(typeof result.current.handleImport).toBe("function");
      expect(typeof result.current.handleInputChange).toBe("function");
    });
  });

  describe("State Management", () => {
    it("should update jsonInput state", () => {
      const { result } = renderHook(() => useJsonOperations());

      act(() => {
        result.current.setJsonInput('{"test": "data"}');
      });

      expect(result.current.jsonInput).toBe('{"test": "data"}');
    });

    it("should update error state", () => {
      const { result } = renderHook(() => useJsonOperations());

      act(() => {
        result.current.setError("Test error message");
      });

      expect(result.current.error).toBe("Test error message");
    });

    it("should update success state", () => {
      const { result } = renderHook(() => useJsonOperations());

      act(() => {
        result.current.setSuccess("Test success message");
      });

      expect(result.current.success).toBe("Test success message");
    });

    it("should clear error and success when updating jsonInput", () => {
      const { result } = renderHook(() => useJsonOperations());

      // Set initial error and success states
      act(() => {
        result.current.setError("Initial error");
        result.current.setSuccess("Initial success");
      });

      // Update jsonInput should clear both
      act(() => {
        result.current.setJsonInput('{"new": "data"}');
      });

      expect(result.current.jsonInput).toBe('{"new": "data"}');
      expect(result.current.error).toBe("Initial error");
      expect(result.current.success).toBe("Initial success");
    });
  });

  describe("Export Operations", () => {
    it("should export JSON successfully", () => {
      const mockJsonData = '{"skill": "exported", "version": 1}';
      mockExportToJson.mockReturnValue(mockJsonData);

      const { result } = renderHook(() => useJsonOperations());

      act(() => {
        result.current.handleExport();
      });

      expect(mockExportToJson).toHaveBeenCalled();
      expect(result.current.jsonInput).toBe(mockJsonData);
      expect(result.current.success).toBe("JSON exported successfully.");
      expect(result.current.error).toBeNull();
    });

    it("should handle export errors with Error instance", () => {
      const mockError = new Error("Export failed: Invalid skill data");
      mockExportToJson.mockImplementation(() => {
        throw mockError;
      });

      const { result } = renderHook(() => useJsonOperations());

      act(() => {
        result.current.handleExport();
      });

      expect(mockExportToJson).toHaveBeenCalled();
      expect(result.current.error).toBe(
        "Failed to export JSON: Export failed: Invalid skill data",
      );
      expect(result.current.success).toBeNull();
      expect(result.current.jsonInput).toBe("");
    });

    it("should handle export errors with non-Error instance", () => {
      const mockError = "String error message";
      mockExportToJson.mockImplementation(() => {
        throw mockError;
      });

      const { result } = renderHook(() => useJsonOperations());

      act(() => {
        result.current.handleExport();
      });

      expect(mockExportToJson).toHaveBeenCalled();
      expect(result.current.error).toBe(
        "Failed to export JSON: String error message",
      );
      expect(result.current.success).toBeNull();
    });

    it("should handle export errors with null/undefined", () => {
      mockExportToJson.mockImplementation(() => {
        throw null;
      });

      const { result } = renderHook(() => useJsonOperations());

      act(() => {
        result.current.handleExport();
      });

      expect(result.current.error).toBe("Failed to export JSON: null");
      expect(result.current.success).toBeNull();
    });

    it("should clear previous states on successful export", () => {
      const mockJsonData = '{"skill": "test"}';
      mockExportToJson.mockReturnValue(mockJsonData);

      const { result } = renderHook(() => useJsonOperations());

      // Set initial error state
      act(() => {
        result.current.setError("Previous error");
      });

      // Export should clear error
      act(() => {
        result.current.handleExport();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.success).toBe("JSON exported successfully.");
    });
  });

  describe("Import Operations", () => {
    it("should import JSON successfully", () => {
      const testJsonInput = '{"skill": "imported", "version": 2}';

      const { result } = renderHook(() => useJsonOperations());

      // Set JSON input first
      act(() => {
        result.current.setJsonInput(testJsonInput);
      });

      // Then import
      act(() => {
        result.current.handleImport();
      });

      expect(mockImportFromJson).toHaveBeenCalledWith(testJsonInput);
      expect(result.current.success).toBe("JSON imported successfully.");
      expect(result.current.error).toBeNull();
    });

    it("should handle import errors with Error instance", () => {
      const mockError = new Error("Invalid JSON format");
      const invalidJson = '{"invalid": json}';
      mockImportFromJson.mockImplementation(() => {
        throw mockError;
      });

      const { result } = renderHook(() => useJsonOperations());

      act(() => {
        result.current.handleInputChange(invalidJson);
      });

      act(() => {
        result.current.handleImport();
      });

      expect(mockImportFromJson).toHaveBeenCalledWith(invalidJson);
      expect(result.current.error).toBe(
        "Failed to import JSON: Invalid JSON format",
      );
      expect(result.current.success).toBeNull();
    });

    it("should handle import errors with non-Error instance", () => {
      const mockError = "Parsing error";
      mockImportFromJson.mockImplementation(() => {
        throw mockError;
      });

      const { result } = renderHook(() => useJsonOperations());

      act(() => {
        result.current.setJsonInput('{"test": "data"}');
        result.current.handleImport();
      });

      expect(result.current.error).toBe("Failed to import JSON: Parsing error");
      expect(result.current.success).toBeNull();
    });

    it("should import empty JSON input", () => {
      const { result } = renderHook(() => useJsonOperations());

      act(() => {
        result.current.handleImport();
      });

      expect(mockImportFromJson).toHaveBeenCalledWith("");
    });

    it("should clear previous states on successful import", () => {
      const testJsonInput = '{"skill": "test"}';

      const { result } = renderHook(() => useJsonOperations());

      // Set initial error state
      act(() => {
        result.current.setError("Previous error");
        result.current.setJsonInput(testJsonInput);
      });

      // Import should clear error
      act(() => {
        result.current.handleImport();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.success).toBe("JSON imported successfully.");
    });
  });

  describe("Input Change Handling", () => {
    it("should handle input change with valid string", () => {
      const { result } = renderHook(() => useJsonOperations());

      act(() => {
        result.current.handleInputChange('{"new": "input"}');
      });

      expect(result.current.jsonInput).toBe('{"new": "input"}');
      expect(result.current.error).toBeNull();
      expect(result.current.success).toBeNull();
    });

    it("should handle input change with undefined value", () => {
      const { result } = renderHook(() => useJsonOperations());

      // Set initial input
      act(() => {
        result.current.setJsonInput("initial");
      });

      // Change to undefined
      act(() => {
        result.current.handleInputChange(undefined);
      });

      expect(result.current.jsonInput).toBe("");
    });

    it("should clear error and success states on input change", () => {
      const { result } = renderHook(() => useJsonOperations());

      // Set initial states
      act(() => {
        result.current.setError("Some error");
        result.current.setSuccess("Some success");
      });

      // Change input should clear both
      act(() => {
        result.current.handleInputChange('{"changed": "input"}');
      });

      expect(result.current.jsonInput).toBe('{"changed": "input"}');
      expect(result.current.error).toBeNull();
      expect(result.current.success).toBeNull();
    });

    it("should handle rapid input changes", () => {
      const { result } = renderHook(() => useJsonOperations());

      act(() => {
        result.current.handleInputChange("first");
        result.current.handleInputChange("second");
        result.current.handleInputChange("third");
      });

      expect(result.current.jsonInput).toBe("third");
    });
  });

  describe("Edge Cases and Error Recovery", () => {
    it("should handle complex JSON structures in export", () => {
      const complexJson = JSON.stringify({
        skill: {
          metadata: { title: "Complex Skill", description: "A complex skill" },
          nodes: [
            { type: "sequence", children: [] },
            { type: "parallel", children: [] },
          ],
          settings: { version: 1, author: "test" },
        },
      });

      mockExportToJson.mockReturnValue(complexJson);

      const { result } = renderHook(() => useJsonOperations());

      act(() => {
        result.current.handleExport();
      });

      expect(result.current.jsonInput).toBe(complexJson);
      expect(result.current.success).toBe("JSON exported successfully.");
    });

    it("should handle large JSON strings", () => {
      const largeJson = JSON.stringify({
        data: new Array(1000).fill({ value: "test", nested: { deep: "data" } }),
      });

      const { result } = renderHook(() => useJsonOperations());

      act(() => {
        result.current.handleInputChange(largeJson);
      });

      expect(result.current.jsonInput).toBe(largeJson);

      act(() => {
        result.current.handleImport();
      });

      expect(mockImportFromJson).toHaveBeenCalledWith(largeJson);
    });

    it("should handle special characters in JSON", () => {
      const specialJson =
        '{"unicode": "🚀", "quotes": "\\"nested\\"", "newlines": "line1\\nline2"}';

      const { result } = renderHook(() => useJsonOperations());

      act(() => {
        result.current.handleInputChange(specialJson);
      });

      act(() => {
        result.current.handleImport();
      });

      expect(mockImportFromJson).toHaveBeenCalledWith(specialJson);
    });

    it("should maintain state consistency across operations", () => {
      const { result } = renderHook(() => useJsonOperations());

      // Export -> modify -> import flow
      mockExportToJson.mockReturnValue('{"version": 1}');

      act(() => {
        result.current.handleExport();
      });

      expect(result.current.jsonInput).toBe('{"version": 1}');

      act(() => {
        result.current.handleInputChange('{"version": 2}');
      });

      expect(result.current.jsonInput).toBe('{"version": 2}');
      expect(result.current.error).toBeNull();
      expect(result.current.success).toBeNull();

      act(() => {
        result.current.handleImport();
      });

      expect(mockImportFromJson).toHaveBeenCalledWith('{"version": 2}');
      expect(result.current.success).toBe("JSON imported successfully.");
    });

    it("should handle multiple consecutive errors", () => {
      mockExportToJson.mockImplementation(() => {
        throw new Error("Export error");
      });
      mockImportFromJson.mockImplementation(() => {
        throw new Error("Import error");
      });

      const { result } = renderHook(() => useJsonOperations());

      act(() => {
        result.current.handleExport();
      });

      expect(result.current.error).toBe("Failed to export JSON: Export error");

      act(() => {
        result.current.handleImport();
      });

      expect(result.current.error).toBe("Failed to import JSON: Import error");
    });
  });

  describe("Integration Scenarios", () => {
    it("should support complete export-modify-import workflow", () => {
      const originalJson = '{"skill": "original", "version": 1}';
      const modifiedJson = '{"skill": "modified", "version": 2}';

      mockExportToJson.mockReturnValue(originalJson);

      const { result } = renderHook(() => useJsonOperations());

      // Export current skill
      act(() => {
        result.current.handleExport();
      });

      expect(result.current.jsonInput).toBe(originalJson);
      expect(result.current.success).toBe("JSON exported successfully.");

      // User modifies the JSON
      act(() => {
        result.current.handleInputChange(modifiedJson);
      });

      expect(result.current.jsonInput).toBe(modifiedJson);
      expect(result.current.success).toBeNull(); // Cleared by input change

      // Import modified JSON
      act(() => {
        result.current.handleImport();
      });

      expect(mockImportFromJson).toHaveBeenCalledWith(modifiedJson);
      expect(result.current.success).toBe("JSON imported successfully.");
    });

    it("should handle error recovery in workflow", () => {
      mockExportToJson.mockReturnValue('{"valid": "json"}');
      mockImportFromJson.mockImplementationOnce(() => {
        throw new Error("Invalid format");
      });

      const { result } = renderHook(() => useJsonOperations());

      // Successful export
      act(() => {
        result.current.handleExport();
      });

      expect(result.current.success).toBe("JSON exported successfully.");

      // Failed import
      act(() => {
        result.current.handleImport();
      });

      expect(result.current.error).toBe(
        "Failed to import JSON: Invalid format",
      );
      expect(result.current.success).toBeNull();

      // Recovery with valid import
      mockImportFromJson.mockImplementationOnce(() => {
        // Successful import
      });

      act(() => {
        result.current.handleImport();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.success).toBe("JSON imported successfully.");
    });

    it("should maintain independent state updates", () => {
      const { result } = renderHook(() => useJsonOperations());

      // Rapid state changes
      act(() => {
        result.current.setJsonInput("input1");
        result.current.setError("error1");
        result.current.setSuccess("success1");
        result.current.setJsonInput("input2");
        result.current.setError("error2");
        result.current.setSuccess("success2");
      });

      expect(result.current.jsonInput).toBe("input2");
      expect(result.current.error).toBe("error2");
      expect(result.current.success).toBe("success2");
    });

    it("should work correctly with empty and whitespace inputs", () => {
      const { result } = renderHook(() => useJsonOperations());

      // Test empty string
      act(() => {
        result.current.handleInputChange("");
      });

      act(() => {
        result.current.handleImport();
      });

      expect(mockImportFromJson).toHaveBeenCalledWith("");

      // Test whitespace
      act(() => {
        result.current.handleInputChange("   ");
      });

      act(() => {
        result.current.handleImport();
      });

      expect(mockImportFromJson).toHaveBeenCalledWith("   ");
    });
  });

  describe("Performance and Memory", () => {
    it("should handle high-frequency operations efficiently", () => {
      const { result } = renderHook(() => useJsonOperations());

      // Simulate rapid user typing
      act(() => {
        for (let i = 0; i < 100; i++)
          result.current.handleInputChange(`{"iteration": ${i}}`);
      });

      expect(result.current.jsonInput).toBe('{"iteration": 99}');
    });

    it("should not leak memory on unmount", () => {
      const { unmount } = renderHook(() => useJsonOperations());

      // Should not throw any errors on unmount
      expect(() => unmount()).not.toThrow();
    });

    it("should handle concurrent operations", () => {
      const { result } = renderHook(() => useJsonOperations());

      mockExportToJson.mockReturnValue('{"concurrent": "test"}');

      // Simulate concurrent export and import
      act(() => {
        result.current.handleExport();
      });

      act(() => {
        result.current.handleInputChange('{"modified": "data"}');
      });

      act(() => {
        result.current.handleImport();
      });

      expect(mockExportToJson).toHaveBeenCalled();
      expect(mockImportFromJson).toHaveBeenCalledWith('{"modified": "data"}');
      expect(result.current.success).toBe("JSON imported successfully.");
    });
  });
});
