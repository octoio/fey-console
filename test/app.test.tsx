import { notification } from "antd";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { App } from "@/app";
import { EntityType, getDefaultEntityReferences } from "@models/common.types";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import * as entityScanner from "@utils/entity-scanner";
import { FileInfo } from "@utils/entity-scanner";

// Mock all dependencies
vi.mock("@utils/entity-scanner", () => ({
  scanFolderForEntities: vi.fn(),
}));

const mockScanFolderForEntities = vi.mocked(
  entityScanner.scanFolderForEntities,
);

const mockNotification = vi.mocked(notification);

vi.mock("@components/file-list", () => ({
  FileList: vi.fn(({ files }) => (
    <div data-testid="file-list">{files.length} files</div>
  )),
}));

vi.mock("@components/folder-selector", () => ({
  FolderSelector: vi.fn(({ onFolderSelect, selectedFolder, loading }) => (
    <div data-testid="folder-selector">
      <button
        onClick={() =>
          onFolderSelect("test-folder", {} as FileSystemDirectoryHandle)
        }
      >
        Select Folder
      </button>
      <div>Selected: {selectedFolder || "none"}</div>
      <div>Loading: {loading ? "yes" : "no"}</div>
    </div>
  )),
}));

vi.mock("@components/loading-spinner", () => ({
  LoadingSpinner: vi.fn(({ tip }) => (
    <div data-testid="loading-spinner">{tip}</div>
  )),
}));

// Mock the lazy-loaded SkillEditor
vi.mock("@components/skill-editor", () => ({
  SkillEditor: vi.fn(({ entityReferences, files, directoryHandle }) => (
    <div data-testid="skill-editor">
      <div>Entities: {Object.keys(entityReferences).length}</div>
      <div>Files: {files.length}</div>
      <div>Directory: {directoryHandle ? "available" : "none"}</div>
    </div>
  )),
}));

