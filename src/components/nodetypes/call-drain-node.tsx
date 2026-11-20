import { Typography } from "antd";
import {
  createNodeComponent,
  NODE_COLORS,
  NodeField,
} from "@components/node-common";
import { SkillActionNodeType } from "@models/skill.types";

const { Text } = Typography;

export const CallDrainNode = createNodeComponent({
  nodeType: SkillActionNodeType.CallDrain,
  backgroundColor: NODE_COLORS.PALE_ORANGE_BG,
  borderColor: NODE_COLORS.ORANGE_BORDER,
  renderContent: () => (
    <NodeField label="Calls">
      <Text type="secondary">
        The nearest drain with batches left pours a batch now.
      </Text>
    </NodeField>
  ),
});
