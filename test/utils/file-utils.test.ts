import { describe, it, expect, vi, beforeEach } from "vitest";
import { fileUtils } from "@utils/file-utils";

// Mock the File System Access API
const mockFileSystemDirectoryHandle = {
  getDirectoryHandle: vi.fn(),
  getFileHandle: vi.fn(),
} as any;

const mockFileSystemFileHandle = {
  getFile: vi.fn(),
  createWritable: vi.fn(),
} as any;

const mockFile = {
  text: vi.fn(),
} as any;

const mockWritableFileStream = {
  write: vi.fn(),
  close: vi.fn(),
} as any;

// Mock window.showDirectoryPicker
Object.defineProperty(window, "showDirectoryPicker", {
  value: vi.fn(),
  writable: true,
});

describe("fileUtils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("requestDirectoryHandle", () => {
    it("should return directory handle when picker succeeds", async () => {
      const mockHandle = mockFileSystemDirectoryHandle;
      (window.showDirectoryPicker as any).mockResolvedValue(mockHandle);

      const result = await fileUtils.requestDirectoryHandle();

      expect(result).toBe(mockHandle);
      expect(window.showDirectoryPicker).toHaveBeenCalledOnce();
    });

    it("should return null when picker fails or is cancelled", async () => {
      (window.showDirectoryPicker as any).mockRejectedValue(
        new Error("User cancelled"),
      );

      const result = await fileUtils.requestDirectoryHandle();

      expect(result).toBeNull();
      expect(window.showDirectoryPicker).toHaveBeenCalledOnce();
    });

    it("should return null when user cancels the picker", async () => {
      (window.showDirectoryPicker as any).mockRejectedValue(
        new DOMException("AbortError"),
      );

      const result = await fileUtils.requestDirectoryHandle();

      expect(result).toBeNull();
    });

    it("should handle SecurityError", async () => {
      (window.showDirectoryPicker as any).mockRejectedValue(
        new DOMException("SecurityError"),
      );

      const result = await fileUtils.requestDirectoryHandle();

      expect(result).toBeNull();
    });
  });

  describe("navigateToDirectory", () => {
    it("should navigate through multiple path segments", async () => {
      const rootHandle = mockFileSystemDirectoryHandle;
      const subHandle1 = { ...mockFileSystemDirectoryHandle };
      const subHandle2 = { ...mockFileSystemDirectoryHandle };

      rootHandle.getDirectoryHandle
        .mockResolvedValueOnce(subHandle1)
        .mockResolvedValueOnce(subHandle2);

      const result = await fileUtils.navigateToDirectory(rootHandle, [
        "folder1",
        "folder2",
      ]);

      expect(rootHandle.getDirectoryHandle).toHaveBeenCalledWith("folder1", {
        create: true,
      });
      expect(rootHandle.getDirectoryHandle).toHaveBeenCalledWith("folder2", {
        create: true,
      });
      expect(result).toBe(subHandle2);
    });

    it("should skip empty path segments", async () => {
      const rootHandle = mockFileSystemDirectoryHandle;
      const subHandle = { ...mockFileSystemDirectoryHandle };

      rootHandle.getDirectoryHandle.mockResolvedValue(subHandle);

      const result = await fileUtils.navigateToDirectory(rootHandle, [
        "",
        "folder",
        "",
      ]);

      expect(rootHandle.getDirectoryHandle).toHaveBeenCalledTimes(1);
      expect(rootHandle.getDirectoryHandle).toHaveBeenCalledWith("folder", {
        create: true,
      });
      expect(result).toBe(subHandle);
    });

    it("should return root handle for empty path segments array", async () => {
      const rootHandle = mockFileSystemDirectoryHandle;

      const result = await fileUtils.navigateToDirectory(rootHandle, []);

      expect(rootHandle.getDirectoryHandle).not.toHaveBeenCalled();
      expect(result).toBe(rootHandle);
    });

    it("should return root handle for all empty path segments", async () => {
      const rootHandle = mockFileSystemDirectoryHandle;

      const result = await fileUtils.navigateToDirectory(rootHandle, [
        "",
        "",
        "",
      ]);

      expect(rootHandle.getDirectoryHandle).not.toHaveBeenCalled();
      expect(result).toBe(rootHandle);
    });

    it("should handle single path segment", async () => {
      const rootHandle = { ...mockFileSystemDirectoryHandle };
      const subHandle = { ...mockFileSystemDirectoryHandle };

      rootHandle.getDirectoryHandle.mockResolvedValue(subHandle);

      const result = await fileUtils.navigateToDirectory(rootHandle, [
        "single",
      ]);

      expect(rootHandle.getDirectoryHandle).toHaveBeenCalledWith("single", {
        create: true,
      });
      expect(result).toBe(subHandle);
    });

    it("should handle deeply nested paths", async () => {
      const rootHandle = { ...mockFileSystemDirectoryHandle };
      const handles = [
        { ...mockFileSystemDirectoryHandle },
        { ...mockFileSystemDirectoryHandle },
        { ...mockFileSystemDirectoryHandle },
      ];

      rootHandle.getDirectoryHandle
        .mockResolvedValueOnce(handles[0])
        .mockResolvedValueOnce(handles[1])
        .mockResolvedValueOnce(handles[2]);

      const result = await fileUtils.navigateToDirectory(rootHandle, [
        "a",
        "b",
        "c",
      ]);

      expect(rootHandle.getDirectoryHandle).toHaveBeenCalledWith("a", {
        create: true,
      });
      expect(rootHandle.getDirectoryHandle).toHaveBeenCalledWith("b", {
        create: true,
      });
      expect(rootHandle.getDirectoryHandle).toHaveBeenCalledWith("c", {
        create: true,
      });
      expect(result).toBe(handles[2]);
    });
  });

  describe("readFile", () => {
    it("should read file content from nested directory", async () => {
      const rootHandle = mockFileSystemDirectoryHandle;
      const dirHandle = { ...mockFileSystemDirectoryHandle };
      const fileHandle = mockFileSystemFileHandle;
      const file = mockFile;

      // Mock the navigation to directory
      vi.spyOn(fileUtils, "navigateToDirectory").mockResolvedValue(dirHandle);

      dirHandle.getFileHandle.mockResolvedValue(fileHandle);
      fileHandle.getFile.mockResolvedValue(file);
      file.text.mockResolvedValue("file content");

      const result = await fileUtils.readFile(
        rootHandle,
        "folder/subfolder/test.txt",
      );

      expect(fileUtils.navigateToDirectory).toHaveBeenCalledWith(rootHandle, [
        "folder",
        "subfolder",
      ]);
      expect(dirHandle.getFileHandle).toHaveBeenCalledWith("test.txt");
      expect(fileHandle.getFile).toHaveBeenCalled();
      expect(file.text).toHaveBeenCalled();
      expect(result).toBe("file content");
    });

    it("should read file from root directory", async () => {
      const rootHandle = mockFileSystemDirectoryHandle;
      const fileHandle = mockFileSystemFileHandle;
      const file = mockFile;

      vi.spyOn(fileUtils, "navigateToDirectory").mockResolvedValue(rootHandle);

      rootHandle.getFileHandle.mockResolvedValue(fileHandle);
      fileHandle.getFile.mockResolvedValue(file);
      file.text.mockResolvedValue("root file content");

      const result = await fileUtils.readFile(rootHandle, "test.txt");

      expect(fileUtils.navigateToDirectory).toHaveBeenCalledWith(
        rootHandle,
        [],
      );
      expect(rootHandle.getFileHandle).toHaveBeenCalledWith("test.txt");
      expect(result).toBe("root file content");
    });

    it("should handle empty filename", async () => {
      const rootHandle = mockFileSystemDirectoryHandle;
      const dirHandle = { ...mockFileSystemDirectoryHandle };
      const fileHandle = mockFileSystemFileHandle;
      const file = mockFile;

      vi.spyOn(fileUtils, "navigateToDirectory").mockResolvedValue(dirHandle);

      dirHandle.getFileHandle.mockResolvedValue(fileHandle);
      fileHandle.getFile.mockResolvedValue(file);
      file.text.mockResolvedValue("content");

      const result = await fileUtils.readFile(rootHandle, "folder/");

      expect(fileUtils.navigateToDirectory).toHaveBeenCalledWith(rootHandle, [
        "folder",
      ]);
      expect(dirHandle.getFileHandle).toHaveBeenCalledWith("");
      expect(result).toBe("content");
    });

    it("should handle file with no extension", async () => {
      const rootHandle = { ...mockFileSystemDirectoryHandle };
      const fileHandle = { ...mockFileSystemFileHandle };
      const file = { ...mockFile };

      vi.spyOn(fileUtils, "navigateToDirectory").mockResolvedValue(rootHandle);

      rootHandle.getFileHandle.mockResolvedValue(fileHandle);
      fileHandle.getFile.mockResolvedValue(file);
      file.text.mockResolvedValue("no extension content");

      const result = await fileUtils.readFile(rootHandle, "README");

      expect(result).toBe("no extension content");
    });

    it("should handle complex path with spaces and special characters", async () => {
      const rootHandle = { ...mockFileSystemDirectoryHandle };
      const dirHandle = { ...mockFileSystemDirectoryHandle };
      const fileHandle = { ...mockFileSystemFileHandle };
      const file = { ...mockFile };

      vi.spyOn(fileUtils, "navigateToDirectory").mockResolvedValue(dirHandle);

      dirHandle.getFileHandle.mockResolvedValue(fileHandle);
      fileHandle.getFile.mockResolvedValue(file);
      file.text.mockResolvedValue("special content");

      const result = await fileUtils.readFile(
        rootHandle,
        "my folder/sub-folder_2/file name.txt",
      );

      expect(fileUtils.navigateToDirectory).toHaveBeenCalledWith(rootHandle, [
        "my folder",
        "sub-folder_2",
      ]);
      expect(dirHandle.getFileHandle).toHaveBeenCalledWith("file name.txt");
      expect(result).toBe("special content");
    });
  });

  describe("writeFile", () => {
    it("should write file content to nested directory", async () => {
      const rootHandle = mockFileSystemDirectoryHandle;
      const dirHandle = { ...mockFileSystemDirectoryHandle };
      const fileHandle = mockFileSystemFileHandle;
      const writableStream = mockWritableFileStream;

      vi.spyOn(fileUtils, "navigateToDirectory").mockResolvedValue(dirHandle);

      dirHandle.getFileHandle.mockResolvedValue(fileHandle);
      fileHandle.createWritable.mockResolvedValue(writableStream);

      await fileUtils.writeFile(
        rootHandle,
        "folder/subfolder/test.txt",
        "content to write",
      );

      expect(fileUtils.navigateToDirectory).toHaveBeenCalledWith(rootHandle, [
        "folder",
        "subfolder",
      ]);
      expect(dirHandle.getFileHandle).toHaveBeenCalledWith("test.txt", {
        create: true,
      });
      expect(fileHandle.createWritable).toHaveBeenCalled();
      expect(writableStream.write).toHaveBeenCalledWith("content to write");
      expect(writableStream.close).toHaveBeenCalled();
    });

    it("should write file to root directory", async () => {
      const rootHandle = mockFileSystemDirectoryHandle;
      const fileHandle = mockFileSystemFileHandle;
      const writableStream = mockWritableFileStream;

      vi.spyOn(fileUtils, "navigateToDirectory").mockResolvedValue(rootHandle);

      rootHandle.getFileHandle.mockResolvedValue(fileHandle);
      fileHandle.createWritable.mockResolvedValue(writableStream);

      await fileUtils.writeFile(rootHandle, "test.txt", "root content");

      expect(fileUtils.navigateToDirectory).toHaveBeenCalledWith(
        rootHandle,
        [],
      );
      expect(rootHandle.getFileHandle).toHaveBeenCalledWith("test.txt", {
        create: true,
      });
      expect(writableStream.write).toHaveBeenCalledWith("root content");
      expect(writableStream.close).toHaveBeenCalled();
    });

    it("should handle empty filename", async () => {
      const rootHandle = mockFileSystemDirectoryHandle;
      const dirHandle = { ...mockFileSystemDirectoryHandle };
      const fileHandle = mockFileSystemFileHandle;
      const writableStream = mockWritableFileStream;

      vi.spyOn(fileUtils, "navigateToDirectory").mockResolvedValue(dirHandle);

      dirHandle.getFileHandle.mockResolvedValue(fileHandle);
      fileHandle.createWritable.mockResolvedValue(writableStream);

      await fileUtils.writeFile(
        rootHandle,
        "folder/",
        "empty filename content",
      );

      expect(fileUtils.navigateToDirectory).toHaveBeenCalledWith(rootHandle, [
        "folder",
      ]);
      expect(dirHandle.getFileHandle).toHaveBeenCalledWith("", {
        create: true,
      });
    });

    it("should handle empty content", async () => {
      const rootHandle = { ...mockFileSystemDirectoryHandle };
      const fileHandle = { ...mockFileSystemFileHandle };
      const writableStream = { ...mockWritableFileStream };

      vi.spyOn(fileUtils, "navigateToDirectory").mockResolvedValue(rootHandle);

      rootHandle.getFileHandle.mockResolvedValue(fileHandle);
      fileHandle.createWritable.mockResolvedValue(writableStream);

      await fileUtils.writeFile(rootHandle, "empty.txt", "");

      expect(writableStream.write).toHaveBeenCalledWith("");
      expect(writableStream.close).toHaveBeenCalled();
    });

    it("should handle JSON content", async () => {
      const rootHandle = { ...mockFileSystemDirectoryHandle };
      const fileHandle = { ...mockFileSystemFileHandle };
      const writableStream = { ...mockWritableFileStream };

      vi.spyOn(fileUtils, "navigateToDirectory").mockResolvedValue(rootHandle);

      rootHandle.getFileHandle.mockResolvedValue(fileHandle);
      fileHandle.createWritable.mockResolvedValue(writableStream);

      const jsonContent = JSON.stringify({ key: "value", number: 42 });
      await fileUtils.writeFile(rootHandle, "data.json", jsonContent);

      expect(writableStream.write).toHaveBeenCalledWith(jsonContent);
    });

    it("should handle unicode content", async () => {
      const rootHandle = { ...mockFileSystemDirectoryHandle };
      const fileHandle = { ...mockFileSystemFileHandle };
      const writableStream = { ...mockWritableFileStream };

      vi.spyOn(fileUtils, "navigateToDirectory").mockResolvedValue(rootHandle);

      rootHandle.getFileHandle.mockResolvedValue(fileHandle);
      fileHandle.createWritable.mockResolvedValue(writableStream);

      const unicodeContent = "Hello 世界 🌍 café naïve résumé";
      await fileUtils.writeFile(rootHandle, "unicode.txt", unicodeContent);

      expect(writableStream.write).toHaveBeenCalledWith(unicodeContent);
    });
  });
});
