import { Space } from "antd";
import React from "react";
import { ALL_STAT_FORMATS, MAX_STAT_DECIMALS, Stat, StatDisplay } from "@models/stat.types";
import { FlagField, NumberField, SelectField, TextField, withField } from "./fields";

interface StatFormProps {
  entity: Stat;
  onChange: (entity: Stat) => void;
}

// Only the display rule; the colour, clamp and conversions are saved as read.
export const StatForm: React.FC<StatFormProps> = ({ entity, onChange }) => {
  const display = entity.display;
  const set = (patch: Partial<StatDisplay>) => onChange({ ...entity, display: withField(display, patch) });
  return (
    <Space wrap>
      <SelectField
        label="format"
        value={display.format}
        options={ALL_STAT_FORMATS}
        onChange={(format) => format && set({ format })}
      />
      <NumberField
        label="decimals"
        value={display.decimals}
        min={0}
        max={MAX_STAT_DECIMALS}
        onChange={(decimals) => set({ decimals: decimals ?? 0 })}
      />
      <TextField label="unit" value={display.unit} onChange={(unit) => set({ unit: unit ?? "" })} />
      <NumberField label="scale" value={display.scale} min={0} step={0.1} onChange={(scale) => set({ scale: scale || undefined })} />
      <TextField label="label" value={display.label} onChange={(label) => set({ label })} />
      <FlagField
        label="lower is better"
        value={display.lower_is_better}
        onChange={(on) => set({ lower_is_better: on ?? false })}
      />
    </Space>
  );
};
