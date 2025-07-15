import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
} from "reactflow";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  getDefaultEntityReferences,
  EntityReference,
  EntityReferences,
  EntityType,
  HitType,
} from "@models/common.types";
import { QualityType } from "@models/quality.types";
import { RequirementOperator } from "@models/requirement.types";
import {
  Skill,
  SkillActionNode,
  SkillActionNodeType,
  SkillCategory,
  SkillEffectTarget,
  SkillEffectTargetMechanicType,
  SkillEntityDefinition,
  SkillIndicator,
  SkillTargetType,
} from "@models/skill.types";

interface SkillEditorState {
  // Skill data
  skillData: SkillEntityDefinition | null;
  setSkillData: (data: SkillEntityDefinition) => void;

  // React Flow state
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  // Update specific parts of skill data
  updateMetadata: (title: string, description: string) => void;
  updateBasicInfo: (
    quality: QualityType,
    categories: SkillCategory[],
    cooldown: number,
    targetType: SkillTargetType,
  ) => void;
  updateCost: (mana: number) => void;
  updateCastDistance: (min: number, max: number) => void;

  // Node management
  addNode: (nodeType: SkillActionNodeType, parentId: string | null) => void;
  updateNode: (nodeId: string, data: Partial<SkillActionNode>) => void;
  removeNode: (nodeId: string) => void;

  // Export/Import
  exportToJson: () => string;
  importFromJson: (json: string) => void;

  // Convert between skill data and react flow representation
  skillToNodes: () => void;
  nodesToSkill: () => void;

  // Update the reorderNode function signature
  reorderNode: (nodeId: string, direction: "left" | "right") => void;

  // Entity references
  entityReferences: EntityReferences;
  setEntityReferences: (references: EntityReferences) => void;

  // Helper to get entity references by type
  getEntityReferencesByType: (type: EntityType) => EntityReference[];

  // Add this missing method
  setNodes: (updatedNodes: Node[]) => void;

  setIconReference: (iconReference: EntityReference) => void;
  setIndicators: (indicators: SkillIndicator[]) => void;

  updateEntityDefinition: (definition: SkillEntityDefinition) => void;

  // Helper function to update skill entity while preserving root properties
  updateSkillEntity: (updateEntityFn: (entity: Skill) => Skill) => void;
}

// Initialize with default empty skill
const defaultSkill: SkillEntityDefinition = {
  id: "",
  owner: "Octoio",
  type: EntityType.Skill,
  key: "",
  version: 1,
  entity: {
    metadata: {
      title: "",
      description: "",
    },
    quality: QualityType.None,
    categories: [],
    cost: {
      mana: 0,
    },
    cooldown: 0,
    target_type: SkillTargetType.None,
    execution_root: {
      type: SkillActionNodeType.Parallel,
      name: "Root",
      children: [],
      loop: 1,
    } as SkillActionNode,
    icon_reference: {
      id: "Octoio:Image:DefaultIcon:1",
      type: EntityType.Image,
      owner: "Octoio",
      key: "DefaultIcon",
      version: 1,
    },
    indicators: [],
    cast_distance: {
      min: 1,
      max: 1,
    },
  },
};

// Helper to create a unique ID for React Flow nodes
const generateId = () => `node_${Math.random().toString(36).substr(2, 9)}`;

// Convert skill execution tree to React Flow nodes and edges
const convertExecutionTreeToFlow = (
  executionTree: SkillActionNode,
): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const processNode = (
    node: SkillActionNode,
    parentId: string | null = null,
    position = { x: 0, y: 0 },
  ): string => {
    const id = generateId();

    // Create the React Flow node
    nodes.push({
      id,
      type: node.type, // Use the node type as React Flow node type
      position,
      data: { ...node },
    });

    // Connect to parent if it exists
    if (parentId) {
      edges.push({
        id: `e${parentId}-${id}`,
        source: parentId,
        target: id,
      });
    }

    // Process children for container nodes
    if ("children" in node && Array.isArray(node.children)) {
      const childNodes = node.children as SkillActionNode[];
      childNodes.forEach((child, index) => {
        // Position children in a grid or list
        const childPos = {
          x: position.x + index * 500,
          y: position.y + 800,
        };
        processNode(child, id, childPos);
      });
    }

    // Process single child for requirement nodes
    if (
      node.type === SkillActionNodeType.Requirement &&
      "child" in node &&
      node.child
    ) {
      const childPos = {
        x: position.x,
        y: position.y + 200,
      };
      processNode(node.child as SkillActionNode, id, childPos);
    }

    return id;
  };

  processNode(executionTree);
  return { nodes, edges };
};

