import { describe, it, expect, vi, beforeEach } from "vitest";
import { useFileOperations } from "@hooks/use-file-operations";
import { renderHook, act } from "@testing-library/react";
import { fileUtils } from "@utils/file-utils";

// Mock fileUtils
vi.mock("@utils/file-utils", () => ({
  fileUtils: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    requestDirectoryHandle: vi.fn(),
  },
}));

// Mock skill store
vi.mock("@store/skill.store", () => ({
  useSkillStore: () => ({
    importFromJson: vi.fn(),
  }),
}));

describe("useFileOperations Hook", () => {
  const mockSetSuccess = vi.fn();
  const mockSetError = vi.fn();
  const mockDirectoryHandle = {} as FileSystemDirectoryHandle;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should initialize with empty selected and destination files", () => {
      const { result } = renderHook(() =>
        useFileOperations(
          mockDirectoryHandle,
          "test json",
          mockSetSuccess,
          mockSetError,
        ),
      );

      expect(result.current.selectedFile).toBe("");
      expect(result.current.destinationFile).toBe("");
    });

    it("should provide handler functions", () => {
      const { result } = renderHook(() =>
        useFileOperations(
          mockDirectoryHandle,
          "test json",
          mockSetSuccess,
          mockSetError,
        ),
      );

      expect(typeof result.current.setSelectedFile).toBe("function");
      expect(typeof result.current.setDestinationFile).toBe("function");
      expect(typeof result.current.handleLoadFromFile).toBe("function");
      expect(typeof result.current.handleSaveToFile).toBe("function");
    });
  });

  describe("File Selection", () => {
    it("should update selected file", () => {
      const { result } = renderHook(() =>
        useFileOperations(
          mockDirectoryHandle,
          "test json",
          mockSetSuccess,
          mockSetError,
        ),
      );

      act(() => {
        result.current.setSelectedFile("test-file.json");
      });

      expect(result.current.selectedFile).toBe("test-file.json");
    });

    it("should update destination file", () => {
      const { result } = renderHook(() =>
        useFileOperations(
          mockDirectoryHandle,
          "test json",
          mockSetSuccess,
          mockSetError,
        ),
      );

      act(() => {
        result.current.setDestinationFile("output-file.json");
      });

      expect(result.current.destinationFile).toBe("output-file.json");
    });
  });

  describe("Load From File", () => {
    it("should load file content successfully", async () => {
      const testContent = JSON.stringify({ test: "data" });
      const testFilePath = "skills/fireball.json";

      vi.mocked(fileUtils.readFile).mockResolvedValue(testContent);

      const { result } = renderHook(() =>
        useFileOperations(
          mockDirectoryHandle,
          "test json",
          mockSetSuccess,
          mockSetError,
        ),
      );

      await act(async () => {
        await result.current.handleLoadFromFile(testFilePath);
      });

      expect(fileUtils.readFile).toHaveBeenCalledWith(
        mockDirectoryHandle,
        testFilePath,
      );
      expect(mockSetSuccess).toHaveBeenCalledWith(
        `Successfully loaded JSON from ${testFilePath}.`,
      );
      expect(mockSetError).not.toHaveBeenCalled();
    });

    it("should handle file read errors", async () => {
      const testFilePath = "invalid/path.json";

      vi.mocked(fileUtils.readFile).mockRejectedValue(
        new Error("File not found"),
      );

      const { result } = renderHook(() =>
        useFileOperations(
          mockDirectoryHandle,
          "test json",
          mockSetSuccess,
          mockSetError,
        ),
      );

      await act(async () => {
        await result.current.handleLoadFromFile(testFilePath);
      });

      expect(fileUtils.readFile).toHaveBeenCalledWith(
        mockDirectoryHandle,
        testFilePath,
      );
      expect(mockSetError).toHaveBeenCalledWith(
        `Failed to load JSON from file: ${testFilePath}`,
      );
      expect(mockSetSuccess).not.toHaveBeenCalled();
    });

    it("should not execute when directory handle is null", async () => {
      const { result } = renderHook(() =>
        useFileOperations(null, "test json", mockSetSuccess, mockSetError),
      );

      await act(async () => {
        await result.current.handleLoadFromFile("test.json");
      });

      expect(fileUtils.readFile).not.toHaveBeenCalled();
      expect(mockSetSuccess).not.toHaveBeenCalled();
      expect(mockSetError).not.toHaveBeenCalled();
    });
  });

  describe("Save To File", () => {
    it("should save file successfully with selected file", async () => {
      const testJsonInput = JSON.stringify({ skill: "fireball" });
      const testFilePath = "skills/fireball.json";

      vi.mocked(fileUtils.writeFile).mockResolvedValue();

      const { result } = renderHook(() =>
        useFileOperations(
          mockDirectoryHandle,
          testJsonInput,
          mockSetSuccess,
          mockSetError,
        ),
      );

      act(() => {
        result.current.setSelectedFile(testFilePath);
      });

      await act(async () => {
        await result.current.handleSaveToFile();
      });

      expect(fileUtils.writeFile).toHaveBeenCalledWith(
        mockDirectoryHandle,
        testFilePath,
        testJsonInput,
      );
      expect(mockSetSuccess).toHaveBeenCalledWith(
        `Successfully wrote JSON to ${testFilePath}.`,
      );
      expect(mockSetError).not.toHaveBeenCalled();
    });

    it("should prioritize destination file over selected file", async () => {
      const testJsonInput = JSON.stringify({ skill: "icebolt" });
      const selectedFile = "skills/fireball.json";
      const destinationFile = "skills/icebolt.json";

      vi.mocked(fileUtils.writeFile).mockResolvedValue();

      const { result } = renderHook(() =>
        useFileOperations(
          mockDirectoryHandle,
          testJsonInput,
          mockSetSuccess,
          mockSetError,
        ),
      );

      act(() => {
        result.current.setSelectedFile(selectedFile);
        result.current.setDestinationFile(destinationFile);
      });

      await act(async () => {
        await result.current.handleSaveToFile();
      });

      expect(fileUtils.writeFile).toHaveBeenCalledWith(
        mockDirectoryHandle,
        destinationFile,
        testJsonInput,
      );
      expect(mockSetSuccess).toHaveBeenCalledWith(
        `Successfully wrote JSON to ${destinationFile}.`,
      );
    });

    it("should not save when jsonInput is empty", async () => {
      const { result } = renderHook(() =>
        useFileOperations(
          mockDirectoryHandle,
          "",
          mockSetSuccess,
          mockSetError,
        ),
      );

      act(() => {
        result.current.setSelectedFile("skills/test.json");
      });

      await act(async () => {
        await result.current.handleSaveToFile();
      });

      expect(fileUtils.writeFile).not.toHaveBeenCalled();
      expect(mockSetSuccess).not.toHaveBeenCalled();
      expect(mockSetError).not.toHaveBeenCalled();
    });

    it("should not save when no file path is specified", async () => {
      const testJsonInput = JSON.stringify({ skill: "test" });

      const { result } = renderHook(() =>
        useFileOperations(
          mockDirectoryHandle,
          testJsonInput,
          mockSetSuccess,
          mockSetError,
        ),
      );

      await act(async () => {
        await result.current.handleSaveToFile();
      });

      expect(fileUtils.writeFile).not.toHaveBeenCalled();
      expect(mockSetSuccess).not.toHaveBeenCalled();
      expect(mockSetError).not.toHaveBeenCalled();
    });

    it("should handle write errors", async () => {
      const testJsonInput = JSON.stringify({ skill: "fireball" });
      const testFilePath = "readonly/skills.json";

      vi.mocked(fileUtils.writeFile).mockRejectedValue(
        new Error("Permission denied"),
      );

      const { result } = renderHook(() =>
        useFileOperations(
          mockDirectoryHandle,
          testJsonInput,
          mockSetSuccess,
          mockSetError,
        ),
      );

      act(() => {
        result.current.setSelectedFile(testFilePath);
      });

      await act(async () => {
        await result.current.handleSaveToFile();
      });

      expect(fileUtils.writeFile).toHaveBeenCalledWith(
        mockDirectoryHandle,
        testFilePath,
        testJsonInput,
      );
      expect(mockSetError).toHaveBeenCalledWith(
        `Failed to save JSON to file: ${testFilePath}`,
      );
      expect(mockSetSuccess).not.toHaveBeenCalled();
    });
  });

  describe("Directory Handle Management", () => {
    it("should request directory handle when none provided", async () => {
      const testJsonInput = JSON.stringify({ skill: "lightning" });
      const testFilePath = "skills/lightning.json";
      const newDirectoryHandle = {} as FileSystemDirectoryHandle;

      vi.mocked(fileUtils.requestDirectoryHandle).mockResolvedValue(
        newDirectoryHandle,
      );
      vi.mocked(fileUtils.writeFile).mockResolvedValue();

      const { result } = renderHook(() =>
        useFileOperations(null, testJsonInput, mockSetSuccess, mockSetError),
      );

      act(() => {
        result.current.setSelectedFile(testFilePath);
      });

      await act(async () => {
        await result.current.handleSaveToFile();
      });

      expect(fileUtils.requestDirectoryHandle).toHaveBeenCalled();
      expect(fileUtils.writeFile).toHaveBeenCalledWith(
        newDirectoryHandle,
        testFilePath,
        testJsonInput,
      );
      expect(mockSetSuccess).toHaveBeenCalledWith(
        `Successfully wrote JSON to ${testFilePath}.`,
      );
    });

    it("should handle directory handle request cancellation", async () => {
      const testJsonInput = JSON.stringify({ skill: "healing" });

      vi.mocked(fileUtils.requestDirectoryHandle).mockResolvedValue(null);

      const { result } = renderHook(() =>
        useFileOperations(null, testJsonInput, mockSetSuccess, mockSetError),
      );

      act(() => {
        result.current.setSelectedFile("skills/healing.json");
      });

      await act(async () => {
        await result.current.handleSaveToFile();
      });

      expect(fileUtils.requestDirectoryHandle).toHaveBeenCalled();
      expect(fileUtils.writeFile).not.toHaveBeenCalled();
      expect(mockSetSuccess).not.toHaveBeenCalled();
      expect(mockSetError).not.toHaveBeenCalled();
    });
  });
});
