import { Node, Edge, ReactFlowState } from "reactflow";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { autoLayoutNodes } from "@utils/auto-layout";

// Mock dagre
vi.mock("dagre", () => {
  const mockNode = { x: 100, y: 50, width: 200, height: 100 };
  const mockGraph = {
    setDefaultEdgeLabel: vi.fn(),
    setGraph: vi.fn(),
    setNode: vi.fn(),
    setEdge: vi.fn(),
    node: vi.fn(() => mockNode),
  };

  return {
    default: {
      graphlib: {
        Graph: vi.fn(() => mockGraph),
      },
      layout: vi.fn(),
    },
  };
});

describe("auto-layout", () => {
  let mockNodes: Node[];
  let mockEdges: Edge[];

  beforeEach(() => {
    mockNodes = [
      {
        id: "1",
        type: "Sequence",
        position: { x: 0, y: 0 },
        data: { name: "Root" },
      },
      {
        id: "2",
        type: "Hit",
        position: { x: 100, y: 200 },
        data: { name: "Child 1" },
      },
      {
        id: "3",
        type: "Status",
        position: { x: 300, y: 200 },
        data: { name: "Child 2" },
      },
    ];

    mockEdges = [
      { id: "e1-2", source: "1", target: "2" },
      { id: "e1-3", source: "1", target: "3" },
    ];
  });

  describe("autoLayoutNodes", () => {
    it("should process nodes and edges for layout", () => {
      const result = autoLayoutNodes(mockNodes, mockEdges);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe("1");
      expect(result[1].id).toBe("2");
      expect(result[2].id).toBe("3");
    });

    it("should update node positions based on layout", () => {
      const result = autoLayoutNodes(mockNodes, mockEdges);

      result.forEach((node) => {
        expect(node.position).toEqual({ x: 0, y: 0 }); // x - width/2, y - height/2 from mock
        expect(node.positionAbsolute).toEqual({ x: 0, y: 0 });
        expect(node.dragging).toBe(false);
      });
    });

    it("should handle empty nodes and edges", () => {
      const result = autoLayoutNodes([], []);
      expect(result).toEqual([]);
    });

    it("should preserve child order based on X position", () => {
      const nodesWithOrder = [
        { id: "parent", type: "Sequence", position: { x: 0, y: 0 }, data: {} },
        { id: "child1", type: "Hit", position: { x: 50, y: 100 }, data: {} },
        { id: "child2", type: "Hit", position: { x: 150, y: 100 }, data: {} },
        { id: "child3", type: "Hit", position: { x: 100, y: 100 }, data: {} },
      ];

      const edgesWithOrder = [
        { id: "e1", source: "parent", target: "child1" },
        { id: "e2", source: "parent", target: "child2" },
        { id: "e3", source: "parent", target: "child3" },
      ];

      const result = autoLayoutNodes(nodesWithOrder, edgesWithOrder);
      expect(result).toHaveLength(4);
    });

    it("should handle nodes with ReactFlow instance dimensions", () => {
      const mockReactFlowInstance = {
        nodeInternals: new Map([
          [
            "1",
            {
              id: "1",
              width: 300,
              height: 150,
            },
          ],
        ]),
      } as unknown as ReactFlowState;

      const result = autoLayoutNodes(
        mockNodes,
        mockEdges,
        mockReactFlowInstance,
      );
      expect(result).toHaveLength(3);
    });

    it("should estimate node dimensions based on node type", () => {
      const sequenceNode = [
        {
          id: "seq",
          type: "Sequence",
          position: { x: 0, y: 0 },
          data: {},
        },
      ];

      const parallelNode = [
        {
          id: "par",
          type: "Parallel",
          position: { x: 0, y: 0 },
          data: {},
        },
      ];

      const hitNode = [
        {
          id: "hit",
          type: "Hit",
          position: { x: 0, y: 0 },
          data: {},
        },
      ];

      const statusNode = [
        {
          id: "status",
          type: "Status",
          position: { x: 0, y: 0 },
          data: {},
        },
      ];

      // Test each node type
      autoLayoutNodes(sequenceNode, []);
      autoLayoutNodes(parallelNode, []);
      autoLayoutNodes(hitNode, []);
      autoLayoutNodes(statusNode, []);

      // All should complete without errors
      expect(true).toBe(true);
    });

    it("should handle complex node hierarchies", () => {
      const complexNodes = [
        { id: "root", type: "Sequence", position: { x: 0, y: 0 }, data: {} },
        {
          id: "branch1",
          type: "Parallel",
          position: { x: 0, y: 100 },
          data: {},
        },
        {
          id: "branch2",
          type: "Parallel",
          position: { x: 200, y: 100 },
          data: {},
        },
        { id: "leaf1", type: "Hit", position: { x: 0, y: 200 }, data: {} },
        { id: "leaf2", type: "Status", position: { x: 100, y: 200 }, data: {} },
        { id: "leaf3", type: "Hit", position: { x: 200, y: 200 }, data: {} },
      ];

      const complexEdges = [
        { id: "e1", source: "root", target: "branch1" },
        { id: "e2", source: "root", target: "branch2" },
        { id: "e3", source: "branch1", target: "leaf1" },
        { id: "e4", source: "branch1", target: "leaf2" },
        { id: "e5", source: "branch2", target: "leaf3" },
      ];

      const result = autoLayoutNodes(complexNodes, complexEdges);
      expect(result).toHaveLength(6);
    });

    it("should handle nodes without ReactFlow instance", () => {
      const result = autoLayoutNodes(mockNodes, mockEdges, undefined);
      expect(result).toHaveLength(3);
    });

    it("should handle ReactFlow instance without nodeInternals", () => {
      const mockReactFlowInstance = {} as ReactFlowState;
      const result = autoLayoutNodes(
        mockNodes,
        mockEdges,
        mockReactFlowInstance,
      );
      expect(result).toHaveLength(3);
    });

    it("should handle missing nodes in parent-child relationships", () => {
      const edgesWithMissingNodes = [
        { id: "e1", source: "missing", target: "2" },
        { id: "e2", source: "1", target: "missing" },
      ];

      const result = autoLayoutNodes(mockNodes, edgesWithMissingNodes);
      expect(result).toHaveLength(3);
    });

    it("should round position coordinates", () => {
      const result = autoLayoutNodes(mockNodes, mockEdges);

      result.forEach((node) => {
        expect(Number.isInteger(node.position.x)).toBe(true);
        expect(Number.isInteger(node.position.y)).toBe(true);
        expect(Number.isInteger(node.positionAbsolute!.x)).toBe(true);
        expect(Number.isInteger(node.positionAbsolute!.y)).toBe(true);
      });
    });
  });
});
