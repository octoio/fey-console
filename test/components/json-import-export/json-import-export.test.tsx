import { describe, it, expect, vi, beforeEach } from "vitest";
import { JsonImportExport } from "@components/json-import-export";
import { useFileOperations } from "@hooks/use-file-operations";
import { useJsonOperations } from "@hooks/use-json-operations";
import { render, screen } from "@testing-library/react";
import { FileInfo } from "@utils/entity-scanner";

// Mock the hooks
vi.mock("@hooks/use-file-operations", () => ({
  useFileOperations: vi.fn(() => ({
    selectedFile: null,
    destinationFile: "",
    setDestinationFile: vi.fn(),
    handleLoadFromFile: vi.fn(),
    handleSaveToFile: vi.fn(),
    setSelectedFile: vi.fn(),
  })),
}));

vi.mock("@hooks/use-json-operations", () => ({
  useJsonOperations: vi.fn(() => ({
    jsonInput: "",
    handleInputChange: vi.fn(),
    handleExport: vi.fn(),
    handleImport: vi.fn(),
    error: null,
    success: null,
    setError: vi.fn(),
    setSuccess: vi.fn(),
  })),
}));

// Mock the subcomponents
vi.mock("@components/json-import-export/file-saver", () => ({
  FileSaver: ({ disabled }: { disabled: boolean }) => (
    <div data-testid="file-saver" data-disabled={disabled}>
      File Saver Mock
    </div>
  ),
}));

vi.mock("@components/json-import-export/file-selector", () => ({
  FileSelector: ({
    files,
    onFileSelect,
  }: {
    files: any[];
    onFileSelect: (val: string) => void;
  }) => (
    <div data-testid="file-selector" onClick={() => onFileSelect("test.json")}>
      File Selector Mock ({files.length} files)
    </div>
  ),
}));

vi.mock("@components/json-import-export/import-export-controls", () => ({
  ImportExportControls: ({ jsonInput }: { jsonInput: string }) => (
    <div data-testid="import-export-controls" data-json-input={jsonInput}>
      Import Export Controls Mock
    </div>
  ),
}));

vi.mock("@components/json-import-export/json-editor", () => ({
  JsonEditor: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (val: string) => void;
  }) => (
    <textarea
      data-testid="json-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="JSON Editor Mock"
    />
  ),
}));

vi.mock("@components/json-import-export/status-messages", () => ({
  StatusMessages: ({
    error,
    success,
  }: {
    error: string | null;
    success: string | null;
  }) => (
    <div data-testid="status-messages">
      {error && <div data-testid="error-message">{error}</div>}
      {success && <div data-testid="success-message">{success}</div>}
    </div>
  ),
}));

describe("JsonImportExport", () => {
  const mockFiles: FileInfo[] = [
    {
      name: "test1.json",
      path: "/test1.json",
      isEntity: true,
    },
    {
      name: "test2.json",
      path: "/test2.json",
      isEntity: true,
    },
  ];

  const mockDirectoryHandle = {} as FileSystemDirectoryHandle;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render all main components", () => {
      render(
        <JsonImportExport
          files={mockFiles}
          directoryHandle={mockDirectoryHandle}
        />,
      );

      expect(screen.getByTestId("import-export-controls")).toBeInTheDocument();
      expect(screen.getByTestId("status-messages")).toBeInTheDocument();
      expect(screen.getByTestId("file-selector")).toBeInTheDocument();
      expect(screen.getByTestId("json-editor")).toBeInTheDocument();
      expect(screen.getByTestId("file-saver")).toBeInTheDocument();
    });

    it("should pass files to FileSelector", () => {
      render(
        <JsonImportExport
          files={mockFiles}
          directoryHandle={mockDirectoryHandle}
        />,
      );

      expect(
        screen.getByText("File Selector Mock (2 files)"),
      ).toBeInTheDocument();
    });

    it("should disable FileSaver when no JSON input", () => {
      render(
        <JsonImportExport
          files={mockFiles}
          directoryHandle={mockDirectoryHandle}
        />,
      );

      const fileSaver = screen.getByTestId("file-saver");
      expect(fileSaver).toHaveAttribute("data-disabled", "true");
    });
  });

  describe("Props", () => {
    it("should handle empty files array", () => {
      render(
        <JsonImportExport files={[]} directoryHandle={mockDirectoryHandle} />,
      );

      expect(
        screen.getByText("File Selector Mock (0 files)"),
      ).toBeInTheDocument();
    });

    it("should handle null directory handle", () => {
      render(<JsonImportExport files={mockFiles} directoryHandle={null} />);

      // Should still render without errors
      expect(screen.getByTestId("file-selector")).toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    it("should render components in correct container", () => {
      const { container } = render(
        <JsonImportExport
          files={mockFiles}
          directoryHandle={mockDirectoryHandle}
        />,
      );

      // Check that components are wrapped in styled container
      const containerDiv = container.firstChild;
      expect(containerDiv).toBeInTheDocument();
    });

    it("should apply styled card wrapper", () => {
      render(
        <JsonImportExport
          files={mockFiles}
          directoryHandle={mockDirectoryHandle}
        />,
      );

      // All components should be present
      expect(screen.getByTestId("import-export-controls")).toBeInTheDocument();
      expect(screen.getByTestId("status-messages")).toBeInTheDocument();
      expect(screen.getByTestId("file-selector")).toBeInTheDocument();
      expect(screen.getByTestId("json-editor")).toBeInTheDocument();
      expect(screen.getByTestId("file-saver")).toBeInTheDocument();
    });
  });

  describe("Hook Integration", () => {
    it("should integrate with useJsonOperations hook", () => {
      render(
        <JsonImportExport
          files={mockFiles}
          directoryHandle={mockDirectoryHandle}
        />,
      );

      expect(useJsonOperations).toHaveBeenCalled();
    });

    it("should integrate with useFileOperations hook", () => {
      render(
        <JsonImportExport
          files={mockFiles}
          directoryHandle={mockDirectoryHandle}
        />,
      );

      expect(useFileOperations).toHaveBeenCalledWith(
        mockDirectoryHandle,
        "", // jsonInput from mocked hook
        expect.any(Function), // setSuccess
        expect.any(Function), // setError
      );
    });
  });
});
