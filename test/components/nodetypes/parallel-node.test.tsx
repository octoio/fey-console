import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ParallelNode } from "@components/nodetypes/parallel-node";
import { SkillActionNodeType } from "@models/skill.types";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock store
const mockUpdateNodeData = vi.fn();

// Mock the edges for the store
const mockEdges: Array<{ id: string; source: string; target: string }> = [];

// Mock node-operations
vi.mock("@utils/node-operations", () => ({
  useNodeOperations: vi.fn(() => ({
    updateNodeData: mockUpdateNodeData,
  })),
}));

// Mock store
vi.mock("@store/skill.store", () => ({
  useSkillStore: vi.fn(() => ({
    edges: mockEdges,
  })),
}));

// Mock node-common components
vi.mock("@components/node-common", () => ({
  createNodeComponent: ({
    nodeType,
    backgroundColor,
    borderColor,
    renderContent,
  }: {
    nodeType: string;
    backgroundColor: string;
    borderColor: string;
    renderContent: (props: unknown) => React.ReactNode;
  }) => {
    const MockComponent = (props: unknown) => (
      <div
        data-testid="parallel-node"
        data-node-type={nodeType}
        data-background={backgroundColor}
        data-border={borderColor}
      >
        <div data-testid="node-header">{nodeType}</div>
        <div data-testid="node-content">{renderContent(props)}</div>
      </div>
    );
    MockComponent.displayName = "ParallelNode";
    return MockComponent;
  },
  NodeField: ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <div data-testid="node-field">
      <label data-testid="field-label">{label}</label>
      <div data-testid="field-content">{children}</div>
    </div>
  ),
  NODE_COLORS: {
    LIGHT_GREEN_BG: "#f6ffe6",
    GREEN_BORDER: "#52c41a",
  },
}));

// Mock Ant Design components
vi.mock("antd", () => ({
  InputNumber: ({
    value,
    onChange,
    min,
  }: {
    value?: number | null;
    onChange?: (value: number | null) => void;
    min?: number;
  }) => (
    <input
      data-testid="loop-input"
      type="number"
      value={value || ""}
      onChange={(e) =>
        onChange && onChange(e.target.value ? Number(e.target.value) : null)
      }
      min={min}
    />
  ),
  Typography: {
    Text: ({
      type,
      children,
    }: {
      type?: string;
      children: React.ReactNode;
    }) => (
      <span data-testid="children-count" data-type={type}>
        {children}
      </span>
    ),
  },
}));

