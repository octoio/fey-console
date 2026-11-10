import { Checkbox, Select } from "antd";
import { NodeProps } from "reactflow";
import {
  createNodeComponent,
  NODE_COLORS,
  NodeField,
  NodeInteractive,
  StatusEffectEditor,
} from "@components/node-common";
import { EntityType } from "@models/common.types";
import {
  ALL_EFFECT_TARGETS,
  EffectTarget,
  EffectTargetMechanicType,
  StatusEffect,
} from "@models/effect.types";
import { SkillActionNodeType } from "@models/skill.types";
import {
  createNodeDataHandler,
  useNodeOperations,
} from "@utils/node-operations";

// The target mechanic of an Interrupt node is always Selected: it stands for the interrupted character
const defaultOnInterrupt = (): StatusEffect => ({
  target_mechanic: { type: EffectTargetMechanicType.Selected },
  target: EffectTarget.Enemy,
  durations: [],
  scalers: [],
  status: {
    id: "",
    owner: "Octoio",
    type: EntityType.Status,
    key: "",
    version: 1,
  },
});

export const InterruptNode = createNodeComponent({
  nodeType: SkillActionNodeType.Interrupt,
  backgroundColor: NODE_COLORS.LIGHT_RED_BG,
  borderColor: NODE_COLORS.RED_BORDER,
  renderContent: ({ id, data }: NodeProps) => {
    const { updateNodeData } = useNodeOperations(id);
    const onInterruptHandler = createNodeDataHandler(
      id,
      data.on_interrupt as StatusEffect,
      "on_interrupt",
    );

    return (
      <>
        <NodeField label="Target">
          <NodeInteractive>
            <Select
              size="small"
              value={data.target ?? EffectTarget.Enemy}
              onChange={(target) => updateNodeData({ target })}
              style={{ width: "100%" }}
              options={ALL_EFFECT_TARGETS.map((t) => ({ label: t, value: t }))}
            />
          </NodeInteractive>
        </NodeField>
        <NodeField label="Status on interrupt">
          <NodeInteractive>
            <Checkbox
              checked={data.on_interrupt !== undefined}
              onChange={(e) =>
                updateNodeData({
                  on_interrupt: e.target.checked
                    ? defaultOnInterrupt()
                    : undefined,
                })
              }
            />
          </NodeInteractive>
        </NodeField>
        {data.on_interrupt !== undefined && (
          <StatusEffectEditor
            statusEffect={onInterruptHandler.data}
            onChange={onInterruptHandler.onChange}
          />
        )}
      </>
    );
  },
});
