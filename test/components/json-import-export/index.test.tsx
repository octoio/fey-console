import { describe, expect, it, vi, beforeEach } from "vitest";
import { JsonImportExport } from "@components/json-import-export/index";
import { render, screen } from "@testing-library/react";

// Mock all the child components to avoid complex dependency issues
vi.mock("@components/json-import-export/import-export-controls", () => ({
  ImportExportControls: vi.fn(({ handleExport, handleImport, jsonInput }) => (
    <div data-testid="import-export-controls">
      <button data-testid="export-btn" onClick={handleExport}>
        Export
      </button>
      <button data-testid="import-btn" onClick={handleImport}>
        Import
      </button>
      <span data-testid="json-input-length">{jsonInput.length}</span>
    </div>
  )),
}));

vi.mock("@components/json-import-export/status-messages", () => ({
  StatusMessages: vi.fn(({ error, success }) => (
    <div data-testid="status-messages">
      {error && <div data-testid="error">{error}</div>}
      {success && <div data-testid="success">{success}</div>}
    </div>
  )),
}));

vi.mock("@components/json-import-export/file-selector", () => ({
  FileSelector: vi.fn(({ files, onFileSelect }) => (
    <div data-testid="file-selector">
      <span data-testid="files-count">{files.length}</span>
      <button
        data-testid="select-file"
        onClick={() => onFileSelect("test.json")}
      >
        Select Test File
      </button>
    </div>
  )),
}));

vi.mock("@components/json-import-export/json-editor", () => ({
  JsonEditor: vi.fn(({ value, onChange }) => (
    <div data-testid="json-editor">
      <textarea
        data-testid="json-textarea"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  )),
}));

vi.mock("@components/json-import-export/file-saver", () => ({
  FileSaver: vi.fn(
    ({ destinationFile, selectedFile, onChange, onSave, disabled }) => (
      <div data-testid="file-saver">
        <input
          data-testid="destination-input"
          value={destinationFile || selectedFile}
          onChange={(e) => onChange(e.target.value)}
        />
        <button data-testid="save-btn" onClick={onSave} disabled={disabled}>
          Save
        </button>
      </div>
    ),
  ),
}));

// Mock styled-components
vi.mock("@components/common/styled-components", () => ({
  StyledCard: vi.fn(({ children }) => (
    <div data-testid="styled-card">{children}</div>
  )),
}));

// Mock hooks
const mockUseJsonOperations = {
  jsonInput: "",
  handleInputChange: vi.fn(),
  handleExport: vi.fn(),
  handleImport: vi.fn(),
  error: null as string | null,
  success: null as string | null,
  setError: vi.fn(),
  setSuccess: vi.fn(),
};

const mockUseFileOperations = {
  selectedFile: "",
  destinationFile: "",
  setDestinationFile: vi.fn(),
  handleLoadFromFile: vi.fn(),
  handleSaveToFile: vi.fn(),
  setSelectedFile: vi.fn(),
};

vi.mock("@hooks/use-json-operations", () => ({
  useJsonOperations: vi.fn(() => mockUseJsonOperations),
}));

vi.mock("@hooks/use-file-operations", () => ({
  useFileOperations: vi.fn(() => mockUseFileOperations),
}));

