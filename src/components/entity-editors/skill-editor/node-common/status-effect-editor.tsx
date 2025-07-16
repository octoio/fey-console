import { Button, InputNumber, Select } from "antd";
import React from "react";
import { DeleteOutlined } from "@ant-design/icons";
import { EntityReference, EntityType } from "@models/common.types";
import {
  SkillEffectScaling,
  SkillEffectTarget,
  SkillEffectTargetMechanic,
  StatusEffect,
} from "@models/skill.types";
import {
  ALL_STATUS_DURATION_TYPES,
  StatusDurationType,
  StatusDuration,
} from "@models/status.types";
import { createDefaultTargeting } from "@utils/mechanic";
import {
  NodeTable,
  NodeEntityReference,
  NodeInteractive,
  NodeScalers,
  TargetMechanicEditor,
} from "./";

const { Option } = Select;

interface StatusEffectEditorProps {
  statusEffect: StatusEffect;
  onChange: (statusEffect: StatusEffect) => void;
}

export const StatusEffectEditor: React.FC<StatusEffectEditorProps> = ({
  statusEffect,
  onChange,
}) => {
  // Create a local copy to avoid direct mutation
  const effect = statusEffect || {
    ...createDefaultTargeting(),
    durations: [],
    scalers: [],
    status: null,
  };

  const handleTargetChange = (target: SkillEffectTarget) => {
    onChange({ ...effect, target });
  };

  const handleMechanicChange = (target_mechanic: SkillEffectTargetMechanic) => {
    onChange({ ...effect, target_mechanic });
  };

  const handleScalersChange = (scalers: SkillEffectScaling[]) => {
    onChange({ ...effect, scalers });
  };

  const handleAddDuration = () => {
    const newDuration = {
      type: StatusDurationType.Chrono,
      value: 5.0,
    };

    const durations = [...(effect.durations || []), newDuration];
    onChange({ ...effect, durations });
  };

  const handleRemoveDuration = (index: number) => {
    const durations = [...(effect.durations || [])];
    durations.splice(index, 1);
    onChange({ ...effect, durations });
  };

  const handleStatusChange = (entity: EntityReference) => {
    onChange({ ...effect, status: entity });
  };

  // Columns for the durations table
  const durationColumns = [
    {
      title: "Type",
      key: "type",
      render: (_text: string, record: StatusDuration, index: number) => (
        <NodeInteractive>
          <Select
            size="small"
            value={record.type}
            style={{ width: 110 }}
            onChange={(value) => {
              const durations = [...(effect.durations || [])];
              durations[index] = { ...durations[index], type: value };
              onChange({ ...effect, durations });
            }}
          >
            {ALL_STATUS_DURATION_TYPES.map((type) => (
              <Option key={type} value={type}>
                {type}
              </Option>
            ))}
          </Select>
        </NodeInteractive>
      ),
    },
    {
      title: "Value",
      key: "value",
      render: (_text: string, record: StatusDuration, index: number) => (
        <NodeInteractive>
          <InputNumber
            size="small"
            value={record.value}
            onChange={(value) => {
              const durations = [...(effect.durations || [])];
              durations[index] = { ...durations[index], value: value || 0 };
              onChange({ ...effect, durations });
            }}
            style={{ width: 70 }}
            min={0}
            step={0.5}
          />
        </NodeInteractive>
      ),
    },
    {
      title: "",
      key: "action",
      width: 30,
      render: (_text: string, _record: StatusDuration, index: number) => (
        <NodeInteractive>
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleRemoveDuration(index)}
          />
        </NodeInteractive>
      ),
    },
  ];

  return (
    <>
      <TargetMechanicEditor
        target={effect.target}
        targetMechanic={effect.target_mechanic}
        onTargetChange={handleTargetChange}
        onMechanicChange={handleMechanicChange}
      />

      <NodeEntityReference
        entityType={EntityType.Status}
        value={effect.status?.key || ""}
        onChange={handleStatusChange}
        label="Status"
        placeholder="Select status"
      />

      <NodeTable<StatusDuration>
        title="Durations"
        columns={durationColumns}
        dataSource={effect.durations || []}
        onAdd={handleAddDuration}
      />

      <NodeScalers
        scalers={effect.scalers || []}
        onChange={handleScalersChange}
        title="Status Effect Scalers"
      />
    </>
  );
};
