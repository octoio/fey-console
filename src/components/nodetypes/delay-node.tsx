import { NodeProps } from "reactflow";
import { FullWidthInputNumber } from "@components/common/styled-components";
import {
  createNodeComponent,
  NODE_COLORS,
  NodeField,
} from "@components/node-common";
import { SkillActionNodeType } from "@models/skill.types";
import { useNodeOperations } from "@utils/node-operations";

export const DelayNode = createNodeComponent({
  nodeType: SkillActionNodeType.Delay, // Was mistakenly Animation before
  backgroundColor: NODE_COLORS.LIGHT_PINK_BG,
  borderColor: NODE_COLORS.PINK_BORDER,
  renderContent: ({ id, data }: NodeProps) => {
    const { updateNodeData } = useNodeOperations(id);

    const handleDelayChange = (value: number | null) => {
      updateNodeData({ delay: value || 0 });
    };

    return (
      <NodeField label="Delay (seconds)">
        <FullWidthInputNumber
          min={0}
          step={0.1}
          value={data.delay}
          onChange={(value: number | string | null) =>
            handleDelayChange(value as number | null)
          }
          size="small"
        />
      </NodeField>
    );
  },
});
