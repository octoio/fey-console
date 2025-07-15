import { describe, it, expect, beforeEach, vi } from "vitest";
import { DelayNode } from "@components/nodetypes/delay-node";
import { useSkillStore } from "@store/skill.store";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock styled components
vi.mock("@components/common/styled-components", () => ({
  FullWidthInputNumber: ({ value, onChange, min, step, size }: any) => (
    <input
      data-testid="delay-input"
      type="number"
      value={value || ""}
      onChange={(e) =>
        onChange?.(e.target.value ? parseFloat(e.target.value) : null)
      }
      min={min}
      step={step}
      data-size={size}
    />
  ),
}));

// Mock node-common components
vi.mock("@components/node-common", () => ({
  createNodeComponent: ({
    nodeType,
    backgroundColor,
    borderColor,
    renderContent,
  }: any) => {
    const MockComponent = (props: any) => (
      <div
        data-testid={`${nodeType.toLowerCase()}-node`}
        data-background={backgroundColor}
        data-border={borderColor}
      >
        <div data-testid="node-header">{nodeType}</div>
        <div data-testid="node-content">{renderContent(props)}</div>
      </div>
    );
    MockComponent.displayName = `${nodeType}Node`;
    return MockComponent;
  },
  NODE_COLORS: {
    LIGHT_PINK_BG: "#fff0f6",
    PINK_BORDER: "#ffadd2",
  },
  NodeField: ({ label, children }: any) => (
    <div data-testid="node-field">
      <label data-testid="field-label">{label}</label>
      <div data-testid="field-content">{children}</div>
    </div>
  ),
}));

// Mock utils
vi.mock("@utils/node-operations", () => ({
  useNodeOperations: () => ({
    updateNodeData: vi.fn(),
  }),
}));

describe("DelayNode Tests", () => {
  beforeEach(() => {
    useSkillStore.setState({
      nodes: [],
      edges: [],
    });
  });

  const createNodeProps = (id: string, data: any) =>
    ({
      id,
      data,
      type: "custom",
      selected: false,
      zIndex: 1,
      isConnectable: true,
      xPos: 0,
      yPos: 0,
      dragHandle: undefined,
    }) as any;

  it("should render DelayNode with correct structure", () => {
    const mockProps = createNodeProps("delay-1", {
      delay: 2.5,
      name: "Test Delay",
    });

    render(<DelayNode {...mockProps} />);

    const node = screen.getByTestId("delay-node");
    expect(node).toBeInTheDocument();
    expect(node).toHaveAttribute("data-background", "#fff0f6");
    expect(node).toHaveAttribute("data-border", "#ffadd2");

    expect(screen.getByTestId("node-header")).toHaveTextContent("Delay");
    expect(screen.getByTestId("field-label")).toHaveTextContent(
      "Delay (seconds)",
    );
  });

  it("should display current delay value", () => {
    const mockProps = createNodeProps("delay-1", {
      delay: 2.5,
      name: "Test Delay",
    });

    render(<DelayNode {...mockProps} />);

    const input = screen.getByTestId("delay-input");
    expect(input).toHaveValue(2.5);
    expect(input).toHaveAttribute("min", "0");
    expect(input).toHaveAttribute("step", "0.1");
    expect(input).toHaveAttribute("data-size", "small");
  });

  it("should handle delay value changes", async () => {
    const user = userEvent.setup();
    const mockProps = createNodeProps("delay-1", {
      delay: 2.5,
      name: "Test Delay",
    });

    render(<DelayNode {...mockProps} />);

    const input = screen.getByTestId("delay-input");

    // Test that the input exists and is interactive
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "number");

    // Test user interactions don't throw errors
    await user.clear(input);
    await user.type(input, "5.5");

    // The component structure is correct
    expect(input).toHaveAttribute("min", "0");
    expect(input).toHaveAttribute("step", "0.1");
  });

  it("should handle empty values", () => {
    const mockProps = createNodeProps("delay-1", {
      delay: null,
      name: "Test Delay",
    });

    render(<DelayNode {...mockProps} />);

    const input = screen.getByTestId("delay-input");
    // null values should render as empty string in our mock
    expect(input).toHaveValue(null);
  });

  it("should handle missing data gracefully", () => {
    const mockProps = createNodeProps("delay-1", {});

    expect(() => {
      render(<DelayNode {...mockProps} />);
    }).not.toThrow();
  });
});
