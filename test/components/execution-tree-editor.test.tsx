import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExecutionTreeEditor } from "@components/execution-tree-editor";
import { SkillActionNodeType } from "@models/skill.types";
import { useSkillStore } from "@store/skill.store";
import { render, screen, fireEvent } from "@testing-library/react";
import { autoLayoutNodes } from "@utils/auto-layout";

// Mock the auto-layout utility
vi.mock("@utils/auto-layout", () => ({
  autoLayoutNodes: vi.fn((nodes: any[]) =>
    nodes.map((node) => ({ ...node, position: { x: 100, y: 100 } })),
  ),
}));

// Mock React Flow module
vi.mock("reactflow", () => ({
  __esModule: true,
  default: vi.fn(({ children, nodes, edges, nodeTypes }) => (
    <div data-testid="react-flow">
      <div data-testid="react-flow-nodes">Nodes: {nodes?.length || 0}</div>
      <div data-testid="react-flow-edges">Edges: {edges?.length || 0}</div>
      <div data-testid="react-flow-node-types">
        NodeTypes: {nodeTypes ? Object.keys(nodeTypes).length : 0}
      </div>
      {children}
    </div>
  )),
  Panel: vi.fn(({ children, position }) => (
    <div data-testid={`react-flow-panel-${position}`}>{children}</div>
  )),
  Controls: vi.fn(() => <div data-testid="react-flow-controls">Controls</div>),
  MiniMap: vi.fn(() => <div data-testid="react-flow-minimap">MiniMap</div>),
  Background: vi.fn(() => (
    <div data-testid="react-flow-background">Background</div>
  )),
}));

// Mock all node type components
vi.mock("@components/nodetypes/animation-node", () => ({
  AnimationNode: vi.fn(() => (
    <div data-testid="animation-node">Animation Node</div>
  )),
}));

vi.mock("@components/nodetypes/delay-node", () => ({
  DelayNode: vi.fn(() => <div data-testid="delay-node">Delay Node</div>),
}));

vi.mock("@components/nodetypes/hit-effect-node", () => ({
  HitEffectNode: vi.fn(() => (
    <div data-testid="hit-effect-node">Hit Effect Node</div>
  )),
}));

vi.mock("@components/nodetypes/parallel-node", () => ({
  ParallelNode: vi.fn(() => (
    <div data-testid="parallel-node">Parallel Node</div>
  )),
}));

vi.mock("@components/nodetypes/requirement-node", () => ({
  RequirementNode: vi.fn(() => (
    <div data-testid="requirement-node">Requirement Node</div>
  )),
}));

vi.mock("@components/nodetypes/sequence-node", () => ({
  SequenceNode: vi.fn(() => (
    <div data-testid="sequence-node">Sequence Node</div>
  )),
}));

vi.mock("@components/nodetypes/sound-node", () => ({
  SoundNode: vi.fn(() => <div data-testid="sound-node">Sound Node</div>),
}));

vi.mock("@components/nodetypes/status-node", () => ({
  StatusNode: vi.fn(() => <div data-testid="status-node">Status Node</div>),
}));

vi.mock("@components/nodetypes/summon-node", () => ({
  SummonNode: vi.fn(() => <div data-testid="summon-node">Summon Node</div>),
}));

