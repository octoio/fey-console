import { InputNumber, Typography } from "antd";
import { NodeProps } from "reactflow";
import {
  createNodeComponent,
  NODE_COLORS,
  NodeField,
} from "@components/node-common";
import {
  ALL_SKILL_ACTION_NODE_TYPES,
  SkillActionNodeType,
} from "@models/skill.types";
import { useSkillStore } from "@store/skill.store";
import { useNodeOperations } from "@utils/node-operations";

const { Text } = Typography;

export const ParallelNode = createNodeComponent({
  nodeType: SkillActionNodeType.Parallel,
  backgroundColor: NODE_COLORS.LIGHT_GREEN_BG,
  borderColor: NODE_COLORS.GREEN_BORDER,
  renderContent: ({ id, data }: NodeProps) => {
    const { edges } = useSkillStore();
    const { updateNodeData } = useNodeOperations(id);

    // Get child count from edges (more reliable than data.children)
    const childrenCount = edges.filter((edge) => edge.source === id).length;

    const handleLoopChange = (value: number | null) => {
      updateNodeData({ loop: value || 1 });
    };

    return (
      <>
        <NodeField label="Loop Count">
          <InputNumber
            min={1}
            value={data.loop}
            onChange={handleLoopChange}
            style={{ width: "100%" }}
            size="small"
          />
        </NodeField>

        <Text type="secondary">
          {childrenCount > 0 ? `Children: ${childrenCount}` : "No children"}
        </Text>
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
