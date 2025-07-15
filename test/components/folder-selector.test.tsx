import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FolderSelector } from "@components/folder-selector";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock Ant Design components
vi.mock("antd", () => ({
  Button: vi.fn(({ children, icon, onClick, loading, type, disabled }) => (
    <button
      data-testid="ant-button"
      data-loading={loading}
      data-type={type}
      data-disabled={disabled}
      onClick={onClick}
    >
      {icon}
      {children}
    </button>
  )),
  Input: vi.fn(({ value, placeholder, readOnly, style }) => (
    <input
      data-testid="ant-input"
      value={value}
      placeholder={placeholder}
      readOnly={readOnly}
      style={style}
    />
  )),
  Space: vi.fn(({ children, style }) => (
    <div data-testid="ant-space" style={style}>
      {children}
    </div>
  )),
  Typography: {
    Text: vi.fn(({ children, strong, type, style }) => (
      <span
        data-testid="ant-typography-text"
        data-strong={strong}
        data-type={type}
        style={style}
      >
        {children}
      </span>
    )),
  },
  Alert: vi.fn(
    ({ message, description, type, showIcon, closable, onClose, style }) => (
      <div
        data-testid="ant-alert"
        data-type={type}
        data-show-icon={showIcon}
        data-closable={closable}
        style={style}
      >
        <div data-testid="alert-message">{message}</div>
        {description && (
          <div data-testid="alert-description">{description}</div>
        )}
        {closable && (
          <button data-testid="alert-close" onClick={onClose}>
            ×
          </button>
        )}
      </div>
    ),
  ),
}));

// Mock Ant Design icons
vi.mock("@ant-design/icons", () => ({
  FolderOpenOutlined: vi.fn(() => (
    <span data-testid="folder-open-icon">📁</span>
  )),
  ChromeOutlined: vi.fn(() => <span data-testid="chrome-icon">🌐</span>),
}));

