import { InputNumber, Typography } from "antd";
import { NodeProps } from "reactflow";
import {
  createNodeComponent,
  NODE_COLORS,
  NodeField,
  OrderedNodesList,
} from "@components/node-common";
import {
  ALL_SKILL_ACTION_NODE_TYPES,
  SkillActionNodeType,
} from "@models/skill.types";
import { useSkillStore } from "@store/skill.store";
import { useNodeOperations } from "@utils/node-operations";

const { Text } = Typography;

export const SequenceNode = createNodeComponent({
  nodeType: SkillActionNodeType.Sequence,
  backgroundColor: NODE_COLORS.PALE_BLUE_BG,
  borderColor: NODE_COLORS.GRAY_BLUE_BORDER,
  renderContent: ({ id, data }: NodeProps) => {
    const { edges, nodes, reorderNode } = useSkillStore();
    const { updateNodeData } = useNodeOperations(id);

    // Get child count from edges (more reliable than data.children)
    const childrenCount = edges.filter((edge) => edge.source === id).length;

    const handleLoopChange = (value: number | null) => {
      updateNodeData({ loop: value || 1 });
    };

    const handleReorderNode = (nodeId: string, direction: "left" | "right") => {
      reorderNode(nodeId, direction);
    };

    return (
      <>
        <NodeField label="Loop">
          <InputNumber
            min={1}
            size="small"
            style={{ width: "100%" }}
            value={data.loop}
            onChange={handleLoopChange}
          />
        </NodeField>

        {childrenCount > 0 ? (
          <OrderedNodesList
            parentId={id}
            nodes={nodes}
            edges={edges}
            onReorder={handleReorderNode}
          />
        ) : (
          <Text type="secondary" style={{ display: "block", fontSize: 12 }}>
            No children
          </Text>
        )}
      </>
    );
  },
  getMenuItems: ({ id }) => {
    // Access store directly for menu items
    const addNode = useSkillStore.getState().addNode;

    return ALL_SKILL_ACTION_NODE_TYPES.map((key) => ({
      key,
      label: `Add ${key}`,
      onClick: () => addNode(key, id),
    }));
  },
});
