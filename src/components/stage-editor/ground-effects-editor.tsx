import { Button, InputNumber, Select, Space, Typography } from "antd";
import React from "react";
import { EntityReferenceSelect } from "@components/common/entity-reference-select";
import { EntityType } from "@models/common.types";
import {
  ALL_GROUND_EFFECT_WHOS,
  createDefaultGroundEffect,
  dropUndefined,
  GroundEffect,
} from "@models/generator.types";
import {
  ALL_STATUS_DURATION_TYPES,
  StatusDuration,
  StatusDurationType,
} from "@models/status.types";

const { Text } = Typography;

interface GroundEffectsEditorProps {
  label: string; // names the controls: "<label> effect <n> period"
  effects: GroundEffect[];
  onChange: (effects: GroundEffect[]) => void;
  minCount?: number; // removing is refused at this many effects (default 0)
}

const EffectRow: React.FC<{
  label: string;
  effect: GroundEffect;
  onChange: (effect: GroundEffect) => void;
  onRemove?: () => void;
}> = ({ label, effect, onChange, onRemove }) => {
  // path_cost is optional: cleared, the key is removed
  const set = (patch: Partial<GroundEffect>) => onChange(dropUndefined({ ...effect, ...patch }));
  const setDuration = (index: number, duration: StatusDuration) =>
    set({ durations: effect.durations.map((d, i) => (i === index ? duration : d)) });

  return (
    <Space direction="vertical" style={{ width: "100%", borderLeft: "2px solid #d9d9d9", paddingLeft: 8 }}>
      <Space wrap>
        <EntityReferenceSelect
          entityType={EntityType.Status}
          value={effect.status.key}
          onChange={(status) => set({ status })}
        />
        <Select
          size="small"
          style={{ width: 110 }}
          value={effect.who}
          aria-label={`${label} who`}
          onChange={(who) => set({ who })}
          options={ALL_GROUND_EFFECT_WHOS.map((w) => ({ value: w, label: w }))}
        />
        <InputNumber
          size="small"
          min={0.1}
          prefix={<Text type="secondary">period</Text>}
          value={effect.period}
          aria-label={`${label} period`}
          onChange={(v) => set({ period: v ?? 1 })}
        />
        <InputNumber
          size="small"
          prefix={<Text type="secondary">magnitude</Text>}
          value={effect.magnitude}
          aria-label={`${label} magnitude`}
          onChange={(v) => set({ magnitude: v ?? 0 })}
        />
        <InputNumber
          size="small"
          min={0}
          prefix={<Text type="secondary">path cost</Text>}
          value={effect.path_cost}
          aria-label={`${label} path cost`}
          onChange={(v) => set({ path_cost: v ?? undefined })}
        />
        {onRemove && (
          <Button danger size="small" aria-label={`${label} remove`} onClick={onRemove}>
            Remove effect
          </Button>
        )}
      </Space>
      <Space wrap>
        <Text strong>durations</Text>
        {effect.durations.map((duration, index) => (
          <Space key={index}>
            <Select
              size="small"
              style={{ width: 100 }}
              value={duration.type}
              aria-label={`${label} duration ${index} type`}
              onChange={(type) => setDuration(index, { ...duration, type })}
              options={ALL_STATUS_DURATION_TYPES.map((t) => ({ value: t, label: t }))}
            />
            <InputNumber
              size="small"
              value={duration.value}
              aria-label={`${label} duration ${index} value`}
              onChange={(v) => setDuration(index, { ...duration, value: v ?? 0 })}
            />
            <Button
              danger
              size="small"
              aria-label={`${label} duration ${index} remove`}
              onClick={() => set({ durations: effect.durations.filter((_, i) => i !== index) })}
            >
              x
            </Button>
          </Space>
        ))}
        <Button
          size="small"
          aria-label={`${label} add duration`}
          onClick={() =>
            set({ durations: [...effect.durations, { type: StatusDurationType.Chrono, value: 1 }] })
          }
        >
          Add Duration
        </Button>
      </Space>
    </Space>
  );
};

// The statuses a ground zone gives to the characters in it. Shared by the stage's ground zones and
// the generator's sewer / water rules.
export const GroundEffectsEditor: React.FC<GroundEffectsEditorProps> = ({
  label,
  effects,
  onChange,
  minCount = 0,
}) => {
  const update = (index: number, effect: GroundEffect) =>
    onChange(effects.map((e, i) => (i === index ? effect : e)));

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      {effects.map((effect, index) => (
        <EffectRow
          key={index}
          label={`${label} effect ${index}`}
          effect={effect}
          onChange={(next) => update(index, next)}
          onRemove={
            effects.length > minCount
              ? () => onChange(effects.filter((_, i) => i !== index))
              : undefined
          }
        />
      ))}
      <Button
        size="small"
        aria-label={`${label} add effect`}
        onClick={() => onChange([...effects, createDefaultGroundEffect()])}
      >
        Add Effect
      </Button>
    </Space>
  );
};
