import { describe, it, expect, vi, beforeEach } from "vitest";
import { BaseNode, NODE_COLORS } from "@components/node-common/base-node";
import { render, screen } from "@testing-library/react";

// Mock the dependencies
vi.mock("@utils/node-operations", () => ({
  useNodeOperations: () => ({
    handleNameChange: vi.fn(),
    handleNodeDelete: vi.fn(),
  }),
}));

// Mock Ant Design components
vi.mock("antd", () => ({
  Input: ({ value, onChange, placeholder, size, ...props }: any) => (
    <input
      data-testid="node-name-input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      data-size={size}
      {...props}
    />
  ),
}));

// Mock node-common subcomponents
vi.mock("@components/node-common/node-card", () => ({
  NodeCard: ({ title, backgroundColor, borderColor, children }: any) => (
    <div
      data-testid="node-card"
      data-background-color={backgroundColor}
      data-border-color={borderColor}
      role="region"
      aria-label="Node container"
    >
      <div data-testid="node-card-title">{title}</div>
      <div data-testid="node-card-content">{children}</div>
    </div>
  ),
}));

vi.mock("@components/node-common/node-field", () => ({
  NodeField: ({ label, children }: any) => (
    <div data-testid="node-field" data-label={label}>
      <label>{label}</label>
      {children}
    </div>
  ),
}));

vi.mock("@components/node-common/node-header", () => ({
  NodeHeader: ({ title, onDelete, addMenuItems }: any) => (
    <div data-testid="node-header">
      <span data-testid="node-header-title">{title}</span>
      <button
        data-testid="node-delete-button"
        onClick={onDelete}
        aria-label="Delete node"
      >
        Delete
      </button>
      {addMenuItems && addMenuItems.length > 0 && (
        <div data-testid="node-menu-items">
          {addMenuItems.map((item: any) => (
            <button
              key={item.key}
              data-testid={`menu-item-${item.key}`}
              onClick={item.onClick}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  ),
}));

vi.mock("@components/node-common/node-interactive", () => ({
  NodeInteractive: ({ children }: any) => (
    <div data-testid="node-interactive">{children}</div>
  ),
}));

describe("BaseNode", () => {
  const defaultProps = {
    id: "test-node-1",
    data: { name: "Test Node" },
    title: "Test Node Title",
    backgroundColor: "#f0f0f0",
    borderColor: "#d0d0d0",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render with required props", () => {
      render(<BaseNode {...defaultProps} />);

      expect(screen.getByTestId("node-card")).toBeInTheDocument();
      expect(screen.getByTestId("node-header")).toBeInTheDocument();
      expect(screen.getByTestId("node-field")).toBeInTheDocument();
      expect(screen.getByTestId("node-interactive")).toBeInTheDocument();
      expect(screen.getByTestId("node-name-input")).toBeInTheDocument();
    });

    it("should display correct title in header", () => {
      render(<BaseNode {...defaultProps} />);

      const headerTitle = screen.getByTestId("node-header-title");
      expect(headerTitle).toHaveTextContent("Test Node Title");
    });

    it("should apply correct background and border colors", () => {
      render(<BaseNode {...defaultProps} />);

      const nodeCard = screen.getByTestId("node-card");
      expect(nodeCard).toHaveAttribute("data-background-color", "#f0f0f0");
      expect(nodeCard).toHaveAttribute("data-border-color", "#d0d0d0");
    });

    it("should render name input with correct value", () => {
      render(<BaseNode {...defaultProps} />);

      const nameInput = screen.getByTestId("node-name-input");
      expect(nameInput).toHaveValue("Test Node");
      expect(nameInput).toHaveAttribute("placeholder", "Node name");
      expect(nameInput).toHaveAttribute("data-size", "small");
    });
  });

  describe("Children and Menu Items", () => {
    it("should render children when provided", () => {
      const customChildren = (
        <div data-testid="custom-children">Custom content</div>
      );

      render(<BaseNode {...defaultProps}>{customChildren}</BaseNode>);

      expect(screen.getByTestId("custom-children")).toBeInTheDocument();
      expect(screen.getByTestId("custom-children")).toHaveTextContent(
        "Custom content",
      );
    });

    it("should render menu items when provided", () => {
      const menuItems = [
        { key: "copy", label: "Copy", onClick: vi.fn() },
        { key: "paste", label: "Paste", onClick: vi.fn() },
      ];

      render(<BaseNode {...defaultProps} menuItems={menuItems} />);

      expect(screen.getByTestId("node-menu-items")).toBeInTheDocument();
      expect(screen.getByTestId("menu-item-copy")).toHaveTextContent("Copy");
      expect(screen.getByTestId("menu-item-paste")).toHaveTextContent("Paste");
    });

    it("should handle empty menu items array", () => {
      render(<BaseNode {...defaultProps} menuItems={[]} />);

      expect(screen.queryByTestId("node-menu-items")).not.toBeInTheDocument();
    });

    it("should not render menu items when none provided", () => {
      render(<BaseNode {...defaultProps} />);

      expect(screen.queryByTestId("node-menu-items")).not.toBeInTheDocument();
    });
  });

  describe("Props Validation", () => {
    it("should handle different node data structures", () => {
      const complexData = {
        name: "Complex Node",
        properties: { value: 42 },
        settings: { enabled: true },
      };

      const props = {
        ...defaultProps,
        data: complexData,
      };

      render(<BaseNode {...props} />);

      const nameInput = screen.getByTestId("node-name-input");
      expect(nameInput).toHaveValue("Complex Node");
    });

    it("should handle missing node name gracefully", () => {
      const propsWithoutName = {
        ...defaultProps,
        data: {},
      };

      render(<BaseNode {...propsWithoutName} />);

      const nameInput = screen.getByTestId("node-name-input");
      expect(nameInput).toHaveValue("");
    });

    it("should handle different background colors", () => {
      const colorProps = {
        ...defaultProps,
        backgroundColor: "#ff0000",
        borderColor: "#00ff00",
      };

      render(<BaseNode {...colorProps} />);

      const nodeCard = screen.getByTestId("node-card");
      expect(nodeCard).toHaveAttribute("data-background-color", "#ff0000");
      expect(nodeCard).toHaveAttribute("data-border-color", "#00ff00");
    });
  });

  describe("Integration with NODE_COLORS", () => {
    it("should use predefined border colors", () => {
      const props = {
        ...defaultProps,
        backgroundColor: NODE_COLORS.LIGHT_PURPLE_BG,
        borderColor: NODE_COLORS.PURPLE_BORDER,
      };

      render(<BaseNode {...props} />);

      const nodeCard = screen.getByTestId("node-card");
      expect(nodeCard).toHaveAttribute(
        "data-background-color",
        NODE_COLORS.LIGHT_PURPLE_BG,
      );
      expect(nodeCard).toHaveAttribute(
        "data-border-color",
        NODE_COLORS.PURPLE_BORDER,
      );
    });
  });
});