// Convert React Flow nodes and edges back to skill execution tree
const convertFlowToExecutionTree = (
  nodes: Node[],
  edges: Edge[],
): SkillActionNode | null => {
  if (!nodes.length) return null;

  // Find root node (node with no incoming edges)
  const edgeTargets = edges.map((e) => e.target);
  const rootNode = nodes.find((node) => !edgeTargets.includes(node.id));

  if (!rootNode) return null;

  const buildTree = (nodeId: string): SkillActionNode => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);

    // Prepare node data without React Flow specific properties
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, position, ...nodeData } = node;
    const treeNode = nodeData.data as SkillActionNode;

    // For container nodes, find and process children
    if (
      treeNode.type === SkillActionNodeType.Sequence ||
      treeNode.type === SkillActionNodeType.Parallel
    ) {
      const childEdges = edges.filter((e) => e.source === nodeId);
      const childNodeIds = childEdges.map((e) => e.target);

      // Sort children by their x position
      const childrenWithPositions = childNodeIds
        .map((childId) => {
          const childNode = nodes.find((n) => n.id === childId);
          return {
            id: childId,
            x: childNode?.position.x || 0,
          };
        })
        .sort((a, b) => a.x - b.x);

      const children = childrenWithPositions.map((child) =>
        buildTree(child.id),
      );

      return {
        ...treeNode,
        children,
      } as SkillActionNode;
    }

    // Handle Requirement nodes with single child
    if (treeNode.type === SkillActionNodeType.Requirement) {
      const childEdges = edges.filter((e) => e.source === nodeId);

      if (childEdges.length > 0) {
        // Requirement nodes should have only one child
        const childId = childEdges[0].target;
        const child = buildTree(childId);

        return {
          ...treeNode,
          child,
        } as SkillActionNode;
      }
    }

    return treeNode;
  };

  return buildTree(rootNode.id);
};

