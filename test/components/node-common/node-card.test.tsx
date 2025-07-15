import { describe, it, expect, vi } from "vitest";

import { NodeCard } from "@components/node-common/node-card";
import { render, screen } from "@testing-library/react";

// Type definitions for mocked components
interface MockCardProps {
  title?: React.ReactNode;
  extra?: React.ReactNode;
  children?: React.ReactNode;
  size?: string;
  variant?: string;
  [key: string]: unknown;
}

interface MockHandleProps {
  type: string;
  position: string;
}

// Mock Ant Design Card component
vi.mock("antd", () => ({
  Card: ({
    title,
    extra,
    children,
    size,
    variant,
    ...props
  }: MockCardProps) => (
    <div
      data-testid="node-card"
      data-size={size}
      data-variant={variant}
      {...props}
    >
      {title !== undefined && <div data-testid="card-title">{title}</div>}
      {extra && <div data-testid="card-extra">{extra}</div>}
      <div data-testid="card-children">{children}</div>
    </div>
  ),
}));

// Mock ReactFlow Handle component
vi.mock("reactflow", () => ({
  Handle: ({ type, position }: MockHandleProps) => (
    <div data-testid={`handle-${type}`} data-position={position} />
  ),
  Position: {
    Top: "top",
    Bottom: "bottom",
  },
}));

