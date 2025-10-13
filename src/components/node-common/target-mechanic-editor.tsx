import { Select } from "antd";
import React from "react";
import { FullWidthSelect } from "@components/common/styled-components";
import {
  ALL_EFFECT_TARGET_MECHANIC_TYPES,
  ALL_EFFECT_TARGETS,
  EffectTarget,
  EffectTargetMechanic,
  EffectTargetMechanicType,
} from "@models/effect.types";
import { mapTargetMechanicChange } from "@utils/mechanic";
import { NodeField, NodeInteractive, NodeTargetMechanicFields } from "./";

const { Option } = Select;

interface TargetMechanicEditorProps {
  target: EffectTarget;
  targetMechanic: EffectTargetMechanic;
  onTargetChange: (target: EffectTarget) => void;
  onMechanicChange: (mechanic: EffectTargetMechanic) => void;
}

export const TargetMechanicEditor: React.FC<TargetMechanicEditorProps> = ({
  target,
  targetMechanic,
  onTargetChange,
  onMechanicChange,
}) => {
  const handleTargetMechanicTypeChange = (
    value: EffectTargetMechanicType,
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
              onTargetChange(value as EffectTarget)
            }
            size="small"
          >
            {ALL_EFFECT_TARGETS.map((type) => (
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
                value as EffectTargetMechanicType,
              )
            }
            size="small"
          >
            {ALL_EFFECT_TARGET_MECHANIC_TYPES.map((type) => (
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
