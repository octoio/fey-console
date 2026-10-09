import { InputNumber, Select } from "antd";
import { NodeProps } from "reactflow";
import {
  createNodeComponent,
  NODE_COLORS,
  NodeField,
  NodeInteractive,
} from "@components/node-common";
import {
  ALL_SKILL_MOVE_MODES,
  SkillActionNodeType,
  SkillMoveMode,
} from "@models/skill.types";
import { useNodeOperations } from "@utils/node-operations";

export const MoveNode = createNodeComponent({
  nodeType: SkillActionNodeType.Move,
  backgroundColor: NODE_COLORS.PALE_ORANGE_BG,
  borderColor: NODE_COLORS.ORANGE_BORDER,
  renderContent: ({ id, data }: NodeProps) => {
    const { updateNodeData } = useNodeOperations(id);
    const mode: SkillMoveMode = data.mode || SkillMoveMode.Dash;

    return (
      <>
        <NodeField label="Mode">
          <NodeInteractive>
            <Select
              size="small"
              value={mode}
              onChange={(value) => updateNodeData({ mode: value })}
              style={{ width: "100%" }}
              options={ALL_SKILL_MOVE_MODES.map((m) => ({ label: m, value: m }))}
            />
          </NodeInteractive>
        </NodeField>
        <NodeField label="Distance / range (units)">
          <NodeInteractive>
            <InputNumber
              size="small"
              min={0}
              step={0.5}
              value={data.distance ?? 0}
              onChange={(value) => updateNodeData({ distance: value || 0 })}
              style={{ width: "100%" }}
            />
          </NodeInteractive>
        </NodeField>
        <NodeField label="Duration (seconds, dash only)">
          <NodeInteractive>
            <InputNumber
              size="small"
              min={0}
              step={0.05}
              value={data.duration ?? 0}
              onChange={(value) => updateNodeData({ duration: value || 0 })}
              style={{ width: "100%" }}
            />
          </NodeInteractive>
        </NodeField>
      </>
    );
  },
});