describe("ParallelNode", () => {
  const createMockProps = (overrides: Record<string, unknown> = {}) => ({
    id: "parallel-node-1",
    data: {
      loop: 1,
      ...overrides,
    },
    type: "parallel",
    dragHandle: "",
    isConnectable: true,
    zIndex: 0,
    xPos: 0,
    yPos: 0,
    dragging: false,
    selected: false,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock edges
    mockEdges.length = 0;
  });

  describe("Rendering", () => {
    it("renders the parallel node with correct structure", () => {
      const props = createMockProps();
      render(<ParallelNode {...props} />);

      expect(screen.getByTestId("parallel-node")).toBeInTheDocument();
      expect(screen.getByTestId("node-field")).toBeInTheDocument();
      expect(screen.getByTestId("loop-input")).toBeInTheDocument();
      expect(screen.getByTestId("children-count")).toBeInTheDocument();
    });

    it("renders with correct node type and colors", () => {
      const props = createMockProps();
      render(<ParallelNode {...props} />);

      const nodeElement = screen.getByTestId("parallel-node");
      expect(nodeElement).toHaveAttribute(
        "data-node-type",
        SkillActionNodeType.Parallel,
      );
      expect(nodeElement).toHaveAttribute("data-background", "#f6ffe6");
      expect(nodeElement).toHaveAttribute("data-border", "#52c41a");
    });

    it("renders with default loop value", () => {
      const props = createMockProps();
      render(<ParallelNode {...props} />);

      const loopInput = screen.getByTestId("loop-input");
      expect(loopInput).toHaveValue(1);
      expect(loopInput).toHaveAttribute("min", "1");
    });

    it("renders with custom loop value", () => {
      const props = createMockProps({ loop: 5 });
      render(<ParallelNode {...props} />);

      const loopInput = screen.getByTestId("loop-input");
      expect(loopInput).toHaveValue(5);
    });

    it("displays correct field label", () => {
      const props = createMockProps();
      render(<ParallelNode {...props} />);

      const fieldLabel = screen.getByTestId("field-label");
      expect(fieldLabel).toHaveTextContent("Loop Count");
    });
  });

  describe("Children Count Display", () => {
    it("displays 'No children' when there are no edges", () => {
      const props = createMockProps();
      render(<ParallelNode {...props} />);

      const childrenCount = screen.getByTestId("children-count");
      expect(childrenCount).toHaveTextContent("No children");
      expect(childrenCount).toHaveAttribute("data-type", "secondary");
    });

    it("displays correct children count when there are edges", () => {
      // Add edges to the mock
      mockEdges.push(
        { id: "edge-1", source: "parallel-node-1", target: "child-1" },
        { id: "edge-2", source: "parallel-node-1", target: "child-2" },
        { id: "edge-3", source: "parallel-node-1", target: "child-3" },
      );

      const props = createMockProps();
      render(<ParallelNode {...props} />);

      const childrenCount = screen.getByTestId("children-count");
      expect(childrenCount).toHaveTextContent("Children: 3");
    });

    it("only counts edges from this node as source", () => {
      // Add mixed edges to the mock
      mockEdges.push(
        { id: "edge-1", source: "parallel-node-1", target: "child-1" },
        { id: "edge-2", source: "other-node", target: "parallel-node-1" },
        { id: "edge-3", source: "parallel-node-1", target: "child-2" },
        { id: "edge-4", source: "another-node", target: "child-3" },
      );

      const props = createMockProps();
      render(<ParallelNode {...props} />);

      const childrenCount = screen.getByTestId("children-count");
      expect(childrenCount).toHaveTextContent("Children: 2");
    });
  });

  describe("Loop Input Interaction", () => {
    it("handles loop count changes", async () => {
      const props = createMockProps();
      render(<ParallelNode {...props} />);

      const loopInput = screen.getByTestId("loop-input");

      fireEvent.change(loopInput, { target: { value: "3" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith({ loop: 3 });
      });
    });

    it("handles changing to larger loop count", async () => {
      const props = createMockProps({ loop: 2 });
      render(<ParallelNode {...props} />);

      const loopInput = screen.getByTestId("loop-input");

      fireEvent.change(loopInput, { target: { value: "10" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith({ loop: 10 });
      });
    });

    it("handles clearing loop input", async () => {
      const props = createMockProps({ loop: 5 });
      render(<ParallelNode {...props} />);

      const loopInput = screen.getByTestId("loop-input");

      fireEvent.change(loopInput, { target: { value: "" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith({ loop: 1 });
      });
    });

    it("defaults to 1 when null value is passed", async () => {
      const props = createMockProps();
      render(<ParallelNode {...props} />);

      const loopInput = screen.getByTestId("loop-input");

      // Simulate the InputNumber component passing null
      fireEvent.change(loopInput, { target: { value: "" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith({ loop: 1 });
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles missing loop data gracefully", () => {
      const props = {
        id: "parallel-node-1",
        data: {},
        type: "parallel",
        dragHandle: "",
        isConnectable: true,
        zIndex: 0,
        xPos: 0,
        yPos: 0,
        dragging: false,
        selected: false,
      };

      render(<ParallelNode {...props} />);

      expect(screen.getByTestId("parallel-node")).toBeInTheDocument();
      expect(screen.getByTestId("loop-input")).toBeInTheDocument();
    });

    it("handles null loop data", () => {
      const props = createMockProps({ loop: null });
      render(<ParallelNode {...props} />);

      const loopInput = screen.getByTestId("loop-input") as HTMLInputElement;
      // When value is null, our mock shows empty string
      expect(loopInput.value).toBe("");
    });

    it("handles zero loop value", () => {
      const props = createMockProps({ loop: 0 });
      render(<ParallelNode {...props} />);

      const loopInput = screen.getByTestId("loop-input") as HTMLInputElement;
      // When value is 0, our mock shows empty string since 0 is falsy
      expect(loopInput.value).toBe("");
    });

    it("handles very large loop values", () => {
      const props = createMockProps({ loop: 9999 });
      render(<ParallelNode {...props} />);

      const loopInput = screen.getByTestId("loop-input");
      expect(loopInput).toHaveValue(9999);
    });
  });

  describe("Complex Interactions", () => {
    it("handles multiple rapid loop changes", async () => {
      const props = createMockProps();
      render(<ParallelNode {...props} />);

      const loopInput = screen.getByTestId("loop-input");

      // Make multiple changes quickly
      fireEvent.change(loopInput, { target: { value: "2" } });
      fireEvent.change(loopInput, { target: { value: "3" } });
      fireEvent.change(loopInput, { target: { value: "5" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledTimes(3);
      });

      expect(mockUpdateNodeData).toHaveBeenLastCalledWith({ loop: 5 });
    });

    it("maintains state consistency during updates", async () => {
      const props = createMockProps({ loop: 2 });
      render(<ParallelNode {...props} />);

      const loopInput = screen.getByTestId("loop-input");
      expect(loopInput).toHaveValue(2);

      fireEvent.change(loopInput, { target: { value: "7" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith({ loop: 7 });
      });
    });
  });

  describe("Accessibility", () => {
    it("provides proper form control attributes", () => {
      const props = createMockProps();
      render(<ParallelNode {...props} />);

      const loopInput = screen.getByTestId("loop-input");
      expect(loopInput).toHaveAttribute("type", "number");
      expect(loopInput).toHaveAttribute("min", "1");
    });

    it("maintains focus management", () => {
      const props = createMockProps();
      render(<ParallelNode {...props} />);

      const loopInput = screen.getByTestId("loop-input");
      loopInput.focus();
      expect(document.activeElement).toBe(loopInput);
    });

    it("provides semantic information about children", () => {
      // Add an edge to the mock
      mockEdges.push({
        id: "edge-1",
        source: "parallel-node-1",
        target: "child-1",
      });

      const props = createMockProps();
      render(<ParallelNode {...props} />);

      const childrenCount = screen.getByTestId("children-count");
      expect(childrenCount).toHaveAttribute("data-type", "secondary");
      expect(childrenCount).toHaveTextContent("Children: 1");
    });
  });

  describe("Component Configuration", () => {
    it("passes correct configuration to createNodeComponent", () => {
      const props = createMockProps();
      render(<ParallelNode {...props} />);

      // Verify the node was created with correct type and colors
      const nodeElement = screen.getByTestId("parallel-node");
      expect(nodeElement).toHaveAttribute(
        "data-node-type",
        SkillActionNodeType.Parallel,
      );
      expect(nodeElement).toHaveAttribute("data-background", "#f6ffe6");
      expect(nodeElement).toHaveAttribute("data-border", "#52c41a");
    });
  });
});
