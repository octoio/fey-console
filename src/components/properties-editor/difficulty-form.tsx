import { Space, Switch, Typography } from "antd";
import React from "react";
import { ColorInput } from "@components/stage-editor/field-inputs";
import { ALL_QUEST_DIFFICULTY_TYPES, QuestDifficulty } from "@models/quest.types";
import { SelectField, withField } from "./fields";
import { createDefaultTier, TierCard } from "./tier-card";

const { Text } = Typography;

interface DifficultyFormProps {
  entity: QuestDifficulty;
  onChange: (entity: QuestDifficulty) => void;
}

export const DifficultyForm: React.FC<DifficultyFormProps> = ({ entity, onChange }) => (
  <Space direction="vertical" style={{ width: "100%" }}>
    <SelectField
      label="type"
      value={entity.type}
      options={ALL_QUEST_DIFFICULTY_TYPES}
      onChange={(type) => type && onChange({ ...entity, type })}
    />
    <ColorInput label="color" value={entity.color} onChange={(color) => onChange({ ...entity, color })} />
    <Space>
      <Switch
        checked={entity.tier !== undefined}
        aria-label="has tier"
        onChange={(on) => onChange(withField(entity, { tier: on ? createDefaultTier() : undefined }))}
      />
      <Text>offered in the lobby (tier record)</Text>
    </Space>
    {entity.tier && <TierCard tier={entity.tier} onChange={(tier) => onChange({ ...entity, tier })} />}
  </Space>
);
