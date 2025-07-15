import { Checkbox, CheckboxChangeEvent } from "antd";
import { NodeProps } from "reactflow";
import { FullWidthInputNumber } from "@components/common/styled-components";
import {
  createNodeComponent,
  NODE_COLORS,
  NodeField,
  NodeEntityReferences,
  NodeInteractive,
} from "@components/node-common";
import { EntityType } from "@models/common.types";
import { SkillActionNodeType } from "@models/skill.types";
import {
  createNodeDataHandler,
  useNodeOperations,
} from "@utils/node-operations";

export const AnimationNode = createNodeComponent({
  nodeType: SkillActionNodeType.Animation,
  backgroundColor: NODE_COLORS.LIGHT_PURPLE_BG,
  borderColor: NODE_COLORS.PURPLE_BORDER,
  renderContent: ({ id, data }: NodeProps) => {
    const { updateNodeData } = useNodeOperations(id);
    const animationsHandler = createNodeDataHandler(
      id,
      data.animations || [],
      "animations",
    );

    const handleDurationChange = (value: number | null) => {
      updateNodeData({ duration: value || 0 });
    };

    const handleShowProgressChange = (e: CheckboxChangeEvent) => {
      updateNodeData({ show_progress: e.target.checked });
    };

    return (
      <>
        <NodeField label="Highlight">
          <NodeInteractive>
            <Checkbox
              checked={data.show_progress}
              onChange={handleShowProgressChange}
            >
              Show Progress
            </Checkbox>
          </NodeInteractive>
        </NodeField>

        <NodeField label="Duration (seconds)">
          <NodeInteractive>
            <FullWidthInputNumber
              min={0}
              step={0.1}
              value={data.duration}
              onChange={(value: number | string | null) =>
                handleDurationChange(value as number | null)
              }
              size="small"
            />
          </NodeInteractive>
        </NodeField>

        <NodeEntityReferences
          entityType={EntityType.AnimationSource}
          title="Animations"
          values={animationsHandler.data}
          onChange={animationsHandler.onChange}
        />
      </>
    );
  },
});
