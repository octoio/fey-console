import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { SequenceNode } from "@components/nodetypes/sequence-node";
import { SkillActionNodeType } from "@models/skill.types";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock store
const mockUpdateNodeData = vi.fn();
const mockReorderNode = vi.fn();

// Mock the edges for the store
const mockEdges: Array<{ id: string; source: string; target: string }> = [];
const mockNodes: Array<{
  id: string;
  type: string;
  data: Record<string, unknown>;
}> = [];

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
    nodes: mockNodes,
    reorderNode: mockReorderNode,
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
    renderContent: (props: {
      id: string;
      data: Record<string, unknown>;
    }) => React.ReactElement;
  }) => {
    const Component = (props: {
      id: string;
      data: Record<string, unknown>;
    }) => {
      return (
        <div
          data-testid="sequence-node"
          data-node-type={nodeType}
          data-bg={backgroundColor}
          data-border={borderColor}
        >
          {renderContent(props)}
        </div>
      );
    };
    Component.displayName = "SequenceNode";
    return Component;
  },
  NODE_COLORS: {
    PALE_BLUE_BG: "#e6f4ff",
    GRAY_BLUE_BORDER: "#91caff",
  },
  NodeField: ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <div data-testid="node-field">
      <label>{label}</label>
      {children}
    </div>
  ),
  OrderedNodesList: ({
    parentId,
    edges,
    onReorder,
  }: {
    parentId: string;
    nodes: Array<{ id: string; type: string; data: Record<string, unknown> }>;
    edges: Array<{ id: string; source: string; target: string }>;
    onReorder: (nodeId: string, direction: "left" | "right") => void;
  }) => {
    // Find child edges from this parent
    const childEdges = edges.filter((edge) => edge.source === parentId);

    if (childEdges.length === 0) return null;

    return (
      <div data-testid="ordered-nodes-list">
        {childEdges.map((edge) => (
          <div key={edge.target} data-testid={`child-node-${edge.target}`}>
            <button
              data-testid={`reorder-left-${edge.target}`}
              onClick={() => onReorder(edge.target, "left")}
            >
              Left
            </button>
            <span>{edge.target}</span>
            <button
              data-testid={`reorder-right-${edge.target}`}
              onClick={() => onReorder(edge.target, "right")}
            >
              Right
            </button>
          </div>
        ))}
      </div>
    );
  },
}));

