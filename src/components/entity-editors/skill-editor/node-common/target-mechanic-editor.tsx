import { Select } from "antd";
import React from "react";
import { FullWidthSelect } from "@components/common/styled-components";
import {
  ALL_SKILL_EFFECT_TARGET_MECHANIC_TYPES,
  ALL_SKILL_EFFECT_TARGETS,
  SkillEffectTarget,
  SkillEffectTargetMechanic,
  SkillEffectTargetMechanicType,
} from "@models/skill.types";
import { mapTargetMechanicChange } from "@utils/mechanic";
import { NodeField, NodeInteractive, NodeTargetMechanicFields } from "./";

const { Option } = Select;

interface TargetMechanicEditorProps {
  target: SkillEffectTarget;
  targetMechanic: SkillEffectTargetMechanic;
  onTargetChange: (target: SkillEffectTarget) => void;
  onMechanicChange: (mechanic: SkillEffectTargetMechanic) => void;
}

export const TargetMechanicEditor: React.FC<TargetMechanicEditorProps> = ({
  target,
  targetMechanic,
  onTargetChange,
  onMechanicChange,
}) => {
  const handleTargetMechanicTypeChange = (
    value: SkillEffectTargetMechanicType,
  ) => {
    onMechanicChange(mapTargetMechanicChange(value));
  };

  return (
    <>
      <NodeField label="Target">
        <NodeInteractive>
          <FullWidthSelect
            value={target}
            onChange={(value: unknown) =>
              onTargetChange(value as SkillEffectTarget)
            }
            size="small"
          >
            {ALL_SKILL_EFFECT_TARGETS.map((type) => (
              <Option key={type} value={type}>
                {type}
              </Option>
            ))}
          </FullWidthSelect>
        </NodeInteractive>
      </NodeField>

      <NodeField label="Target Mechanic">
        <NodeInteractive>
          <FullWidthSelect
            value={targetMechanic?.type}
            onChange={(value: unknown) =>
              handleTargetMechanicTypeChange(
                value as SkillEffectTargetMechanicType,
              )
            }
            size="small"
          >
            {ALL_SKILL_EFFECT_TARGET_MECHANIC_TYPES.map((type) => (
              <Option key={type} value={type}>
                {type}
              </Option>
            ))}
          </FullWidthSelect>
        </NodeInteractive>
      </NodeField>

      <NodeTargetMechanicFields
        mechanic={targetMechanic}
        onUpdate={onMechanicChange}
      />
    </>
  );
};

// Add display name to the component
TargetMechanicEditor.displayName = "TargetMechanicEditor";
