import { NodeProps } from "reactflow";
import {
  createNodeComponent,
  NODE_COLORS,
  NodeRequirements,
} from "@components/node-common";
import {
  ALL_SKILL_ACTION_NODE_TYPES,
  SkillActionNodeType,
} from "@models/skill.types";
import { useSkillStore } from "@store/skill.store";
import { createNodeDataHandler } from "@utils/node-operations";

export const RequirementNode = createNodeComponent({
  nodeType: SkillActionNodeType.Requirement,
  backgroundColor: NODE_COLORS.LIGHT_CYAN_BG, // New color for requirement nodes
  borderColor: NODE_COLORS.CYAN_BORDER,
  renderContent: ({ id, data }: NodeProps) => {
    const { edges } = useSkillStore();
    const requirementsHandler = createNodeDataHandler(
      id,
      data.requirements,
      "requirements",
    );

    // Get child count from edges
    const childrenCount = edges.filter((edge) => edge.source === id).length;

    return (
      <>
        <NodeRequirements
          requirements={data.requirements}
          onChange={requirementsHandler.onChange}
        />

        {childrenCount === 0 && (
          <div
            style={{
              marginTop: 10,
              padding: 8,
              backgroundColor: "#fff2e8",
              borderRadius: 4,
            }}
          >
            <small>
              Add a child node to be executed when requirements are met
            </small>
          </div>
        )}

        {childrenCount === 1 && (
          <div
            style={{
              marginTop: 10,
              padding: 8,
              backgroundColor: "#f6ffed",
              borderRadius: 4,
              border: "1px solid #b7eb8f",
            }}
          >
            <small>
              ✓ Requirement node has its single child (maximum allowed)
            </small>
          </div>
        )}

        {childrenCount > 1 && (
          <div
            style={{
              marginTop: 10,
              padding: 8,
              backgroundColor: "#fff1f0",
              borderRadius: 4,
              border: "1px solid #ffccc7",
            }}
          >
            <small>
              ⚠️ Warning: Requirement nodes should only have one child (
              {childrenCount} detected)
            </small>
          </div>
        )}
      </>
    );
  },
  getMenuItems: ({ id }) => {
    // Access store directly for menu items
    const addNode = useSkillStore.getState().addNode;

    return ALL_SKILL_ACTION_NODE_TYPES.filter(
      (nodeType) => nodeType !== SkillActionNodeType.Requirement,
    ) // Prevent nesting requirement nodes
      .map((key) => ({
        key,
        label: `Add ${key}`,
        onClick: () => addNode(key, id),
      }));
  },
});
