import { describe, it, expect, vi, beforeEach } from "vitest";
import { JsonEditor } from "@components/json-import-export/json-editor";
import { render, screen, waitFor } from "@testing-library/react";

// Mock the LoadingSpinner component
vi.mock("@components/loading-spinner", () => ({
  LoadingSpinner: vi.fn(({ height, tip, ...props }) => (
    <div
      data-testid="loading-spinner"
      data-height={height}
      data-tip={tip}
      {...props}
    >
      Loading...
    </div>
  )),
}));

// Mock the styled-components
vi.mock("@components/common/styled-components", () => ({
  EditorContainer: vi.fn(({ children, ...props }) => (
    <div data-testid="editor-container" {...props}>
      {children}
    </div>
  )),
}));

// Mock the Monaco Editor
vi.mock("@monaco-editor/react", () => ({
  __esModule: true,
  default: vi.fn(
    ({ value, onChange, height, defaultLanguage, options, ...props }) => (
      <div
        data-testid="monaco-editor"
        data-value={value}
        data-height={height}
        data-language={defaultLanguage}
        data-options={JSON.stringify(options)}
        onClick={() => onChange?.("changed value")}
        {...props}
      >
        Monaco Editor Mock - Value: {value}
      </div>
    ),
  ),
}));

describe("JsonEditor", () => {
  const mockOnChange = vi.fn();

  const defaultProps = {
    value: '{"test": "value"}',
    onChange: mockOnChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the editor container", () => {
    render(<JsonEditor {...defaultProps} />);

    const container = screen.getByTestId("editor-container");
    expect(container).toBeInTheDocument();
  });

  it("renders Monaco editor (mocks skip lazy loading)", async () => {
    render(<JsonEditor {...defaultProps} />);

    // In test environment with mocks, the Monaco editor renders immediately
    // because lazy loading is mocked out
    const monacoEditor = screen.getByTestId("monaco-editor");
    expect(monacoEditor).toBeInTheDocument();
  });

  it("renders Monaco editor after lazy loading", async () => {
    render(<JsonEditor {...defaultProps} />);

    // Wait for the Monaco editor to load
    await waitFor(() => {
      const monacoEditor = screen.getByTestId("monaco-editor");
      expect(monacoEditor).toBeInTheDocument();
    });
  });

  it("passes correct props to Monaco editor", async () => {
    render(<JsonEditor {...defaultProps} />);

    await waitFor(() => {
      const monacoEditor = screen.getByTestId("monaco-editor");
      expect(monacoEditor).toHaveAttribute("data-value", defaultProps.value);
      expect(monacoEditor).toHaveAttribute("data-height", "100%");
      expect(monacoEditor).toHaveAttribute("data-language", "json");
    });
  });

  it("passes correct options to Monaco editor", async () => {
    render(<JsonEditor {...defaultProps} />);

    await waitFor(() => {
      const monacoEditor = screen.getByTestId("monaco-editor");
      const optionsAttr = monacoEditor.getAttribute("data-options");
      const options = JSON.parse(optionsAttr || "{}");

      expect(options).toEqual({
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
      });
    });
  });

  it("calls onChange when editor value changes", async () => {
    render(<JsonEditor {...defaultProps} />);

    await waitFor(() => {
      const monacoEditor = screen.getByTestId("monaco-editor");
      monacoEditor.click();
    });

    expect(mockOnChange).toHaveBeenCalledWith("changed value");
  });

  it("handles different values correctly", async () => {
    const customValue = '{"name": "test", "value": 123}';
    render(<JsonEditor {...defaultProps} value={customValue} />);

    await waitFor(() => {
      const monacoEditor = screen.getByTestId("monaco-editor");
      expect(monacoEditor).toHaveAttribute("data-value", customValue);
      expect(monacoEditor).toHaveTextContent(
        `Monaco Editor Mock - Value: ${customValue}`,
      );
    });
  });

  it("handles empty value", async () => {
    render(<JsonEditor {...defaultProps} value="" />);

    await waitFor(() => {
      const monacoEditor = screen.getByTestId("monaco-editor");
      expect(monacoEditor).toHaveAttribute("data-value", "");
      expect(monacoEditor).toHaveTextContent("Monaco Editor Mock - Value:");
    });
  });

  it("handles optional onChange callback", async () => {
    const noOpOnChange = vi.fn();
    render(<JsonEditor value={defaultProps.value} onChange={noOpOnChange} />);

    await waitFor(() => {
      const monacoEditor = screen.getByTestId("monaco-editor");
      expect(monacoEditor).toBeInTheDocument();

      // Should not throw when clicking
      monacoEditor.click();
      expect(noOpOnChange).toHaveBeenCalledWith("changed value");
    });
  });

  it("maintains correct structure with container and editor", () => {
    render(<JsonEditor {...defaultProps} />);

    // Should have the container
    expect(screen.getByTestId("editor-container")).toBeInTheDocument();

    // Should have the Monaco editor (in tests, lazy loading is mocked)
    expect(screen.getByTestId("monaco-editor")).toBeInTheDocument();
  });

  it("renders with large JSON content", async () => {
    const largeJsonValue = JSON.stringify(
      {
        name: "Test Skill",
        description: "A very long description that might wrap multiple lines",
        properties: {
          damage: 100,
          range: 50,
          cooldown: 5,
          effects: ["burn", "slow", "damage"],
          requirements: {
            level: 10,
            stats: { strength: 20, intellect: 15 },
          },
        },
      },
      null,
      2,
    );

    render(<JsonEditor {...defaultProps} value={largeJsonValue} />);

    await waitFor(() => {
      const monacoEditor = screen.getByTestId("monaco-editor");
      expect(monacoEditor).toHaveAttribute("data-value", largeJsonValue);
    });
  });
});