describe("FolderSelector Component", () => {
  const mockOnFolderSelect = vi.fn();
  const defaultProps = {
    onFolderSelect: mockOnFolderSelect,
    selectedFolder: null,
    loading: false,
  };

  // Mock FileSystemDirectoryHandle
  const mockDirectoryHandle = {
    name: "test-folder",
    values: vi.fn(),
  };

  // Store original showDirectoryPicker
  const originalShowDirectoryPicker = (window as any).showDirectoryPicker;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.showDirectoryPicker
    (window as any).showDirectoryPicker = undefined;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Restore original value
    (window as any).showDirectoryPicker = originalShowDirectoryPicker;
  });

  describe("Component Rendering", () => {
    it("should render all basic elements", () => {
      render(<FolderSelector {...defaultProps} />);

      expect(screen.getByText("Entity References Folder")).toBeInTheDocument();
      expect(screen.getByTestId("ant-input")).toBeInTheDocument();
      expect(screen.getByTestId("ant-button")).toBeInTheDocument();
      expect(screen.getByText("Browse Folder")).toBeInTheDocument();
    });

    it("should render input with correct placeholder", () => {
      render(<FolderSelector {...defaultProps} />);

      const input = screen.getByTestId("ant-input");
      expect(input).toHaveAttribute(
        "placeholder",
        "Select a folder containing entity definitions",
      );
      expect(input).toHaveAttribute("readonly");
    });

    it("should render browse button with correct props", () => {
      render(<FolderSelector {...defaultProps} />);

      const button = screen.getByTestId("ant-button");
      expect(button).toHaveAttribute("data-type", "primary");
      expect(button).toHaveAttribute("data-loading", "false");
      expect(screen.getByTestId("folder-open-icon")).toBeInTheDocument();
    });
  });

  describe("Browser Compatibility Detection", () => {
    it("should detect when File System Access API is not supported", () => {
      // File System Access API not supported
      render(<FolderSelector {...defaultProps} />);

      expect(
        screen.getByText("Browser Compatibility Issue"),
      ).toBeInTheDocument();
      expect(screen.getAllByText(/This feature requires/)).toHaveLength(2); // Both warning and error
      expect(screen.getByTestId("chrome-icon")).toBeInTheDocument();

      const button = screen.getByTestId("ant-button");
      expect(button).toHaveAttribute("data-disabled", "true");
    });

    it("should detect when File System Access API is supported", () => {
      // Mock File System Access API support
      (window as any).showDirectoryPicker = vi.fn();

      render(<FolderSelector {...defaultProps} />);

      expect(
        screen.queryByText("Browser Compatibility Issue"),
      ).not.toBeInTheDocument();

      const button = screen.getByTestId("ant-button");
      expect(button).toHaveAttribute("data-disabled", "false");
    });
  });

  describe("Folder Selection", () => {
    beforeEach(() => {
      // Mock File System Access API support
      (window as any).showDirectoryPicker = vi.fn();
    });

    it("should call showDirectoryPicker when browse button is clicked", async () => {
      const mockShowDirectoryPicker = vi
        .fn()
        .mockResolvedValue(mockDirectoryHandle);
      (window as any).showDirectoryPicker = mockShowDirectoryPicker;

      // Mock directory iteration
      mockDirectoryHandle.values = vi.fn().mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          yield { name: "test-file" };
        },
      });

      render(<FolderSelector {...defaultProps} />);

      const button = screen.getByTestId("ant-button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockShowDirectoryPicker).toHaveBeenCalledWith({
          id: "entityReferences",
          mode: "read",
        });
      });
    });

    it("should call onFolderSelect with correct parameters on successful selection", async () => {
      const mockShowDirectoryPicker = vi
        .fn()
        .mockResolvedValue(mockDirectoryHandle);
      (window as any).showDirectoryPicker = mockShowDirectoryPicker;

      // Mock directory iteration
      mockDirectoryHandle.values = vi.fn().mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          yield { name: "test-file" };
        },
      });

      render(<FolderSelector {...defaultProps} />);

      const button = screen.getByTestId("ant-button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnFolderSelect).toHaveBeenCalledWith(
          "test-folder",
          mockDirectoryHandle,
        );
      });
    });

    it("should handle user cancelling folder selection", async () => {
      const abortError = new DOMException("User cancelled", "AbortError");
      const mockShowDirectoryPicker = vi.fn().mockRejectedValue(abortError);
      (window as any).showDirectoryPicker = mockShowDirectoryPicker;

      render(<FolderSelector {...defaultProps} />);

      const button = screen.getByTestId("ant-button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockShowDirectoryPicker).toHaveBeenCalled();
      });

      // Should not show error for cancelled operation
      expect(screen.queryByTestId("ant-alert")).not.toBeInTheDocument();
      expect(mockOnFolderSelect).not.toHaveBeenCalled();
    });

    it("should handle folder selection errors", async () => {
      const selectionError = new Error("Selection failed");
      const mockShowDirectoryPicker = vi.fn().mockRejectedValue(selectionError);
      (window as any).showDirectoryPicker = mockShowDirectoryPicker;

      render(<FolderSelector {...defaultProps} />);

      const button = screen.getByTestId("ant-button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId("ant-alert")).toBeInTheDocument();
        expect(
          screen.getByText(/Error selecting folder: Selection failed/),
        ).toBeInTheDocument();
      });
    });

    it("should handle permission/read errors after successful folder selection", async () => {
      const mockShowDirectoryPicker = vi
        .fn()
        .mockResolvedValue(mockDirectoryHandle);
      (window as any).showDirectoryPicker = mockShowDirectoryPicker;

      // Mock directory iteration that throws permission error
      mockDirectoryHandle.values = vi.fn().mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          throw new Error("Permission denied");
          // This yield is unreachable but satisfies TypeScript
          yield { name: "unreachable" };
        },
      });

      render(<FolderSelector {...defaultProps} />);

      const button = screen.getByTestId("ant-button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId("ant-alert")).toBeInTheDocument();
        expect(
          screen.getByText(/Permission issue: Permission denied/),
        ).toBeInTheDocument();
      });

      // onFolderSelect should still be called even with read permission issues
      expect(mockOnFolderSelect).toHaveBeenCalledWith(
        "test-folder",
        mockDirectoryHandle,
      );
    });
  });

  describe("Props Integration", () => {
    it("should display selected folder when provided", () => {
      render(
        <FolderSelector
          {...defaultProps}
          selectedFolder="my-selected-folder"
        />,
      );

      const input = screen.getByTestId("ant-input");
      expect(input).toHaveValue("my-selected-folder");

      expect(
        screen.getByText("Using entity references from: my-selected-folder"),
      ).toBeInTheDocument();
    });

    it("should show loading state on button", () => {
      render(<FolderSelector {...defaultProps} loading={true} />);

      const button = screen.getByTestId("ant-button");
      expect(button).toHaveAttribute("data-loading", "true");
    });

    it("should handle null selectedFolder", () => {
      render(<FolderSelector {...defaultProps} selectedFolder={null} />);

      const input = screen.getByTestId("ant-input");
      expect(input).toHaveValue("");

      expect(
        screen.queryByText(/Using entity references from:/),
      ).not.toBeInTheDocument();
    });

    it("should handle empty string selectedFolder", () => {
      render(<FolderSelector {...defaultProps} selectedFolder="" />);

      const input = screen.getByTestId("ant-input");
      expect(input).toHaveValue("");

      expect(
        screen.queryByText(/Using entity references from:/),
      ).not.toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should allow closing error alerts", async () => {
      const selectionError = new Error("Selection failed");
      const mockShowDirectoryPicker = vi.fn().mockRejectedValue(selectionError);
      (window as any).showDirectoryPicker = mockShowDirectoryPicker;

      render(<FolderSelector {...defaultProps} />);

      const button = screen.getByTestId("ant-button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId("ant-alert")).toBeInTheDocument();
      });

      const closeButton = screen.getByTestId("alert-close");
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId("ant-alert")).not.toBeInTheDocument();
      });
    });

    it("should handle non-Error objects in catch blocks", async () => {
      const mockShowDirectoryPicker = vi.fn().mockRejectedValue("String error");
      (window as any).showDirectoryPicker = mockShowDirectoryPicker;

      render(<FolderSelector {...defaultProps} />);

      const button = screen.getByTestId("ant-button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId("ant-alert")).toBeInTheDocument();
        expect(
          screen.getByText(/Error selecting folder: String error/),
        ).toBeInTheDocument();
      });
    });

    it("should handle non-Error objects in permission catch blocks", async () => {
      const mockShowDirectoryPicker = vi
        .fn()
        .mockResolvedValue(mockDirectoryHandle);
      (window as any).showDirectoryPicker = mockShowDirectoryPicker;

      mockDirectoryHandle.values = vi.fn().mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          throw "String permission error";
          // This yield is unreachable but satisfies TypeScript
          yield { name: "unreachable" };
        },
      });

      render(<FolderSelector {...defaultProps} />);

      const button = screen.getByTestId("ant-button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId("ant-alert")).toBeInTheDocument();
        expect(
          screen.getByText(/Permission issue: String permission error/),
        ).toBeInTheDocument();
      });
    });
  });

  describe("UI State Management", () => {
    beforeEach(() => {
      (window as any).showDirectoryPicker = vi.fn();
    });

    it("should clear error state when starting new folder selection", async () => {
      // First, cause an error
      const selectionError = new Error("First error");
      const mockShowDirectoryPicker = vi.fn().mockRejectedValue(selectionError);
      (window as any).showDirectoryPicker = mockShowDirectoryPicker;

      render(<FolderSelector {...defaultProps} />);

      const button = screen.getByTestId("ant-button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId("ant-alert")).toBeInTheDocument();
      });

      // Now, make a successful selection
      mockShowDirectoryPicker.mockResolvedValue(mockDirectoryHandle);
      mockDirectoryHandle.values = vi.fn().mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          yield { name: "test-file" };
        },
      });

      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnFolderSelect).toHaveBeenCalled();
      });

      // Error should be cleared
      expect(screen.queryByTestId("ant-alert")).not.toBeInTheDocument();
    });

    it("should handle component rerender with changing props", () => {
      const { rerender } = render(<FolderSelector {...defaultProps} />);

      expect(screen.getByTestId("ant-input")).toHaveValue("");
      expect(
        screen.queryByText(/Using entity references from:/),
      ).not.toBeInTheDocument();

      rerender(
        <FolderSelector
          {...defaultProps}
          selectedFolder="new-folder"
          loading={true}
        />,
      );

      expect(screen.getByTestId("ant-input")).toHaveValue("new-folder");
      expect(
        screen.getByText("Using entity references from: new-folder"),
      ).toBeInTheDocument();

      const button = screen.getByTestId("ant-button");
      expect(button).toHaveAttribute("data-loading", "true");
    });
  });

  describe("Accessibility and Semantic Structure", () => {
    it("should have proper semantic structure", () => {
      render(<FolderSelector {...defaultProps} />);

      expect(screen.getByText("Entity References Folder")).toBeInTheDocument();
      expect(screen.getByTestId("ant-space")).toBeInTheDocument();
    });

    it("should provide proper button labeling", () => {
      render(<FolderSelector {...defaultProps} />);

      expect(screen.getByText("Browse Folder")).toBeInTheDocument();
      expect(screen.getByTestId("folder-open-icon")).toBeInTheDocument();
    });

    it("should show appropriate visual feedback", () => {
      render(<FolderSelector {...defaultProps} selectedFolder="test-folder" />);

      expect(
        screen.getByText("Using entity references from: test-folder"),
      ).toBeInTheDocument();
    });
  });
});
