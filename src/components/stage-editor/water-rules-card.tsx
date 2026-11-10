import { Button, Card } from "antd";
import React from "react";
import { createDefaultWaterRules, WaterRules } from "@models/generator.types";
import { GroundEffectsEditor } from "./ground-effects-editor";

interface WaterRulesCardProps {
  label: string; // "sewer" or "water": the generator field and what the controls are named
  rules?: WaterRules;
  onChange: (rules: WaterRules | undefined) => void; // undefined: the record is gone
}

// An optional record of the generator: added with one effect, removed whole (the key leaves the JSON)
export const WaterRulesCard: React.FC<WaterRulesCardProps> = ({ label, rules, onChange }) => (
  <Card
    size="small"
    title={`${label} rules`}
    extra={
      rules ? (
        <Button danger size="small" onClick={() => onChange(undefined)}>
          {`Remove ${label}`}
        </Button>
      ) : (
        <Button size="small" onClick={() => onChange(createDefaultWaterRules())}>
          {`Add ${label}`}
        </Button>
      )
    }
  >
    {rules && (
      <GroundEffectsEditor
        label={label}
        effects={rules.effects}
        minCount={1}
        onChange={(effects) => onChange({ ...rules, effects })}
      />
    )}
  </Card>
);