describe("SequenceNode", () => {
  const mockProps = {
    id: "sequence-1",
    data: {
      loop: 3,
    },
    type: SkillActionNodeType.Sequence,
    position: { x: 0, y: 0 },
    selected: false,
    xPos: 0,
    yPos: 0,
    zIndex: 0,
    isConnectable: true,
    dragging: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock edges
    mockEdges.length = 0;
    mockNodes.length = 0;
  });

  describe("Component Rendering", () => {
    it("should render sequence node with loop input", () => {
      render(<SequenceNode {...mockProps} />);

      expect(screen.getByTestId("sequence-node")).toBeInTheDocument();
      expect(screen.getByTestId("node-field")).toBeInTheDocument();
      expect(screen.getByText("Loop")).toBeInTheDocument();
      expect(screen.getByDisplayValue("3")).toBeInTheDocument();
    });

    it("should have correct node type and styling", () => {
      render(<SequenceNode {...mockProps} />);

      const nodeElement = screen.getByTestId("sequence-node");
      expect(nodeElement).toHaveAttribute("data-node-type", "Sequence");
      expect(nodeElement).toHaveAttribute("data-bg", "#e6f4ff");
      expect(nodeElement).toHaveAttribute("data-border", "#91caff");
    });

    it("should render with default loop value when missing", () => {
      const propsWithoutLoop = {
        id: "sequence-1",
        data: {},
        type: SkillActionNodeType.Sequence,
        position: { x: 0, y: 0 },
        selected: false,
        xPos: 0,
        yPos: 0,
        zIndex: 0,
        isConnectable: true,
        dragging: false,
      };

      render(<SequenceNode {...propsWithoutLoop} />);

      // Should still render the input field
      expect(screen.getByTestId("node-field")).toBeInTheDocument();
      expect(screen.getByText("Loop")).toBeInTheDocument();
    });
  });

  describe("Loop Input Interactions", () => {
    it("should update loop value when input changes", async () => {
      render(<SequenceNode {...mockProps} />);

      const loopInput = screen.getByDisplayValue("3");
      fireEvent.change(loopInput, { target: { value: "5" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith({
          loop: 5,
        });
      });
    });

    it("should handle loop value of 1", async () => {
      render(<SequenceNode {...mockProps} />);

      const loopInput = screen.getByDisplayValue("3");
      fireEvent.change(loopInput, { target: { value: "1" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith({
          loop: 1,
        });
      });
    });

    it("should default to 1 when empty value is provided", async () => {
      render(<SequenceNode {...mockProps} />);

      const loopInput = screen.getByDisplayValue("3");
      fireEvent.change(loopInput, { target: { value: "" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith({
          loop: 1,
        });
      });
    });
  });

  describe("Children Display", () => {
    it("should not show ordered nodes list when no children", () => {
      render(<SequenceNode {...mockProps} />);

      expect(
        screen.queryByTestId("ordered-nodes-list"),
      ).not.toBeInTheDocument();
    });

    it("should show ordered nodes list when children exist", () => {
      // Add some mock edges to simulate children
      mockEdges.push(
        { id: "edge-1", source: "sequence-1", target: "child-1" },
        { id: "edge-2", source: "sequence-1", target: "child-2" },
      );

      render(<SequenceNode {...mockProps} />);

      expect(screen.getByTestId("ordered-nodes-list")).toBeInTheDocument();
    });
  });

  describe("Node Reordering", () => {
    beforeEach(() => {
      // Add mock edges and nodes for reordering tests
      mockEdges.push(
        { id: "edge-1", source: "sequence-1", target: "child-1" },
        { id: "edge-2", source: "sequence-1", target: "child-2" },
      );
    });

    it("should handle reordering child nodes left", async () => {
      render(<SequenceNode {...mockProps} />);

      const leftButton = screen.getByTestId("reorder-left-child-1");
      fireEvent.click(leftButton);

      await waitFor(() => {
        expect(mockReorderNode).toHaveBeenCalledWith("child-1", "left");
      });
    });

    it("should handle reordering child nodes right", async () => {
      render(<SequenceNode {...mockProps} />);

      const rightButton = screen.getByTestId("reorder-right-child-2");
      fireEvent.click(rightButton);

      await waitFor(() => {
        expect(mockReorderNode).toHaveBeenCalledWith("child-2", "right");
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle missing data gracefully", () => {
      const emptyProps = {
        id: "sequence-1",
        data: {},
        type: SkillActionNodeType.Sequence,
        position: { x: 0, y: 0 },
        selected: false,
        xPos: 0,
        yPos: 0,
        zIndex: 0,
        isConnectable: true,
        dragging: false,
      };

      expect(() => {
        render(<SequenceNode {...emptyProps} />);
      }).not.toThrow();

      expect(screen.getByTestId("sequence-node")).toBeInTheDocument();
    });
  });

  describe("Integration", () => {
    it("should work with multiple children and proper reordering", () => {
      // Setup multiple child edges
      mockEdges.push(
        { id: "edge-1", source: "sequence-1", target: "child-1" },
        { id: "edge-2", source: "sequence-1", target: "child-2" },
        { id: "edge-3", source: "sequence-1", target: "child-3" },
      );

      render(<SequenceNode {...mockProps} />);

      // Should show all children
      expect(screen.getByTestId("child-node-child-1")).toBeInTheDocument();
      expect(screen.getByTestId("child-node-child-2")).toBeInTheDocument();
      expect(screen.getByTestId("child-node-child-3")).toBeInTheDocument();

      // Should have reorder buttons for each
      expect(screen.getByTestId("reorder-left-child-1")).toBeInTheDocument();
      expect(screen.getByTestId("reorder-right-child-1")).toBeInTheDocument();
    });

    it("should maintain loop value across re-renders", () => {
      const { rerender } = render(<SequenceNode {...mockProps} />);

      expect(screen.getByDisplayValue("3")).toBeInTheDocument();

      // Update props
      const updatedProps = {
        ...mockProps,
        data: { loop: 7 },
      };

      rerender(<SequenceNode {...updatedProps} />);

      expect(screen.getByDisplayValue("7")).toBeInTheDocument();
    });
  });
});
