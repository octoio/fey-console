import { Node, Edge } from "reactflow";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { OrderedNodesList } from "@components/node-common/ordered-nodes-list";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock Ant Design icons
vi.mock("@ant-design/icons", () => ({
  ArrowLeftOutlined: () => <span data-testid="arrow-left-icon">←</span>,
  ArrowRightOutlined: () => <span data-testid="arrow-right-icon">→</span>,
}));

describe("OrderedNodesList", () => {
  const mockNodes: Node[] = [
    {
      id: "child1",
      type: "custom",
      position: { x: 100, y: 100 },
      data: { type: "Animation", name: "Walk Animation" },
    },
    {
      id: "child2",
      type: "custom",
      position: { x: 200, y: 100 },
      data: { type: "Sound", name: "Footstep Sound" },
    },
    {
      id: "child3",
      type: "custom",
      position: { x: 300, y: 100 },
      data: { type: "Effect", name: "Dust Effect" },
    },
    {
      id: "unrelated",
      type: "custom",
      position: { x: 400, y: 200 },
      data: { type: "Other" },
    },
  ];

  const mockEdges: Edge[] = [
    { id: "edge1", source: "parent1", target: "child1" },
    { id: "edge2", source: "parent1", target: "child2" },
    { id: "edge3", source: "parent1", target: "child3" },
    { id: "edge4", source: "other-parent", target: "unrelated" },
  ];

  const defaultProps = {
    parentId: "parent1",
    nodes: mockNodes,
    edges: mockEdges,
    onReorder: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when no child nodes exist", () => {
    const emptyEdges: Edge[] = [];
    render(<OrderedNodesList {...defaultProps} edges={emptyEdges} />);

    expect(screen.queryByText("Execution Order")).not.toBeInTheDocument();
  });

  it("renders nothing when parent has no outgoing edges", () => {
    render(
      <OrderedNodesList {...defaultProps} parentId="nonexistent-parent" />,
    );

    expect(screen.queryByText("Execution Order")).not.toBeInTheDocument();
  });

  it("renders list header", () => {
    render(<OrderedNodesList {...defaultProps} />);

    expect(screen.getByText("Execution Order")).toBeInTheDocument();
  });

  it("renders child nodes in correct order based on x position", () => {
    render(<OrderedNodesList {...defaultProps} />);

    // Should render nodes sorted by x position (100, 200, 300)
    expect(screen.getByText("1. Walk Animation")).toBeInTheDocument();
    expect(screen.getByText("2. Footstep Sound")).toBeInTheDocument();
    expect(screen.getByText("3. Dust Effect")).toBeInTheDocument();
  });

  it("uses fallback name when node name is not provided", () => {
    const nodesWithoutNames: Node[] = [
      {
        id: "child1",
        type: "custom",
        position: { x: 100, y: 100 },
        data: { type: "Animation" }, // No name property
      },
    ];

    const edges: Edge[] = [
      { id: "edge1", source: "parent1", target: "child1" },
    ];

    render(
      <OrderedNodesList
        {...defaultProps}
        nodes={nodesWithoutNames}
        edges={edges}
      />,
    );

    expect(screen.getByText("1. Animation Node")).toBeInTheDocument();
  });

  it("renders reorder buttons for each node", () => {
    render(<OrderedNodesList {...defaultProps} />);

    // Should have left and right arrow buttons for each node
    const leftButtons = screen.getAllByTestId("arrow-left-icon");
    const rightButtons = screen.getAllByTestId("arrow-right-icon");

    expect(leftButtons).toHaveLength(3);
    expect(rightButtons).toHaveLength(3);
  });

  it("disables left arrow for first node", () => {
    render(<OrderedNodesList {...defaultProps} />);

    const leftButtons = screen.getAllByTestId("arrow-left-icon");
    const firstLeftButton = leftButtons[0].closest("button");

    expect(firstLeftButton).toBeDisabled();
  });

  it("disables right arrow for last node", () => {
    render(<OrderedNodesList {...defaultProps} />);

    const rightButtons = screen.getAllByTestId("arrow-right-icon");
    const lastRightButton =
      rightButtons[rightButtons.length - 1].closest("button");

    expect(lastRightButton).toBeDisabled();
  });

  it("enables arrows for middle nodes", () => {
    render(<OrderedNodesList {...defaultProps} />);

    const leftButtons = screen.getAllByTestId("arrow-left-icon");
    const rightButtons = screen.getAllByTestId("arrow-right-icon");

    // Middle node (index 1) should have both arrows enabled
    const middleLeftButton = leftButtons[1].closest("button");
    const middleRightButton = rightButtons[1].closest("button");

    expect(middleLeftButton).not.toBeDisabled();
    expect(middleRightButton).not.toBeDisabled();
  });

  it("calls onReorder with correct parameters when left arrow clicked", () => {
    const onReorder = vi.fn();
    render(<OrderedNodesList {...defaultProps} onReorder={onReorder} />);

    const leftButtons = screen.getAllByTestId("arrow-left-icon");
    const secondNodeLeftButton = leftButtons[1].closest("button");

    fireEvent.click(secondNodeLeftButton!);

    expect(onReorder).toHaveBeenCalledWith("child2", "left");
  });

  it("calls onReorder with correct parameters when right arrow clicked", () => {
    const onReorder = vi.fn();
    render(<OrderedNodesList {...defaultProps} onReorder={onReorder} />);

    const rightButtons = screen.getAllByTestId("arrow-right-icon");
    const firstNodeRightButton = rightButtons[0].closest("button");

    fireEvent.click(firstNodeRightButton!);

    expect(onReorder).toHaveBeenCalledWith("child1", "right");
  });

  it("handles single child node correctly", () => {
    const singleNodeEdges: Edge[] = [
      { id: "edge1", source: "parent1", target: "child1" },
    ];

    render(<OrderedNodesList {...defaultProps} edges={singleNodeEdges} />);

    expect(screen.getByText("1. Walk Animation")).toBeInTheDocument();

    // Both buttons should be disabled for single node
    const leftButton = screen.getByTestId("arrow-left-icon").closest("button");
    const rightButton = screen
      .getByTestId("arrow-right-icon")
      .closest("button");

    expect(leftButton).toBeDisabled();
    expect(rightButton).toBeDisabled();
  });

  it("filters out edges not related to parent", () => {
    render(<OrderedNodesList {...defaultProps} />);

    // Should not include the "unrelated" node
    expect(screen.queryByText("Other")).not.toBeInTheDocument();
    expect(screen.queryByText("4.")).not.toBeInTheDocument();
  });

  it("handles missing target nodes gracefully", () => {
    const invalidEdges: Edge[] = [
      { id: "edge1", source: "parent1", target: "child1" },
      { id: "edge2", source: "parent1", target: "nonexistent-node" },
      { id: "edge3", source: "parent1", target: "child2" },
    ];

    render(<OrderedNodesList {...defaultProps} edges={invalidEdges} />);

    // Should only render valid nodes
    expect(screen.getByText("1. Walk Animation")).toBeInTheDocument();
    expect(screen.getByText("2. Footstep Sound")).toBeInTheDocument();
    expect(screen.queryByText("3.")).not.toBeInTheDocument();
  });

  it("sorts nodes correctly by x position", () => {
    // Create nodes with different x positions
    const unsortedNodes: Node[] = [
      {
        id: "child1",
        type: "custom",
        position: { x: 300, y: 100 }, // Third position
        data: { type: "Animation", name: "Third" },
      },
      {
        id: "child2",
        type: "custom",
        position: { x: 100, y: 100 }, // First position
        data: { type: "Sound", name: "First" },
      },
      {
        id: "child3",
        type: "custom",
        position: { x: 200, y: 100 }, // Second position
        data: { type: "Effect", name: "Second" },
      },
    ];

    render(<OrderedNodesList {...defaultProps} nodes={unsortedNodes} />);

    // Should be sorted by x position
    expect(screen.getByText("1. First")).toBeInTheDocument();
    expect(screen.getByText("2. Second")).toBeInTheDocument();
    expect(screen.getByText("3. Third")).toBeInTheDocument();
  });

  it("handles nodes with same x position", () => {
    const samePositionNodes: Node[] = [
      {
        id: "child1",
        type: "custom",
        position: { x: 100, y: 100 },
        data: { type: "Animation", name: "Node A" },
      },
      {
        id: "child2",
        type: "custom",
        position: { x: 100, y: 100 }, // Same x position
        data: { type: "Sound", name: "Node B" },
      },
    ];

    const edges: Edge[] = [
      { id: "edge1", source: "parent1", target: "child1" },
      { id: "edge2", source: "parent1", target: "child2" },
    ];

    render(
      <OrderedNodesList
        {...defaultProps}
        nodes={samePositionNodes}
        edges={edges}
      />,
    );

    // Should render both nodes (order may vary but both should be present)
    expect(screen.getByText(/1\. (Node A|Node B)/)).toBeInTheDocument();
    expect(screen.getByText(/2\. (Node A|Node B)/)).toBeInTheDocument();
  });
});
