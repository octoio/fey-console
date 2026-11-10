import { Button, Card, Space, Typography } from "antd";
import React from "react";
import { ALL_MONSTER_RANKS, MonsterRank } from "@models/character.types";
import { QualityType, ALL_QUALITIES } from "@models/quality.types";
import { TierAffix, QuestTier } from "@models/quest.types";
import { ALL_STAT_TYPES, StatType } from "@models/stat.types";
import { NumberField, SelectField, TextField, withField } from "./fields";

const { Text } = Typography;

// validate_guarantee_quality (fey-data validation.ml): quality None marks a bare item and is never a
// rarity to demand, every other quality is accepted.
const GUARANTEE_QUALITIES = ALL_QUALITIES.filter((q) => q !== QualityType.None);

export const createDefaultTier = (): QuestTier => ({ order: 0 });

export const createDefaultAffix = (): TierAffix => ({
  name: "New affix",
  stat: StatType.Health,
  multiplier: 1,
});

interface AffixRowProps {
  index: number;
  affix: TierAffix;
  onChange: (affix: TierAffix) => void;
  onRemove: () => void;
}

const AffixRow: React.FC<AffixRowProps> = ({ index, affix, onChange, onRemove }) => {
  const label = `affix ${index}`;
  return (
    <Space wrap>
      <TextField
        label={`${label} name`}
        value={affix.name}
        onChange={(name) => onChange({ ...affix, name: name ?? "" })}
      />
      <SelectField
        label={`${label} stat`}
        value={affix.stat}
        options={ALL_STAT_TYPES}
        onChange={(stat) => onChange(withField(affix, { stat }))}
      />
      <NumberField
        label={`${label} multiplier`}
        value={affix.multiplier}
        min={0.05}
        step={0.05}
        onChange={(multiplier) => onChange({ ...affix, multiplier: multiplier ?? 1 })}
      />
      <SelectField
        label={`${label} min rank`}
        value={affix.min_rank}
        options={ALL_MONSTER_RANKS}
        allowClear
        onChange={(min_rank: MonsterRank | undefined) => onChange(withField(affix, { min_rank }))}
      />
      <Button danger size="small" onClick={onRemove}>
        Remove affix
      </Button>
    </Space>
  );
};

interface TierCardProps {
  tier: QuestTier;
  onChange: (tier: QuestTier) => void;
}

export const TierCard: React.FC<TierCardProps> = ({ tier, onChange }) => {
  const set = (patch: Partial<QuestTier>) => onChange(withField(tier, patch));
  const affixes = tier.affixes ?? [];
  // An empty list is saved as no field at all (the ATD field is optional)
  const setAffixes = (next: TierAffix[]) => set({ affixes: next.length > 0 ? next : undefined });

  return (
    <Card size="small" title={<Text strong>tier</Text>}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Space wrap>
          <NumberField
            label="order"
            value={tier.order}
            min={0}
            onChange={(order) => set({ order: Math.max(0, Math.round(order ?? 0)) })}
          />
          <NumberField label="rate" value={tier.rate} min={0.1} step={0.1} onChange={(rate) => set({ rate })} />
          <NumberField
            label="extra adds"
            value={tier.extra_adds}
            min={0}
            step={0.05}
            onChange={(extra_adds) => set({ extra_adds })}
          />
          <NumberField
            label="rarity tilt"
            value={tier.rarity_tilt}
            min={0}
            step={0.1}
            onChange={(rarity_tilt) => set({ rarity_tilt })}
          />
          <NumberField
            label="gold multiplier"
            value={tier.gold_multiplier}
            min={0.1}
            step={0.1}
            onChange={(gold_multiplier) => set({ gold_multiplier })}
          />
          <SelectField
            label="guarantee min quality"
            value={tier.guarantee_min_quality}
            options={GUARANTEE_QUALITIES}
            allowClear
            onChange={(guarantee_min_quality: QualityType | undefined) => set({ guarantee_min_quality })}
          />
        </Space>
        {affixes.map((affix, index) => (
          <AffixRow
            key={index}
            index={index}
            affix={affix}
            onChange={(next) => setAffixes(affixes.map((a, i) => (i === index ? next : a)))}
            onRemove={() => setAffixes(affixes.filter((_, i) => i !== index))}
          />
        ))}
        <Button size="small" onClick={() => setAffixes([...affixes, createDefaultAffix()])}>
          Add affix
        </Button>
      </Space>
    </Card>
  );
};