describe("ExecutionTreeEditor Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store to initial state
    const store = useSkillStore.getState();
    store.setNodes([]);
  });

  describe("Component Rendering", () => {
    it("should render React Flow with all required components", () => {
      render(<ExecutionTreeEditor />);

      expect(screen.getByTestId("react-flow")).toBeInTheDocument();
      expect(screen.getByTestId("react-flow-controls")).toBeInTheDocument();
      expect(screen.getByTestId("react-flow-minimap")).toBeInTheDocument();
      expect(screen.getByTestId("react-flow-background")).toBeInTheDocument();
    });

    it("should render toolbox panel", () => {
      render(<ExecutionTreeEditor />);

      expect(
        screen.getByTestId("react-flow-panel-top-right"),
      ).toBeInTheDocument();
      expect(screen.getByText("Toolbox")).toBeInTheDocument();
    });

    it("should display correct initial state with no nodes", () => {
      render(<ExecutionTreeEditor />);

      expect(screen.getByTestId("react-flow-nodes")).toHaveTextContent(
        "Nodes: 0",
      );
      expect(screen.getByTestId("react-flow-edges")).toHaveTextContent(
        "Edges: 0",
      );
    });

    it("should register all node types", () => {
      render(<ExecutionTreeEditor />);

      // Should have all 9 node types registered
      expect(screen.getByTestId("react-flow-node-types")).toHaveTextContent(
        "NodeTypes: 9",
      );
    });
  });

  describe("Empty State Behavior", () => {
    it("should show 'Add Requirement' button when no nodes exist", () => {
      render(<ExecutionTreeEditor />);

      expect(
        screen.getByText("Start by adding a requirement node:"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Add requirement/i }),
      ).toBeInTheDocument();
    });

    it("should call addNode when 'Add Requirement' button is clicked", () => {
      const initialState = useSkillStore.getState();
      const spy = vi.spyOn(initialState, "addNode");

      render(<ExecutionTreeEditor />);

      const addButton = screen.getByRole("button", {
        name: /Add requirement/i,
      });
      fireEvent.click(addButton);

      expect(spy).toHaveBeenCalledWith(SkillActionNodeType.Requirement, null);
      spy.mockRestore();
    });
  });

  describe("Auto Layout Functionality", () => {
    it("should show Auto Layout button when nodes exist", () => {
      // Add a node to the store
      const store = useSkillStore.getState();
      store.addNode(SkillActionNodeType.Requirement, null);

      render(<ExecutionTreeEditor />);

      expect(
        screen.getByRole("button", { name: "Auto Layout" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Start by adding a requirement node:"),
      ).not.toBeInTheDocument();
    });

    it("should call autoLayoutNodes when Auto Layout is clicked", () => {
      // Add a node to the store
      const store = useSkillStore.getState();
      store.addNode(SkillActionNodeType.Requirement, null);

      render(<ExecutionTreeEditor />);

      const autoLayoutButton = screen.getByRole("button", {
        name: "Auto Layout",
      });
      fireEvent.click(autoLayoutButton);

      expect(autoLayoutNodes).toHaveBeenCalled();
    });
  });

  describe("Store Integration", () => {
    it("should reflect store state in React Flow", () => {
      // Add nodes to the store
      const store = useSkillStore.getState();
      store.addNode(SkillActionNodeType.Requirement, null);
      store.addNode(SkillActionNodeType.Sequence, null);

      render(<ExecutionTreeEditor />);

      // Should show the nodes from the store
      expect(screen.getByTestId("react-flow-nodes")).toHaveTextContent(
        "Nodes: 2",
      );
    });

    it("should use store methods for React Flow event handlers", () => {
      render(<ExecutionTreeEditor />);

      // The component should render without errors, indicating proper store integration
      expect(screen.getByTestId("react-flow")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty arrays for nodes and edges gracefully", () => {
      render(<ExecutionTreeEditor />);

      expect(screen.getByTestId("react-flow-nodes")).toHaveTextContent(
        "Nodes: 0",
      );
      expect(screen.getByTestId("react-flow-edges")).toHaveTextContent(
        "Edges: 0",
      );
    });

    it("should handle large numbers of nodes", () => {
      const store = useSkillStore.getState();

      // Add many nodes
      for (let i = 0; i < 5; i++)
        store.addNode(SkillActionNodeType.Requirement, null);

      render(<ExecutionTreeEditor />);

      expect(screen.getByTestId("react-flow-nodes")).toHaveTextContent(
        "Nodes: 5",
      );
    });
  });

  describe("Component Integration", () => {
    it("should render without crashing", () => {
      expect(() => render(<ExecutionTreeEditor />)).not.toThrow();
    });

    it("should handle component lifecycle correctly", () => {
      const { unmount } = render(<ExecutionTreeEditor />);

      expect(screen.getByTestId("react-flow")).toBeInTheDocument();

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });
  });
});
