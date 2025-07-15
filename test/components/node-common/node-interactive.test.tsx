import React from "react";
import { describe, it, expect } from "vitest";
import { NodeInteractive } from "@components/node-common/node-interactive";
import { render, screen } from "@testing-library/react";

describe("NodeInteractive", () => {
  describe("Basic Rendering", () => {
    it("should render children correctly", () => {
      const testContent = <div data-testid="test-child">Test Content</div>;

      render(<NodeInteractive>{testContent}</NodeInteractive>);

      expect(screen.getByTestId("test-child")).toBeInTheDocument();
      expect(screen.getByTestId("test-child")).toHaveTextContent(
        "Test Content",
      );
    });

    it("should apply nodrag class by default", () => {
      const testContent = <div data-testid="test-child">Test Content</div>;

      render(<NodeInteractive>{testContent}</NodeInteractive>);

      const wrapper = screen.getByTestId("test-child").parentElement;
      expect(wrapper).toHaveClass("nodrag");
    });

    it("should accept additional className", () => {
      const testContent = <div data-testid="test-child">Test Content</div>;

      render(
        <NodeInteractive className="custom-class">
          {testContent}
        </NodeInteractive>,
      );

      const wrapper = screen.getByTestId("test-child").parentElement;
      expect(wrapper).toHaveClass("nodrag", "custom-class");
    });

    it("should handle empty className gracefully", () => {
      const testContent = <div data-testid="test-child">Test Content</div>;

      render(<NodeInteractive className="">{testContent}</NodeInteractive>);

      const wrapper = screen.getByTestId("test-child").parentElement;
      expect(wrapper).toHaveClass("nodrag");
      expect(wrapper?.className).toBe("nodrag");
    });

    it("should render multiple children", () => {
      const multipleChildren = (
        <>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <span data-testid="child-3">Child 3</span>
        </>
      );

      render(<NodeInteractive>{multipleChildren}</NodeInteractive>);

      expect(screen.getByTestId("child-1")).toBeInTheDocument();
      expect(screen.getByTestId("child-2")).toBeInTheDocument();
      expect(screen.getByTestId("child-3")).toBeInTheDocument();
    });

    it("should render string content", () => {
      render(<NodeInteractive>Simple text content</NodeInteractive>);

      expect(screen.getByText("Simple text content")).toBeInTheDocument();
    });

    it("should handle null children gracefully", () => {
      expect(() => {
        render(<NodeInteractive>{null}</NodeInteractive>);
      }).not.toThrow();
    });

    it("should handle undefined children gracefully", () => {
      expect(() => {
        render(<NodeInteractive>{undefined}</NodeInteractive>);
      }).not.toThrow();
    });
  });

  describe("className Handling", () => {
    it("should trim whitespace in className", () => {
      const testContent = <div data-testid="test-child">Test Content</div>;

      render(
        <NodeInteractive className="  extra-class  ">
          {testContent}
        </NodeInteractive>,
      );

      const wrapper = screen.getByTestId("test-child").parentElement;
      expect(wrapper).toHaveClass("nodrag", "extra-class");
    });

    it("should handle multiple classes", () => {
      const testContent = <div data-testid="test-child">Test Content</div>;

      render(
        <NodeInteractive className="class1 class2 class3">
          {testContent}
        </NodeInteractive>,
      );

      const wrapper = screen.getByTestId("test-child").parentElement;
      expect(wrapper).toHaveClass("nodrag", "class1", "class2", "class3");
    });

    it("should maintain nodrag class with additional classes", () => {
      const testContent = <div data-testid="test-child">Test Content</div>;

      render(
        <NodeInteractive className="interactive-element form-control">
          {testContent}
        </NodeInteractive>,
      );

      const wrapper = screen.getByTestId("test-child").parentElement;
      expect(wrapper).toHaveClass("nodrag");
      expect(wrapper).toHaveClass("interactive-element");
      expect(wrapper).toHaveClass("form-control");
    });
  });

  describe("ReactFlow Integration", () => {
    it("should prevent drag events with nodrag class", () => {
      const testContent = (
        <input data-testid="test-input" type="text" defaultValue="test" />
      );

      render(<NodeInteractive>{testContent}</NodeInteractive>);

      const wrapper = screen.getByTestId("test-input").parentElement;
      expect(wrapper).toHaveClass("nodrag");

      // The nodrag class should prevent ReactFlow from handling drag events
      // This is integration behavior that ReactFlow handles
      const input = screen.getByTestId("test-input");
      expect(input).toBeInTheDocument();
    });

    it("should work with form elements", () => {
      const formContent = (
        <form data-testid="test-form">
          <input data-testid="form-input" type="text" />
          <button data-testid="form-button" type="button">
            Click me
          </button>
          <select data-testid="form-select">
            <option value="1">Option 1</option>
          </select>
        </form>
      );

      render(<NodeInteractive>{formContent}</NodeInteractive>);

      const wrapper = screen.getByTestId("test-form").parentElement;
      expect(wrapper).toHaveClass("nodrag");

      // All form elements should be interactive
      expect(screen.getByTestId("form-input")).toBeInTheDocument();
      expect(screen.getByTestId("form-button")).toBeInTheDocument();
      expect(screen.getByTestId("form-select")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle complex nested content", () => {
      const complexContent = (
        <div data-testid="complex-wrapper">
          <div className="level-1">
            <div className="level-2">
              <span data-testid="nested-span">Deeply nested content</span>
              <button data-testid="nested-button">Nested Button</button>
            </div>
          </div>
        </div>
      );

      render(<NodeInteractive>{complexContent}</NodeInteractive>);

      const wrapper = screen.getByTestId("complex-wrapper").parentElement;
      expect(wrapper).toHaveClass("nodrag");
      expect(screen.getByTestId("nested-span")).toBeInTheDocument();
      expect(screen.getByTestId("nested-button")).toBeInTheDocument();
    });

    it("should handle React fragments", () => {
      const fragmentContent = (
        <React.Fragment>
          <div data-testid="fragment-child-1">Fragment Child 1</div>
          <div data-testid="fragment-child-2">Fragment Child 2</div>
        </React.Fragment>
      );

      render(<NodeInteractive>{fragmentContent}</NodeInteractive>);

      expect(screen.getByTestId("fragment-child-1")).toBeInTheDocument();
      expect(screen.getByTestId("fragment-child-2")).toBeInTheDocument();
    });

    it("should handle mixed content types", () => {
      const mixedContent = (
        <>
          <div data-testid="text-div">Text content</div>
          <div data-testid="div-element">Div element</div>
          <div data-testid="number-div">123</div>
          <span data-testid="span-element">Span element</span>
        </>
      );

      render(<NodeInteractive>{mixedContent}</NodeInteractive>);

      expect(screen.getByTestId("text-div")).toHaveTextContent("Text content");
      expect(screen.getByTestId("div-element")).toBeInTheDocument();
      expect(screen.getByTestId("number-div")).toHaveTextContent("123");
      expect(screen.getByTestId("span-element")).toBeInTheDocument();
    });
  });

  describe("Component Props", () => {
    it("should have correct TypeScript interface", () => {
      // This test verifies the component accepts the expected props
      const validProps = {
        children: <div>Test</div>,
        className: "test-class",
      };

      expect(() => {
        render(<NodeInteractive {...validProps} />);
      }).not.toThrow();
    });

    it("should work without optional className prop", () => {
      const minimalProps = {
        children: <div data-testid="minimal-child">Minimal</div>,
      };

      expect(() => {
        render(<NodeInteractive {...minimalProps} />);
      }).not.toThrow();

      expect(screen.getByTestId("minimal-child")).toBeInTheDocument();
    });
  });
});
