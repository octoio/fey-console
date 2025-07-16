import { describe, it, expect, vi, beforeEach } from "vitest";
import { FolderSelector } from "@components/file-manager/folder-selector";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock the File System Access API
const mockShowDirectoryPicker = vi.fn();
Object.defineProperty(window, "showDirectoryPicker", {
  value: mockShowDirectoryPicker,
  writable: true,
  configurable: true,
});

describe("FolderSelector", () => {
  const mockOnFolderSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render folder selector interface", () => {
      render(
        <FolderSelector
          onFolderSelect={mockOnFolderSelect}
          selectedFolder={null}
          loading={false}
        />,
      );

      expect(screen.getByText("Entity References Folder")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(
          "Select a folder containing entity definitions",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /browse folder/i }),
      ).toBeInTheDocument();
    });

    it("should show selected folder when provided", () => {
      render(
        <FolderSelector
          onFolderSelect={mockOnFolderSelect}
          selectedFolder="test-folder"
          loading={false}
        />,
      );

      expect(screen.getByDisplayValue("test-folder")).toBeInTheDocument();
      expect(
        screen.getByText("Using entity references from: test-folder"),
      ).toBeInTheDocument();
    });

    it("should show loading state", () => {
      render(
        <FolderSelector
          onFolderSelect={mockOnFolderSelect}
          selectedFolder={null}
          loading={true}
        />,
      );

      const button = screen.getByRole("button", { name: /browse folder/i });
      expect(button).toHaveClass("ant-btn-loading");
    });
  });

  describe("API Support Detection", () => {
    it("should show warning when File System API is not supported", () => {
      // Mock unsupported API by setting to undefined
      const originalShowDirectoryPicker = (window as any).showDirectoryPicker;
      (window as any).showDirectoryPicker = undefined;

      render(
        <FolderSelector
          onFolderSelect={mockOnFolderSelect}
          selectedFolder={null}
          loading={false}
        />,
      );

      expect(
        screen.getByText("Browser Compatibility Issue"),
      ).toBeInTheDocument();
      expect(
        screen.getAllByText(/Chrome browser with File System Access API/)[0],
      ).toBeInTheDocument();

      const button = screen.getByRole("button", { name: /browse folder/i });
      expect(button).toBeDisabled();

      // Restore the original property
      (window as any).showDirectoryPicker = originalShowDirectoryPicker;
    });

    it("should enable button when API is supported", () => {
      // Restore API support
      Object.defineProperty(window, "showDirectoryPicker", {
        value: mockShowDirectoryPicker,
        writable: true,
      });

      render(
        <FolderSelector
          onFolderSelect={mockOnFolderSelect}
          selectedFolder={null}
          loading={false}
        />,
      );

      const button = screen.getByRole("button", { name: /browse folder/i });
      expect(button).not.toBeDisabled();
    });
  });

  describe("Folder Selection", () => {
    beforeEach(() => {
      // Ensure API is supported for these tests
      Object.defineProperty(window, "showDirectoryPicker", {
        value: mockShowDirectoryPicker,
        writable: true,
      });
    });

    it("should call onFolderSelect when folder is selected successfully", async () => {
      const mockDirHandle = {
        name: "test-folder",
        values: vi.fn().mockReturnValue({
          [Symbol.asyncIterator]: async function* () {
            yield { name: "test.json", kind: "file" };
          },
        }),
      };

      mockShowDirectoryPicker.mockResolvedValue(mockDirHandle);

      render(
        <FolderSelector
          onFolderSelect={mockOnFolderSelect}
          selectedFolder={null}
          loading={false}
        />,
      );

      const button = screen.getByRole("button", { name: /browse folder/i });
      fireEvent.click(button);

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockShowDirectoryPicker).toHaveBeenCalledWith({
        id: "entityReferences",
        mode: "read",
      });
      expect(mockOnFolderSelect).toHaveBeenCalledWith(
        "test-folder",
        mockDirHandle,
      );
    });

    it("should handle user cancellation gracefully", async () => {
      const abortError = new DOMException("User cancelled", "AbortError");
      mockShowDirectoryPicker.mockRejectedValue(abortError);

      render(
        <FolderSelector
          onFolderSelect={mockOnFolderSelect}
          selectedFolder={null}
          loading={false}
        />,
      );

      const button = screen.getByRole("button", { name: /browse folder/i });
      fireEvent.click(button);

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockOnFolderSelect).not.toHaveBeenCalled();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("should show error when folder selection fails", async () => {
      const error = new Error("Permission denied");
      mockShowDirectoryPicker.mockRejectedValue(error);

      render(
        <FolderSelector
          onFolderSelect={mockOnFolderSelect}
          selectedFolder={null}
          loading={false}
        />,
      );

      const button = screen.getByRole("button", { name: /browse folder/i });
      fireEvent.click(button);

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(
        screen.getByText(/Error selecting folder: Permission denied/),
      ).toBeInTheDocument();
    });

    it("should clear error when close button is clicked", async () => {
      const error = new Error("Test error");
      mockShowDirectoryPicker.mockRejectedValue(error);

      render(
        <FolderSelector
          onFolderSelect={mockOnFolderSelect}
          selectedFolder={null}
          loading={false}
        />,
      );

      const button = screen.getByRole("button", { name: /browse folder/i });
      fireEvent.click(button);

      // Wait for error to appear
      await new Promise((resolve) => setTimeout(resolve, 0));

      const closeButton = screen.getByRole("button", { name: /close/i });
      fireEvent.click(closeButton);

      expect(
        screen.queryByText(/Error selecting folder/),
      ).not.toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should show error when API is not supported and button is clicked", async () => {
      const originalShowDirectoryPicker = (window as any).showDirectoryPicker;
      (window as any).showDirectoryPicker = undefined;

      render(
        <FolderSelector
          onFolderSelect={mockOnFolderSelect}
          selectedFolder={null}
          loading={false}
        />,
      );

      // The button should be disabled, but test the fallback
      expect(
        screen.getAllByText(/Chrome browser with File System Access API/)[0],
      ).toBeInTheDocument();

      // Restore the original property
      (window as any).showDirectoryPicker = originalShowDirectoryPicker;
    });
  });

  describe("Props", () => {
    it("should handle missing callbacks gracefully", () => {
      render(
        <FolderSelector
          onFolderSelect={() => {}}
          selectedFolder={null}
          loading={false}
        />,
      );

      expect(screen.getByText("Entity References Folder")).toBeInTheDocument();
    });

    it("should handle empty selected folder", () => {
      render(
        <FolderSelector
          onFolderSelect={mockOnFolderSelect}
          selectedFolder=""
          loading={false}
        />,
      );

      const input = screen.getByPlaceholderText(
        "Select a folder containing entity definitions",
      );
      expect(input).toHaveValue("");
    });
  });
});
