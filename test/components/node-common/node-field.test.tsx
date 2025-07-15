import React from "react";
import { describe, it, expect, vi } from "vitest";
import { NodeField } from "@components/node-common/node-field";
import { render, screen } from "@testing-library/react";

// Mock Ant Design components
vi.mock("antd", () => ({
  Typography: {
    Text: ({ children }: { children: React.ReactNode }) => (
      <span data-testid="ant-text">{children}</span>
    ),
  },
}));

// Mock styled-components
vi.mock("@emotion/styled", () => {
  const MockStyledComponent = ({
    marginBottom,
    children,
    ...props
  }: {
    marginBottom?: number;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => {
    return (
      <div
        data-testid="field-container"
        data-margin-bottom={marginBottom}
        {...props}
      >
        {children}
      </div>
    );
  };
  MockStyledComponent.displayName = "MockStyledComponent";

  const mockStyled = {
    div: () => MockStyledComponent,
  };

  return {
    __esModule: true,
    default: mockStyled,
  };
});

describe("NodeField", () => {
  describe("Basic Rendering", () => {
    it("should render label and children correctly", () => {
      const testContent = <div data-testid="test-content">Test Content</div>;

      render(<NodeField label="Test Label">{testContent}</NodeField>);

      expect(screen.getByTestId("ant-text")).toHaveTextContent("Test Label");
      expect(screen.getByTestId("test-content")).toBeInTheDocument();
      expect(screen.getByTestId("test-content")).toHaveTextContent(
        "Test Content",
      );
    });

    it("should render with default margin bottom", () => {
      const testContent = <span>Content</span>;

      render(<NodeField label="Label">{testContent}</NodeField>);

      const container = screen.getByTestId("field-container");
      expect(container).toHaveAttribute("data-margin-bottom", "12");
    });

    it("should render with custom margin bottom", () => {
      const testContent = <span>Content</span>;

      render(
        <NodeField label="Label" marginBottom={24}>
          {testContent}
        </NodeField>,
      );

      const container = screen.getByTestId("field-container");
      expect(container).toHaveAttribute("data-margin-bottom", "24");
    });

    it("should render with zero margin bottom", () => {
      const testContent = <span>Content</span>;

      render(
        <NodeField label="Label" marginBottom={0}>
          {testContent}
        </NodeField>,
      );

      const container = screen.getByTestId("field-container");
      expect(container).toHaveAttribute("data-margin-bottom", "0");
    });
  });

  describe("Label Handling", () => {
    it("should render simple text label", () => {
      render(
        <NodeField label="Simple Label">
          <div>Content</div>
        </NodeField>,
      );

      expect(screen.getByTestId("ant-text")).toHaveTextContent("Simple Label");
    });

    it("should render empty label", () => {
      render(
        <NodeField label="">
          <div>Content</div>
        </NodeField>,
      );

      const textElement = screen.getByTestId("ant-text");
      expect(textElement).toBeInTheDocument();
      expect(textElement).toHaveTextContent("");
    });

    it("should render label with special characters", () => {
      const specialLabel = "Label with: special-chars_123!@#";

      render(
        <NodeField label={specialLabel}>
          <div>Content</div>
        </NodeField>,
      );

      expect(screen.getByTestId("ant-text")).toHaveTextContent(specialLabel);
    });

    it("should render long label text", () => {
      const longLabel =
        "This is a very long label that might wrap to multiple lines in the UI";

      render(
        <NodeField label={longLabel}>
          <div>Content</div>
        </NodeField>,
      );

      expect(screen.getByTestId("ant-text")).toHaveTextContent(longLabel);
    });
  });

  describe("Children Handling", () => {
    it("should render single child element", () => {
      const singleChild = <input data-testid="single-input" type="text" />;

      render(<NodeField label="Label">{singleChild}</NodeField>);

      expect(screen.getByTestId("single-input")).toBeInTheDocument();
    });

    it("should render multiple children", () => {
      const multipleChildren = (
        <>
          <input data-testid="child-input" type="text" />
          <button data-testid="child-button">Click</button>
          <span data-testid="child-span">Text</span>
        </>
      );

      render(<NodeField label="Label">{multipleChildren}</NodeField>);

      expect(screen.getByTestId("child-input")).toBeInTheDocument();
      expect(screen.getByTestId("child-button")).toBeInTheDocument();
      expect(screen.getByTestId("child-span")).toBeInTheDocument();
    });

    it("should render text content as children", () => {
      render(<NodeField label="Label">Plain text content</NodeField>);

      expect(screen.getByText("Plain text content")).toBeInTheDocument();
    });

    it("should render complex nested children", () => {
      const complexChildren = (
        <div data-testid="complex-wrapper">
          <div className="nested-level-1">
            <span data-testid="deeply-nested">Nested content</span>
            <div className="nested-level-2">
              <button data-testid="nested-button">Nested Button</button>
            </div>
          </div>
        </div>
      );

      render(<NodeField label="Complex Label">{complexChildren}</NodeField>);

      expect(screen.getByTestId("complex-wrapper")).toBeInTheDocument();
      expect(screen.getByTestId("deeply-nested")).toBeInTheDocument();
      expect(screen.getByTestId("nested-button")).toBeInTheDocument();
    });

    it("should handle null children gracefully", () => {
      expect(() => {
        render(<NodeField label="Label">{null}</NodeField>);
      }).not.toThrow();
    });

    it("should handle undefined children gracefully", () => {
      expect(() => {
        render(<NodeField label="Label">{undefined}</NodeField>);
      }).not.toThrow();
    });

    it("should handle React fragments", () => {
      const fragmentChildren = (
        <React.Fragment>
          <div data-testid="fragment-1">Fragment 1</div>
          <div data-testid="fragment-2">Fragment 2</div>
        </React.Fragment>
      );

      render(<NodeField label="Fragment Label">{fragmentChildren}</NodeField>);

      expect(screen.getByTestId("fragment-1")).toBeInTheDocument();
      expect(screen.getByTestId("fragment-2")).toBeInTheDocument();
    });
  });

  describe("Layout and Structure", () => {
    it("should have proper DOM structure", () => {
      render(
        <NodeField label="Structure Test">
          <div data-testid="content">Content</div>
        </NodeField>,
      );

      const container = screen.getByTestId("field-container");
      const label = screen.getByTestId("ant-text");
      const content = screen.getByTestId("content");

      expect(container).toBeInTheDocument();
      expect(container).toContainElement(label);
      expect(container).toContainElement(content);
    });

    it("should render children in a div with margin-top style", () => {
      render(
        <NodeField label="Margin Test">
          <div data-testid="styled-content">Content</div>
        </NodeField>,
      );

      const content = screen.getByTestId("styled-content");
      const contentWrapper = content.parentElement;

      // The component applies style={{ marginTop: 4 }} to the wrapper div
      expect(contentWrapper).toHaveAttribute("style", "margin-top: 4px;");
    });
  });

  describe("Props Validation", () => {
    it("should accept all required props", () => {
      const props = {
        label: "Required Label",
        children: <div>Required Children</div>,
      };

      expect(() => {
        render(<NodeField {...props} />);
      }).not.toThrow();
    });

    it("should accept all optional props", () => {
      const props = {
        label: "Full Props",
        children: <div>Children</div>,
        marginBottom: 16,
      };

      expect(() => {
        render(<NodeField {...props} />);
      }).not.toThrow();
    });

    it("should handle large margin values", () => {
      render(
        <NodeField label="Large Margin" marginBottom={100}>
          <div>Content</div>
        </NodeField>,
      );

      const container = screen.getByTestId("field-container");
      expect(container).toHaveAttribute("data-margin-bottom", "100");
    });

    it("should handle negative margin values", () => {
      render(
        <NodeField label="Negative Margin" marginBottom={-10}>
          <div>Content</div>
        </NodeField>,
      );

      const container = screen.getByTestId("field-container");
      expect(container).toHaveAttribute("data-margin-bottom", "-10");
    });
  });

  describe("Component Integration", () => {
    it("should work with form elements", () => {
      render(
        <NodeField label="Form Field">
          <input
            data-testid="form-input"
            type="text"
            placeholder="Enter value"
            defaultValue="test value"
          />
        </NodeField>,
      );

      const input = screen.getByTestId("form-input");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("placeholder", "Enter value");
      expect(input).toHaveValue("test value");
    });

    it("should work with select elements", () => {
      render(
        <NodeField label="Select Field">
          <select data-testid="form-select" defaultValue="option2">
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </select>
        </NodeField>,
      );

      const select = screen.getByTestId("form-select");
      expect(select).toBeInTheDocument();
      expect(select).toHaveValue("option2");
    });

    it("should work with button elements", () => {
      render(
        <NodeField label="Button Field">
          <button data-testid="form-button" type="button" disabled>
            Action Button
          </button>
        </NodeField>,
      );

      const button = screen.getByTestId("form-button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Action Button");
      expect(button).toBeDisabled();
    });
  });
});
