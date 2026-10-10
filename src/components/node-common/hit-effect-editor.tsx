import { Checkbox, CheckboxChangeEvent, Select, Space } from "antd";
import React from "react";
import {
  ALL_HIT_TYPES,
  EntityReference,
  EntityType,
  HitType,
} from "@models/common.types";
import {
  ALL_DAMAGE_SCHOOLS,
  DamageSchool,
  EffectScaling,
  EffectTarget,
  EffectTargetMechanic,
  HitEffect,
} from "@models/effect.types";
import { createDefaultTargeting } from "@utils/mechanic";
import {
  NodeField,
  NodeEntityReference,
  NodeInteractive,
  NodeScalers,
  TargetMechanicEditor,
} from "./";

const { Option } = Select;

// The effect with its school set, or without the key when there is none
const withSchool = (effect: HitEffect, school?: DamageSchool): HitEffect => {
  const copy: HitEffect = { ...effect };
  if (school) copy.school = school;
  else delete copy.school;
  return copy;
};

interface HitEffectEditorProps {
  hitEffect: HitEffect;
  onChange: (hitEffect: HitEffect) => void;
}

export const HitEffectEditor: React.FC<HitEffectEditorProps> = ({
  hitEffect,
  onChange,
}) => {
  // Create a local copy to avoid direct mutation
  const effect = hitEffect || {
    hit_type: HitType.Damage,
    scalers: [],
    ...createDefaultTargeting(),
    hit_sound: null,
    can_crit: false,
    can_miss: false,
  };

  const handleHitTypeChange = (value: HitType) => {
    // a school only exists on Damage and Heal hits
    const keepSchool = value === HitType.Damage || value === HitType.Heal;
    onChange(
      withSchool(
        { ...effect, hit_type: value },
        keepSchool ? effect.school : undefined,
      ),
    );
  };

  const handleSchoolChange = (value: DamageSchool | undefined) => {
    onChange(withSchool(effect, value || undefined));
  };

  const handleTargetChange = (target: EffectTarget) => {
    onChange({ ...effect, target });
  };

  const handleMechanicChange = (target_mechanic: EffectTargetMechanic) => {
    onChange({ ...effect, target_mechanic });
  };

  const handleSoundKeyChange = (entity: EntityReference) => {
    onChange({ ...effect, hit_sound: entity });
  };

  const handleCanCritChange = (e: CheckboxChangeEvent) => {
    onChange({ ...effect, can_crit: e.target.checked });
  };

  const handleCanMissChange = (e: CheckboxChangeEvent) => {
    onChange({ ...effect, can_miss: e.target.checked });
  };

  const handleScalersChange = (scalers: EffectScaling[]) => {
    onChange({ ...effect, scalers });
  };

  return (
    <>
      <NodeField label="Hit Type">
        <NodeInteractive>
          <Select
            style={{ width: "100%" }}
            value={effect.hit_type}
            onChange={handleHitTypeChange}
            size="small"
          >
            {ALL_HIT_TYPES.map((type) => (
              <Option key={type} value={type}>
                {type}
              </Option>
            ))}
          </Select>
        </NodeInteractive>
      </NodeField>

      {(effect.hit_type === HitType.Damage ||
        effect.hit_type === HitType.Heal) && (
        <NodeField label="School">
          <NodeInteractive>
            <Select
              style={{ width: "100%" }}
              value={effect.school}
              onChange={handleSchoolChange}
              size="small"
              allowClear
              placeholder="From scaler stats"
              data-testid="hit-school"
            >
              {ALL_DAMAGE_SCHOOLS.map((school) => (
                <Option key={school} value={school}>
                  {school}
                </Option>
              ))}
            </Select>
          </NodeInteractive>
        </NodeField>
      )}

      <TargetMechanicEditor
        target={effect.target}
        targetMechanic={effect.target_mechanic}
        onTargetChange={handleTargetChange}
        onMechanicChange={handleMechanicChange}
      />

      <NodeEntityReference
        entityType={EntityType.Sound}
        value={effect.hit_sound?.key || ""}
        onChange={handleSoundKeyChange}
        label="Hit Sound"
        placeholder="Select sound"
      />

      <NodeField label="">
        <Space direction="vertical" style={{ width: "100%" }}>
          <NodeInteractive>
            <Checkbox checked={effect.can_crit} onChange={handleCanCritChange}>
              Can Critical Hit
            </Checkbox>
          </NodeInteractive>
          <NodeInteractive>
            <Checkbox checked={effect.can_miss} onChange={handleCanMissChange}>
              Can Miss
            </Checkbox>
          </NodeInteractive>
        </Space>
      </NodeField>

      <NodeScalers
        scalers={effect.scalers || []}
        onChange={handleScalersChange}
        title="Hit Effect Scalers"
      />
    </>
  );
};
