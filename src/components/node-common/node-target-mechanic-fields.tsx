import { Select } from "antd";
import React from "react";
import {
  FullWidthSelect,
  FullWidthInputNumber,
} from "@components/common/styled-components";
import {
  ALL_CHARACTER_TEAMS,
  EffectTargetMechanic,
  EffectTargetMechanicCircle,
  EffectTargetMechanicCone,
  EffectTargetMechanicRectangle,
  EffectTargetMechanicTeam,
  EffectTargetMechanicType,
} from "@models/effect.types";
import { NodeField } from "./node-field";
import { NodeInteractive } from "./node-interactive";

const { Option } = Select;

interface NodeTargetMechanicFieldsProps {
  mechanic: EffectTargetMechanic;
  onUpdate: (updatedMechanic: EffectTargetMechanic) => void;
}

export const NodeTargetMechanicFields: React.FC<
  NodeTargetMechanicFieldsProps
> = ({ mechanic, onUpdate }) => {
  if (!mechanic) return null;

  switch (mechanic.type) {
    case EffectTargetMechanicType.Team:
      return (
        <NodeField label="Team">
          <NodeInteractive>
            <FullWidthSelect
              value={(mechanic as EffectTargetMechanicTeam).team}
              onChange={(value) => {
                const updatedMechanic = { ...mechanic, team: value };
                onUpdate(updatedMechanic);
              }}
              size="small"
            >
              {ALL_CHARACTER_TEAMS.map((team) => (
                <Option key={team} value={team}>
                  {team}
                </Option>
              ))}
            </FullWidthSelect>
          </NodeInteractive>
        </NodeField>
      );

    case EffectTargetMechanicType.Circle:
      return (
        <>
          <NodeField label="Hit Count">
            <NodeInteractive>
              <FullWidthInputNumber
                min={1}
                value={(mechanic as EffectTargetMechanicCircle).hit_count}
                onChange={(value) => {
                  const updatedMechanic = {
                    ...mechanic,
                    hit_count: value || 1,
                  };
                  onUpdate(updatedMechanic);
                }}
                size="small"
              />
            </NodeInteractive>
          </NodeField>
          <NodeField label="Radius">
            <NodeInteractive>
              <FullWidthInputNumber
                min={0}
                step={0.5}
                value={(mechanic as EffectTargetMechanicCircle).radius}
                onChange={(value) => {
                  const updatedMechanic = { ...mechanic, radius: value || 0 };
                  onUpdate(updatedMechanic);
                }}
                size="small"
              />
            </NodeInteractive>
          </NodeField>
        </>
      );

    case EffectTargetMechanicType.Rectangle:
      return (
        <>
          <NodeField label="Hit Count">
            <NodeInteractive>
              <FullWidthInputNumber
                min={1}
                value={(mechanic as EffectTargetMechanicRectangle).hit_count}
                onChange={(value) => {
                  const updatedMechanic = {
                    ...mechanic,
                    hit_count: value || 1,
                  };
                  onUpdate(updatedMechanic);
                }}
                size="small"
              />
            </NodeInteractive>
          </NodeField>
          <NodeField label="Width">
            <NodeInteractive>
              <FullWidthInputNumber
                min={0}
                step={0.5}
                value={(mechanic as EffectTargetMechanicRectangle).width}
                onChange={(value) => {
                  const updatedMechanic = { ...mechanic, width: value || 0 };
                  onUpdate(updatedMechanic);
                }}
                size="small"
              />
            </NodeInteractive>
          </NodeField>
          <NodeField label="Height">
            <NodeInteractive>
              <FullWidthInputNumber
                min={0}
                step={0.5}
                value={(mechanic as EffectTargetMechanicRectangle).height}
                onChange={(value) => {
                  const updatedMechanic = { ...mechanic, height: value || 0 };
                  onUpdate(updatedMechanic);
                }}
                size="small"
              />
            </NodeInteractive>
          </NodeField>
        </>
      );

    case EffectTargetMechanicType.Cone: {
      const cone = mechanic as EffectTargetMechanicCone;
      const update = (patch: Partial<EffectTargetMechanicCone>) =>
        onUpdate({ ...cone, ...patch });
      return (
        <>
          <NodeField label="Hit Count">
            <NodeInteractive>
              <FullWidthInputNumber
                min={1}
                value={cone.hit_count}
                onChange={(value) => update({ hit_count: Number(value) || 1 })}
                size="small"
              />
            </NodeInteractive>
          </NodeField>
          <NodeField label="Radius">
            <NodeInteractive>
              <FullWidthInputNumber
                min={0}
                step={0.5}
                value={cone.radius}
                onChange={(value) => update({ radius: Number(value) || 0 })}
                size="small"
              />
            </NodeInteractive>
          </NodeField>
          <NodeField label="Angle (degrees)">
            <NodeInteractive>
              <FullWidthInputNumber
                min={1}
                max={360}
                value={cone.angle}
                onChange={(value) => update({ angle: Number(value) || 1 })}
                size="small"
              />
            </NodeInteractive>
          </NodeField>
        </>
      );
    }

    default:
      return null;
  }
};
