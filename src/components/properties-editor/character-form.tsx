import { Space } from "antd";
import React from "react";
import {
  ALL_CHARACTER_TYPES,
  ALL_FACTIONS,
  ALL_MONSTER_RANKS,
  Character,
  Faction,
  MonsterRank,
} from "@models/character.types";
import { FlagField, NumberField, SelectField, TextField, withField } from "./fields";

interface CharacterFormProps {
  entity: Character;
  onChange: (entity: Character) => void;
}

// Only the top-level plain fields; every nested structure is saved as read.
export const CharacterForm: React.FC<CharacterFormProps> = ({ entity, onChange }) => {
  const set = (patch: Partial<Character>) => onChange(withField(entity, patch));
  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Space wrap>
        <SelectField
          label="type"
          value={entity.type}
          options={ALL_CHARACTER_TYPES}
          onChange={(type) => type && set({ type })}
        />
        <SelectField
          label="faction"
          value={entity.faction}
          options={ALL_FACTIONS}
          allowClear
          onChange={(faction: Faction | undefined) => set({ faction })}
        />
        <SelectField
          label="rank"
          value={entity.rank}
          options={ALL_MONSTER_RANKS}
          allowClear
          onChange={(rank: MonsterRank | undefined) => set({ rank })}
        />
        <TextField label="model family" value={entity.model_family} onChange={(model_family) => set({ model_family })} />
      </Space>
      <Space wrap>
        <NumberField label="level" value={entity.level} min={1} onChange={(level) => set({ level })} />
        <NumberField
          label="vision range"
          value={entity.vision_range}
          min={0}
          onChange={(vision_range) => set({ vision_range: vision_range ?? 0 })}
        />
        <NumberField
          label="director cost"
          value={entity.director_cost}
          min={1}
          onChange={(director_cost) => set({ director_cost })}
        />
      </Space>
      <Space wrap>
        <FlagField label="hunts healers" value={entity.hunts_healers} onChange={(hunts_healers) => set({ hunts_healers })} />
        <FlagField label="swims" value={entity.swims} onChange={(swims) => set({ swims })} />
        <FlagField label="lurks" value={entity.lurks} onChange={(lurks) => set({ lurks })} />
      </Space>
    </Space>
  );
};