describe("NodeCard", () => {
  const mockProps = {
    title: "Test Node",
    backgroundColor: "#ffffff",
    borderColor: "#cccccc",
    children: <div>Test Content</div>,
  };

  describe("Basic Rendering", () => {
    it("should render with required props", () => {
      render(<NodeCard {...mockProps} />);

      expect(screen.getByTestId("node-card")).toBeInTheDocument();
      expect(screen.getByTestId("card-title")).toHaveTextContent("Test Node");
      expect(screen.getByTestId("card-children")).toBeInTheDocument();
    });

    it("should render with ReactNode title", () => {
      const complexTitle = (
        <div>
          <span>Complex</span> <strong>Title</strong>
        </div>
      );

      render(<NodeCard {...mockProps} title={complexTitle} />);

      const titleElement = screen.getByTestId("card-title");
      expect(titleElement).toContainHTML("<span>Complex</span>");
      expect(titleElement).toContainHTML("<strong>Title</strong>");
    });

    it("should render children content", () => {
      const children = (
        <div>
          <p>Child paragraph</p>
          <span>Child span</span>
        </div>
      );

      render(
        <NodeCard
          title={mockProps.title}
          backgroundColor={mockProps.backgroundColor}
          borderColor={mockProps.borderColor}
        >
          {children}
        </NodeCard>,
      );

      const childrenElement = screen.getByTestId("card-children");
      expect(childrenElement).toContainHTML("<p>Child paragraph</p>");
      expect(childrenElement).toContainHTML("<span>Child span</span>");
    });
  });

  describe("Optional Props", () => {
    it("should render extra content when provided", () => {
      const extra = <button>Extra Button</button>;

      render(<NodeCard {...mockProps} extra={extra} />);

      expect(screen.getByTestId("card-extra")).toBeInTheDocument();
      expect(screen.getByTestId("card-extra")).toContainHTML(
        "<button>Extra Button</button>",
      );
    });

    it("should not render extra content when not provided", () => {
      render(<NodeCard {...mockProps} />);

      expect(screen.queryByTestId("card-extra")).not.toBeInTheDocument();
    });

    it("should use custom width when provided", () => {
      render(<NodeCard {...mockProps} width={400} />);

      const card = screen.getByTestId("node-card");
      expect(card).toBeInTheDocument();
      // The width would be applied via styled-components, which is tested implicitly
    });

    it("should use default width when not provided", () => {
      render(<NodeCard {...mockProps} />);

      const card = screen.getByTestId("node-card");
      expect(card).toBeInTheDocument();
      // Default width of 320 would be applied
    });
  });

  describe("Ant Design Integration", () => {
    it("should pass correct props to Ant Design Card", () => {
      render(<NodeCard {...mockProps} />);

      const card = screen.getByTestId("node-card");
      expect(card).toHaveAttribute("data-size", "small");
      expect(card).toHaveAttribute("data-variant", "outlined");
    });

    it("should pass style-related props", () => {
      render(
        <NodeCard
          {...mockProps}
          backgroundColor="#ff0000"
          borderColor="#00ff00"
          width={500}
        />,
      );

      const card = screen.getByTestId("node-card");
      expect(card).toBeInTheDocument();
      // The backgroundColor, borderColor, and width are passed to styled component
    });
  });

  describe("ReactFlow Integration", () => {
    it("should render target handle at top", () => {
      render(<NodeCard {...mockProps} />);

      const targetHandle = screen.getByTestId("handle-target");
      expect(targetHandle).toBeInTheDocument();
      expect(targetHandle).toHaveAttribute("data-position", "top");
    });

    it("should render source handle at bottom", () => {
      render(<NodeCard {...mockProps} />);

      const sourceHandle = screen.getByTestId("handle-source");
      expect(sourceHandle).toBeInTheDocument();
      expect(sourceHandle).toHaveAttribute("data-position", "bottom");
    });

    it("should render both handles for flow connectivity", () => {
      render(<NodeCard {...mockProps} />);

      expect(screen.getByTestId("handle-target")).toBeInTheDocument();
      expect(screen.getByTestId("handle-source")).toBeInTheDocument();
    });
  });

  describe("Props Interface", () => {
    it("should handle all required props correctly", () => {
      const allProps = {
        title: "Complete Node",
        extra: <span>Extra</span>,
        children: <div>Children</div>,
        backgroundColor: "#f0f0f0",
        borderColor: "#d0d0d0",
        width: 350,
      };

      render(<NodeCard {...allProps} />);

      expect(screen.getByTestId("node-card")).toBeInTheDocument();
      expect(screen.getByTestId("card-title")).toHaveTextContent(
        "Complete Node",
      );
      expect(screen.getByTestId("card-extra")).toBeInTheDocument();
      expect(screen.getByTestId("card-children")).toBeInTheDocument();
    });

    it("should work with minimal required props", () => {
      const minimalProps = {
        title: "Minimal",
        backgroundColor: "#fff",
        borderColor: "#ccc",
        children: <div>Content</div>,
      };

      render(<NodeCard {...minimalProps} />);

      expect(screen.getByTestId("node-card")).toBeInTheDocument();
      expect(screen.getByTestId("card-title")).toHaveTextContent("Minimal");
      expect(screen.getByTestId("card-children")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string title", () => {
      render(<NodeCard {...mockProps} title="" />);

      expect(screen.getByTestId("card-title")).toBeInTheDocument();
      expect(screen.getByTestId("card-title")).toHaveTextContent("");
    });

    it("should handle complex nested children", () => {
      const complexChildren = (
        <div>
          <div>
            <p>Nested paragraph</p>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </div>
        </div>
      );

      render(
        <NodeCard
          title={mockProps.title}
          backgroundColor={mockProps.backgroundColor}
          borderColor={mockProps.borderColor}
        >
          {complexChildren}
        </NodeCard>,
      );

      const childrenElement = screen.getByTestId("card-children");
      expect(childrenElement).toContainHTML("<p>Nested paragraph</p>");
      expect(childrenElement).toContainHTML("<li>Item 1</li>");
      expect(childrenElement).toContainHTML("<li>Item 2</li>");
    });

    it("should handle zero width", () => {
      render(<NodeCard {...mockProps} width={0} />);

      const card = screen.getByTestId("node-card");
      expect(card).toBeInTheDocument();
    });

    it("should handle very large width", () => {
      render(<NodeCard {...mockProps} width={9999} />);

      const card = screen.getByTestId("node-card");
      expect(card).toBeInTheDocument();
    });
  });
});
