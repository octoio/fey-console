import { describe, it, expect, vi, beforeEach } from "vitest";
import { FileSelector } from "@components/json-import-export/file-selector";
import { render, screen, fireEvent } from "@testing-library/react";
import { FileInfo } from "@utils/entity-scanner";

// Mock Ant Design components
vi.mock("antd", () => {
  const MockOption = ({
    children,
    value,
  }: {
    children: any;
    value: string;
  }) => <option value={value}>{children}</option>;

  const MockSelect = ({
    children,
    onChange,
    placeholder,
    disabled,
    ...props
  }: any) => (
    <div data-testid="file-selector" data-disabled={disabled}>
      <select
        onChange={(e: any) => onChange && onChange(e.target.value)}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {children}
      </select>
    </div>
  );

  (MockSelect as any).Option = MockOption;

  return { Select: MockSelect };
});

// Mock styled-components
vi.mock("@emotion/styled", () => ({
  __esModule: true,
  default: vi.fn((Component) => {
    const styledWrapper = () => {
      const StyledComponent = (props: any) => Component(props);
      StyledComponent.displayName = `Styled(${Component.displayName || Component.name || "Component"})`;
      return StyledComponent;
    };
    return styledWrapper;
  }),
}));

describe("FileSelector", () => {
  const mockOnFileSelect = vi.fn();

  const mockFiles: FileInfo[] = [
    {
      name: "test1.skill.json",
      path: "/path/to/test1.skill.json",
      isEntity: true,
      entityType: "skill",
    },
    {
      name: "test2.skill.json",
      path: "/path/to/test2.skill.json",
      isEntity: true,
      entityType: "skill",
    },
  ];

  const defaultProps = {
    files: mockFiles,
    onFileSelect: mockOnFileSelect,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders file selector with placeholder", () => {
    render(<FileSelector {...defaultProps} />);

    const selector = screen.getByTestId("file-selector");
    expect(selector).toBeInTheDocument();

    const placeholder = screen.getByText("Load from scanned file");
    expect(placeholder).toBeInTheDocument();
  });

  it("renders with empty files array", () => {
    render(<FileSelector files={[]} onFileSelect={mockOnFileSelect} />);

    const selector = screen.getByTestId("file-selector");
    expect(selector).toBeInTheDocument();
  });

  it("calls onFileSelect when option is selected", () => {
    render(<FileSelector {...defaultProps} />);

    const selector = screen.getByTestId("file-selector");
    const selectElement = selector.querySelector("select");

    if (selectElement) {
      fireEvent.change(selectElement, {
        target: { value: "/path/to/test1.skill.json" },
      });
      expect(mockOnFileSelect).toHaveBeenCalledWith(
        "/path/to/test1.skill.json",
      );
    }
  });

  it("handles file selection gracefully", () => {
    render(<FileSelector {...defaultProps} />);

    const selector = screen.getByTestId("file-selector");
    expect(selector).toBeInTheDocument();

    // Should not throw errors when rendering
    expect(mockOnFileSelect).not.toHaveBeenCalled();
  });

  it("renders with non-entity files", () => {
    const nonEntityFiles: FileInfo[] = [
      { name: "config.json", path: "/path/to/config.json", isEntity: false },
    ];

    render(
      <FileSelector files={nonEntityFiles} onFileSelect={mockOnFileSelect} />,
    );

    const selector = screen.getByTestId("file-selector");
    expect(selector).toBeInTheDocument();
  });
});