// Mock antd notification
vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  return {
    ...actual,
    notification: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

// Helper function to create mock scan result with proper types
const createMockScanResult = (files: FileInfo[] = []) => ({
  entities: getDefaultEntityReferences(),
  files,
});

describe("App Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the main app container", () => {
      render(<App />);

      expect(
        screen.getByRole("heading", { name: "Skill Editor" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("tablist")).toBeInTheDocument();
    });

    it("should render all tab items", () => {
      render(<App />);

      expect(screen.getByText("Load Files")).toBeInTheDocument();
      expect(screen.getByText("File List")).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: "Skill Editor" }),
      ).toBeInTheDocument();
    });

    it("should start with Load Files tab active", () => {
      render(<App />);

      // Default tab should be visible
      expect(screen.getByTestId("folder-selector")).toBeInTheDocument();
    });

    it("should render with default state", () => {
      render(<App />);

      const folderSelector = screen.getByTestId("folder-selector");
      expect(folderSelector).toHaveTextContent("Selected: none");
      expect(folderSelector).toHaveTextContent("Loading: no");
    });
  });

  describe("Tab Navigation", () => {
    it("should switch to File List tab", async () => {
      render(<App />);

      fireEvent.click(screen.getByText("File List"));

      await waitFor(() => {
        expect(screen.getByTestId("file-list")).toBeInTheDocument();
        expect(screen.getByTestId("file-list")).toHaveTextContent("0 files");
      });
    });

    it("should switch to Skill Editor tab", async () => {
      render(<App />);

      fireEvent.click(screen.getByRole("tab", { name: "Skill Editor" }));

      await waitFor(() => {
        expect(screen.getByTestId("skill-editor")).toBeInTheDocument();
      });
    });

    it("should maintain state when switching tabs", async () => {
      render(<App />);

      // Start with File List tab
      fireEvent.click(screen.getByText("File List"));
      await waitFor(() => {
        expect(screen.getByTestId("file-list")).toBeInTheDocument();
      });

      // Switch to Load Files tab
      fireEvent.click(screen.getByText("Load Files"));
      await waitFor(() => {
        expect(screen.getByTestId("folder-selector")).toBeInTheDocument();
      });

      // Switch back to File List tab
      fireEvent.click(screen.getByText("File List"));
      await waitFor(() => {
        expect(screen.getByTestId("file-list")).toBeInTheDocument();
      });
    });
  });

  describe("Folder Selection", () => {
    beforeEach(() => {
      const mockScanResult = createMockScanResult([
        {
          name: "test1.json",
          path: "test1.json",
          isEntity: true,
          entityType: "skill",
        },
        {
          name: "test2.json",
          path: "test2.json",
          isEntity: true,
          entityType: "weapon",
        },
      ]);

      mockScanFolderForEntities.mockResolvedValue(mockScanResult);
    });

    it("should handle folder selection successfully", async () => {
      render(<App />);

      fireEvent.click(screen.getByText("Select Folder"));

      await waitFor(() => {
        expect(entityScanner.scanFolderForEntities).toHaveBeenCalledWith(
          "test-folder",
          expect.any(Object),
        );
      });

      await waitFor(() => {
        expect(mockNotification.success).toHaveBeenCalledWith({
          message: "Entities Loaded",
          description: "Successfully loaded 2 files from test-folder",
        });
      });
    });

    it("should update selected folder state", async () => {
      render(<App />);

      fireEvent.click(screen.getByText("Select Folder"));

      await waitFor(() => {
        expect(screen.getByText("Selected: test-folder")).toBeInTheDocument();
      });
    });

    it("should show loading state during scan", async () => {
      // Make scanFolderForEntities return a pending promise
      let resolvePromise: (
        value: ReturnType<typeof createMockScanResult>,
      ) => void;
      const pendingPromise = new Promise<
        ReturnType<typeof createMockScanResult>
      >((resolve) => {
        resolvePromise = resolve;
      });

      mockScanFolderForEntities.mockReturnValue(pendingPromise);

      render(<App />);

      fireEvent.click(screen.getByText("Select Folder"));

      // Should show loading
      await waitFor(() => {
        expect(screen.getByText("Loading: yes")).toBeInTheDocument();
      });

      // Resolve the promise
      resolvePromise!(createMockScanResult([]));

      // Loading should be done
      await waitFor(() => {
        expect(screen.getByText("Loading: no")).toBeInTheDocument();
      });
    });

    it("should handle scan errors gracefully", async () => {
      const error = new Error("Failed to scan folder");
      mockScanFolderForEntities.mockRejectedValue(error);

      render(<App />);

      fireEvent.click(screen.getByText("Select Folder"));

      await waitFor(() => {
        expect(mockNotification.error).toHaveBeenCalledWith({
          message: "Error Loading Entities",
          description: "Error: Failed to scan folder",
        });
      });

      // Loading should be done even on error
      await waitFor(() => {
        expect(screen.getByText("Loading: no")).toBeInTheDocument();
      });
    });
  });

  describe("File List Integration", () => {
    it("should display files after successful scan", async () => {
      const mockScanResult = {
        entities: Object.fromEntries(
          Object.values(EntityType).map((type) => [type, []]),
        ) as Record<EntityType, []>,
        files: [
          { name: "file1.json", path: "file1.json", isEntity: true },
          { name: "file2.json", path: "file2.json", isEntity: true },
          { name: "file3.json", path: "file3.json", isEntity: true },
        ],
      };

      mockScanFolderForEntities.mockResolvedValue(mockScanResult);

      render(<App />);

      fireEvent.click(screen.getByText("Select Folder"));

      await waitFor(() => {
        expect(entityScanner.scanFolderForEntities).toHaveBeenCalled();
      });

      // Switch to File List tab
      fireEvent.click(screen.getByText("File List"));

      await waitFor(() => {
        expect(screen.getByTestId("file-list")).toHaveTextContent("3 files");
      });
    });

    it("should start with empty file list", () => {
      render(<App />);

      fireEvent.click(screen.getByText("File List"));

      expect(screen.getByTestId("file-list")).toHaveTextContent("0 files");
    });
  });

  describe("Skill Editor Integration", () => {
    it("should pass entity references to SkillEditor", async () => {
      const mockScanResult = createMockScanResult([]);

      mockScanFolderForEntities.mockResolvedValue(mockScanResult);

      render(<App />);

      fireEvent.click(screen.getByText("Select Folder"));

      await waitFor(() => {
        expect(entityScanner.scanFolderForEntities).toHaveBeenCalled();
      });

      // Switch to Skill Editor tab
      fireEvent.click(screen.getByRole("tab", { name: "Skill Editor" }));

      await waitFor(() => {
        const skillEditor = screen.getByTestId("skill-editor");
        expect(skillEditor).toHaveTextContent("Entities: 16"); // All EntityType enum values
        expect(skillEditor).toHaveTextContent("Directory: available");
      });
    });

    it("should load skill editor component successfully", async () => {
      render(<App />);

      fireEvent.click(screen.getByRole("tab", { name: "Skill Editor" }));

      // Wait for the SkillEditor component to load and render
      await waitFor(() => {
        expect(screen.getByTestId("skill-editor")).toBeInTheDocument();
      });

      // Verify that the SkillEditor is showing the expected content
      const skillEditor = screen.getByTestId("skill-editor");
      expect(skillEditor).toHaveTextContent("Entities: 16");
      expect(skillEditor).toHaveTextContent("Files: 0");
      expect(skillEditor).toHaveTextContent("Directory: none");
    });
  });

  describe("Error Handling", () => {
    it("should handle string errors", async () => {
      mockScanFolderForEntities.mockRejectedValue("String error");

      render(<App />);

      fireEvent.click(screen.getByText("Select Folder"));

      await waitFor(() => {
        expect(mockNotification.error).toHaveBeenCalledWith({
          message: "Error Loading Entities",
          description: "String error",
        });
      });
    });

    it("should handle null errors", async () => {
      mockScanFolderForEntities.mockRejectedValue(null);

      render(<App />);

      fireEvent.click(screen.getByText("Select Folder"));

      await waitFor(() => {
        expect(mockNotification.error).toHaveBeenCalledWith({
          message: "Error Loading Entities",
          description: "null",
        });
      });
    });

    it("should handle undefined errors", async () => {
      mockScanFolderForEntities.mockRejectedValue(undefined);

      render(<App />);

      fireEvent.click(screen.getByText("Select Folder"));

      await waitFor(() => {
        expect(mockNotification.error).toHaveBeenCalledWith({
          message: "Error Loading Entities",
          description: "undefined",
        });
      });
    });
  });

  describe("State Management", () => {
    it("should maintain independent state for each tab", async () => {
      const mockScanResult = createMockScanResult([
        { name: "test.json", path: "test.json", isEntity: true },
      ]);

      mockScanFolderForEntities.mockResolvedValue(mockScanResult);

      render(<App />);

      // Select folder in Load Files tab
      fireEvent.click(screen.getByText("Select Folder"));

      await waitFor(() => {
        expect(screen.getByText("Selected: test-folder")).toBeInTheDocument();
      });

      // Check File List tab reflects the data
      fireEvent.click(screen.getByText("File List"));
      await waitFor(() => {
        expect(screen.getByTestId("file-list")).toHaveTextContent("1 files");
      });

      // Check Skill Editor tab gets the data
      fireEvent.click(screen.getByRole("tab", { name: "Skill Editor" }));
      await waitFor(() => {
        const skillEditor = screen.getByTestId("skill-editor");
        expect(skillEditor).toHaveTextContent("Files: 1");
        expect(skillEditor).toHaveTextContent("Directory: available");
      });
    });

    it("should handle multiple folder selections", async () => {
      const mockScanResult1 = createMockScanResult([
        { name: "file1.json", path: "file1.json", isEntity: true },
      ]);

      const mockScanResult2 = createMockScanResult([
        { name: "file2.json", path: "file2.json", isEntity: true },
        { name: "file3.json", path: "file3.json", isEntity: true },
      ]);

      mockScanFolderForEntities
        .mockResolvedValueOnce(mockScanResult1)
        .mockResolvedValueOnce(mockScanResult2);

      render(<App />);

      // First folder selection
      fireEvent.click(screen.getByText("Select Folder"));

      await waitFor(() => {
        expect(mockNotification.success).toHaveBeenCalledWith({
          message: "Entities Loaded",
          description: "Successfully loaded 1 files from test-folder",
        });
      });

      // Second folder selection (simulate another folder selection)
      fireEvent.click(screen.getByText("Select Folder"));

      await waitFor(() => {
        expect(mockNotification.success).toHaveBeenCalledWith({
          message: "Entities Loaded",
          description: "Successfully loaded 2 files from test-folder",
        });
      });

      expect(entityScanner.scanFolderForEntities).toHaveBeenCalledTimes(2);
    });
  });

  describe("Component Configuration", () => {
    it("should use correct Ant Design theme", () => {
      render(<App />);

      // Check if ConfigProvider is working by verifying components render
      expect(screen.getByRole("tablist")).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: "Skill Editor" }),
      ).toBeInTheDocument();
    });

    it("should wrap content in AntApp component", () => {
      render(<App />);

      // Should have the app structure
      expect(
        screen.getByRole("heading", { name: "Skill Editor" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("tablist")).toBeInTheDocument();
    });
  });
});
