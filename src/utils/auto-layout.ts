import dagre from "dagre";
import { Node, Edge, ReactFlowState } from "reactflow";

/**
 * Enhanced auto-layout function that preserves the order of child nodes
 * and uses actual node dimensions from ReactFlow.
 */
export function autoLayoutNodes(
  nodes: Node[],
  edges: Edge[],
  reactFlowInstance?: ReactFlowState,
): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));

  g.setGraph({
    rankdir: "TB", // Direction: Top to Bottom
    align: "UL",
    ranksep: 200, // Reduced vertical spacing
    nodesep: 320, // Reduced horizontal spacing
    ranker: "network-simplex", // Use network simplex algorithm to preserve ordering
  });

  // Create a map of parent nodes to their children (ordered by X position)
  const parentToChildren: Record<string, string[]> = {};

  edges.forEach((edge) => {
    if (!parentToChildren[edge.source]) parentToChildren[edge.source] = [];

    parentToChildren[edge.source].push(edge.target);
  });

  // Sort children by current X position to preserve order
  Object.keys(parentToChildren).forEach((parentId) => {
    parentToChildren[parentId].sort((a, b) => {
      const nodeA = nodes.find((n) => n.id === a);
      const nodeB = nodes.find((n) => n.id === b);
      if (!nodeA || !nodeB) return 0;
      return nodeA.position.x - nodeB.position.x;
    });
  });

  // Add nodes to graph with more accurate dimensions
  nodes.forEach((node) => {
    // Get the node dimensions from the DOM if ReactFlow instance is available
    // Otherwise use a reasonable default based on node type
    let width = 200;
    let height = 100;

    // If we have access to the ReactFlow internals, get actual node dimensions
    if (reactFlowInstance && reactFlowInstance.nodeInternals) {
      const nodeInternal = reactFlowInstance.nodeInternals.get(node.id);
      if (nodeInternal && nodeInternal.width && nodeInternal.height) {
        width = nodeInternal.width;
        height = nodeInternal.height;
      }
    } else {
      // Estimate sizes based on node types
      if (node.type === "Sequence" || node.type === "Parallel") {
        width = 280;
        height = 150;
      } else if (node.type === "Hit" || node.type === "Status") {
        width = 320;
        height = 250;
      }
    }

    g.setNode(node.id, { width, height });
  });

  // Add edges but ensure child order is preserved
  Object.keys(parentToChildren).forEach((parentId) => {
    // Use indexed edges to maintain order (rank constraints)
    parentToChildren[parentId].forEach((childId, idx) => {
      g.setEdge(parentId, childId, { weight: idx + 1 });
    });
  });

  dagre.layout(g);

  // Update node positions while maintaining relative ordering
  return nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);

    // Set position from the layout
    return {
      ...node,
      position: {
        x: Math.round(nodeWithPosition.x - nodeWithPosition.width / 2),
        y: Math.round(nodeWithPosition.y - nodeWithPosition.height / 2),
      },
      // Absolute position to prevent ReactFlow from adjusting
      positionAbsolute: {
        x: Math.round(nodeWithPosition.x - nodeWithPosition.width / 2),
        y: Math.round(nodeWithPosition.y - nodeWithPosition.height / 2),
      },
      dragging: false,
    };
  });
}