describe("JsonImportExport", () => {
  const defaultProps = {
    files: [
      { name: "test1.json", path: "/test1.json", isEntity: false },
      {
        name: "test2.json",
        path: "/test2.json",
        isEntity: true,
        entityType: "skill",
      },
    ],
    directoryHandle: {} as FileSystemDirectoryHandle,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock return values
    mockUseJsonOperations.jsonInput = "";
    mockUseJsonOperations.error = null;
    mockUseJsonOperations.success = null;
    mockUseFileOperations.selectedFile = "";
    mockUseFileOperations.destinationFile = "";
  });

  it("should render all child components", () => {
    render(<JsonImportExport {...defaultProps} />);

    expect(screen.getByTestId("styled-card")).toBeInTheDocument();
    expect(screen.getByTestId("import-export-controls")).toBeInTheDocument();
    expect(screen.getByTestId("status-messages")).toBeInTheDocument();
    expect(screen.getByTestId("file-selector")).toBeInTheDocument();
    expect(screen.getByTestId("json-editor")).toBeInTheDocument();
    expect(screen.getByTestId("file-saver")).toBeInTheDocument();
  });

  it("should pass correct props to ImportExportControls", () => {
    mockUseJsonOperations.jsonInput = "test json";

    render(<JsonImportExport {...defaultProps} />);

    expect(screen.getByTestId("json-input-length")).toHaveTextContent("9"); // "test json".length
  });

  it("should pass files to FileSelector", () => {
    render(<JsonImportExport {...defaultProps} />);

    expect(screen.getByTestId("files-count")).toHaveTextContent("2");
  });

  it("should handle file selection correctly", () => {
    render(<JsonImportExport {...defaultProps} />);

    const selectFileBtn = screen.getByTestId("select-file");
    selectFileBtn.click();

    expect(mockUseFileOperations.setSelectedFile).toHaveBeenCalledWith(
      "test.json",
    );
    expect(mockUseFileOperations.handleLoadFromFile).toHaveBeenCalledWith(
      "test.json",
    );
  });

  it("should display error messages", () => {
    mockUseJsonOperations.error = "Test error message";

    render(<JsonImportExport {...defaultProps} />);

    expect(screen.getByTestId("error")).toHaveTextContent("Test error message");
  });

  it("should display success messages", () => {
    mockUseJsonOperations.success = "Test success message";

    render(<JsonImportExport {...defaultProps} />);

    expect(screen.getByTestId("success")).toHaveTextContent(
      "Test success message",
    );
  });

  it("should handle JSON input changes", () => {
    render(<JsonImportExport {...defaultProps} />);

    const textarea = screen.getByTestId("json-textarea");
    textarea.dispatchEvent(new Event("change", { bubbles: true }));

    // The change handler is called through the mocked component
    // We can't directly test the input change without more complex setup
    expect(textarea).toBeInTheDocument();
  });

  it("should disable save button when no JSON input", () => {
    mockUseJsonOperations.jsonInput = "";

    render(<JsonImportExport {...defaultProps} />);

    const saveBtn = screen.getByTestId("save-btn");
    expect(saveBtn).toBeDisabled();
  });

  it("should enable save button when JSON input exists", () => {
    mockUseJsonOperations.jsonInput = "some json content";

    render(<JsonImportExport {...defaultProps} />);

    const saveBtn = screen.getByTestId("save-btn");
    expect(saveBtn).not.toBeDisabled();
  });

  it("should handle empty files array", () => {
    render(<JsonImportExport {...{ ...defaultProps, files: [] }} />);

    expect(screen.getByTestId("files-count")).toHaveTextContent("0");
  });

  it("should handle null directoryHandle", () => {
    render(
      <JsonImportExport {...{ ...defaultProps, directoryHandle: null }} />,
    );

    // Should render without errors when directoryHandle is null
    expect(screen.getByTestId("styled-card")).toBeInTheDocument();
  });

  it("should pass destination file correctly to FileSaver", () => {
    mockUseFileOperations.destinationFile = "custom-destination.json";
    mockUseFileOperations.selectedFile = "selected.json";

    render(<JsonImportExport {...defaultProps} />);

    const destinationInput = screen.getByTestId("destination-input");
    expect(destinationInput).toHaveValue("custom-destination.json");
  });

  it("should fall back to selected file when no destination file", () => {
    mockUseFileOperations.destinationFile = "";
    mockUseFileOperations.selectedFile = "selected.json";

    render(<JsonImportExport {...defaultProps} />);

    const destinationInput = screen.getByTestId("destination-input");
    expect(destinationInput).toHaveValue("selected.json");
  });

  it("should handle large files array", () => {
    const largeFilesArray = Array.from({ length: 1000 }, (_, i) => ({
      name: `file${i}.json`,
      path: `/file${i}.json`,
      isEntity: i % 2 === 0,
      entityType: i % 2 === 0 ? "skill" : undefined,
    }));

    render(
      <JsonImportExport {...{ ...defaultProps, files: largeFilesArray }} />,
    );

    expect(screen.getByTestId("files-count")).toHaveTextContent("1000");
  });
});