export const useSkillStore = create<SkillEditorState>()(
  devtools(
    (set, get) => ({
      skillData: defaultSkill,
      nodes: [],
      edges: [],

      updateSkillEntity: (updateEntityFn: (entity: Skill) => Skill) => {
        const skillData = get().skillData;
        if (!skillData) return;

        set(
          {
            skillData: {
              ...skillData,
              entity: updateEntityFn(skillData.entity),
            },
          },
          false,
          "updateSkillEntity",
        );
      },

      setSkillData: (data) => {
        set({ skillData: data }, false, "setSkillData");
        get().skillToNodes();
      },

      onNodesChange: (changes) => {
        set(
          {
            nodes: applyNodeChanges(changes, get().nodes),
          },
          false,
          "onNodesChange",
        );
      },

      onEdgesChange: (changes) => {
        set(
          {
            edges: applyEdgeChanges(changes, get().edges),
          },
          false,
          "onEdgesChange",
        );
      },

      onConnect: (connection) => {
        const { nodes, edges } = get();

        // Check if the source node is a Requirement node
        const sourceNode = nodes.find((n) => n.id === connection.source);
        if (sourceNode && sourceNode.type === SkillActionNodeType.Requirement) {
          // Check if the requirement node already has a child
          const existingChildren = edges.filter(
            (e) => e.source === connection.source,
          );
          if (existingChildren.length > 0) {
            // Requirement nodes can only have one child - reject the connection
            console.warn(
              "Requirement nodes can only have one child connection",
            );
            return;
          }
        }

        set(
          {
            edges: addEdge(connection, get().edges),
          },
          false,
          "onConnect",
        );
      },

      updateMetadata: (title, description) => {
        get().updateSkillEntity((entity) => ({
          ...entity,
          metadata: { title, description },
        }));
      },

      updateBasicInfo: (quality, categories, cooldown, targetType) => {
        get().updateSkillEntity((entity) => ({
          ...entity,
          quality,
          categories,
          cooldown,
          target_type: targetType,
        }));
      },

      updateCost: (mana) => {
        get().updateSkillEntity((entity) => ({
          ...entity,
          cost: { mana },
        }));
      },

      updateCastDistance: (min, max) => {
        get().updateSkillEntity((entity) => ({
          ...entity,
          cast_distance: { min, max },
        }));
      },

      addNode: (nodeType, parentId) => {
        // Create a new node of the specified type
        const newNodeId = generateId();

        // Calculate position based on parent and its existing children
        let position = { x: 100, y: 100 };

        if (parentId) {
          const parentNode = get().nodes.find((node) => node.id === parentId);
          if (parentNode) {
            // Find all children of this parent
            const childEdges = get().edges.filter(
              (edge) => edge.source === parentId,
            );
            const childNodes = childEdges
              .map((edge) =>
                get().nodes.find((node) => node.id === edge.target),
              )
              .filter(Boolean) as Node[];

            if (childNodes.length > 0) {
              // Find the rightmost child
              const rightmostChild = childNodes.reduce(
                (rightmost, current) =>
                  current.position.x > rightmost.position.x
                    ? current
                    : rightmost,
                childNodes[0],
              );

              // Position new node below and to the right of the rightmost child
              position = {
                x: rightmostChild.position.x + 250,
                y: rightmostChild.position.y + 100,
              };
            } else {
              // If no children, position below parent
              position = {
                x: parentNode.position.x + 150,
                y: parentNode.position.y + 200,
              };
            }
          }
        }

        const newNode: Node = {
          id: newNodeId,
          type: nodeType,
          position: position,
          data: {
            type: nodeType,
            name: `New ${nodeType}`,
          },
        };

        // Add specific properties based on node type
        switch (nodeType) {
          case SkillActionNodeType.Sequence:
          case SkillActionNodeType.Parallel:
            newNode.data.children = [];
            newNode.data.loop = 1;
            break;
          case SkillActionNodeType.Delay:
            newNode.data.delay = 1.0;
            break;
          case SkillActionNodeType.Animation:
            newNode.data.duration = 1.0;
            newNode.data.animations = [];
            break;
          case SkillActionNodeType.Sound:
            newNode.data.sound = {
              id: "",
              owner: "Octoio",
              type: EntityType.Sound,
              key: "",
              version: 1,
            };
            break;
          case SkillActionNodeType.Hit:
            newNode.data.hit_effect = {
              hit_type: HitType.Damage,
              scalers: [],
              target_mechanic: {
                type: SkillEffectTargetMechanicType.Self,
              },
              target: SkillEffectTarget.Enemy,
              hit_sound: {
                id: "",
                owner: "Octoio",
                type: EntityType.Sound,
                key: "",
                version: 1,
              },
              can_crit: true,
              can_miss: true,
            };
            break;
          case SkillActionNodeType.Status:
            newNode.data.status_effect = {
              target_mechanic: {
                type: SkillEffectTargetMechanicType.Self,
              },
              target: SkillEffectTarget.Ally,
              durations: [],
              scalers: [],
              status: {
                id: "",
                owner: "Octoio",
                type: EntityType.Status,
                key: "",
                version: 1,
              },
            };
            break;
          case SkillActionNodeType.Summon:
            newNode.data.summon_entity = {
              id: "",
              owner: "Octoio",
              type: EntityType.Character,
              key: "",
              version: 1,
            };
            newNode.data.position_offset = { x: 0, y: 0, z: 0 };
            break;
          case SkillActionNodeType.Requirement:
            newNode.data.requirements = {
              operator: RequirementOperator.All,
              requirements: [],
            };
            break;
        }

        // Add the node
        set({
          nodes: [...get().nodes, newNode],
        });

        // If parent is specified, connect the new node to it
        if (parentId) {
          // Add edge
          set({
            edges: [
              ...get().edges,
              {
                id: `e${parentId}-${newNodeId}`,
                source: parentId,
                target: newNodeId,
              },
            ],
          });

          // Update parent's children array (only for container nodes)
          const parentNode = get().nodes.find((n) => n.id === parentId);
          if (
            parentNode &&
            (parentNode.type === SkillActionNodeType.Sequence ||
              parentNode.type === SkillActionNodeType.Parallel)
          ) {
            set({
              nodes: get().nodes.map((node) => {
                if (node.id === parentId) {
                  // Make sure children array exists
                  const children = node.data.children || [];
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      children: [...children, newNode.data],
                    },
                  };
                }
                return node;
              }),
            });
          }
        }
      },

      updateNode: (nodeId, data) => {
        set({
          nodes: get().nodes.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...node.data, ...data } }
              : node,
          ),
        });
      },

      removeNode: (nodeId) => {
        // Remove the node and all its connected edges
        set({
          nodes: get().nodes.filter((node) => node.id !== nodeId),
          edges: get().edges.filter(
            (edge) => edge.source !== nodeId && edge.target !== nodeId,
          ),
        });
      },

      exportToJson: () => {
        // Update skill data from nodes first
        get().nodesToSkill();
        return JSON.stringify(get().skillData, null, 2);
      },

      importFromJson: (json) => {
        try {
          const data = JSON.parse(json) as SkillEntityDefinition;
          set({ skillData: data });
          get().skillToNodes();
        } catch (e) {
          console.error("Failed to parse JSON:", e);
        }
      },

      skillToNodes: () => {
        const skillData = get().skillData;
        if (!skillData || !skillData.entity.execution_root) return;

        const { nodes, edges } = convertExecutionTreeToFlow(
          skillData.entity.execution_root,
        );
        set({ nodes, edges });
      },

      nodesToSkill: () => {
        const skillData = get().skillData;
        if (!skillData) return;

        const executionTree = convertFlowToExecutionTree(
          get().nodes,
          get().edges,
        );
        if (executionTree) {
          get().updateSkillEntity((entity) => ({
            ...entity,
            execution_root: executionTree,
          }));
        }
      },

      reorderNode: (nodeId, direction) => {
        const { nodes, edges } = get();

        // Find the node and its parent
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) return;

        const parentEdge = edges.find((e) => e.target === nodeId);
        if (!parentEdge) return;

        const parentId = parentEdge.source;

        // Get all edges from this parent
        const siblingEdges = edges.filter((e) => e.source === parentId);

        // Sort them by node position to get current order
        const sortedEdges = [...siblingEdges].sort((a, b) => {
          const nodeA = nodes.find((n) => n.id === a.target);
          const nodeB = nodes.find((n) => n.id === b.target);
          if (!nodeA || !nodeB) return 0;
          return nodeA.position.x - nodeB.position.x;
        });

        // Find the current index
        const currentIndex = sortedEdges.findIndex((e) => e.target === nodeId);
        if (currentIndex === -1) return;

        // Determine the swap index
        const swapIndex =
          direction === "left" ? currentIndex - 1 : currentIndex + 1;
        if (swapIndex < 0 || swapIndex >= sortedEdges.length) return;

        // Get the node to swap with
        const swapNodeId = sortedEdges[swapIndex].target;
        const swapNode = nodes.find((n) => n.id === swapNodeId);
        if (!node || !swapNode) return;

        // Swap the x positions of the nodes
        const nodePosition = { ...node.position };
        const swapPosition = { ...swapNode.position };

        // Update nodes with swapped positions
        set({
          nodes: nodes.map((n) => {
            if (n.id === nodeId)
              return { ...n, position: { ...n.position, x: swapPosition.x } };

            if (n.id === swapNodeId)
              return { ...n, position: { ...n.position, x: nodePosition.x } };

            return n;
          }),
        });
      },

      entityReferences: getDefaultEntityReferences(),

      setEntityReferences: (references) => {
        set({ entityReferences: references });
      },

      getEntityReferencesByType: (type) => {
        return get().entityReferences[type];
      },

      setNodes: (updatedNodes) => set({ nodes: updatedNodes }),

      setIconReference: (iconReference) => {
        get().updateSkillEntity((entity) => ({
          ...entity,
          icon_reference: iconReference,
        }));
      },

      setIndicators: (indicators) => {
        get().updateSkillEntity((entity) => ({
          ...entity,
          indicators,
        }));
      },

      updateEntityDefinition: (definition: SkillEntityDefinition) => {
        set(
          {
            skillData: definition,
          },
          false,
          "updateEntityDefinition",
        );
      },
    }),
    {
      name: "skill-store",
      enabled: process.env.NODE_ENV === "development",
    },
  ),
);
