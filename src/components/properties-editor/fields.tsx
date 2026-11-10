import { Checkbox, Input, InputNumber, Select, Space, Typography } from "antd";
import React from "react";
import { dropUndefined } from "@models/generator.types";

const { Text } = Typography;

/** Patches an entity; a field set to undefined is removed from the JSON, never written as null or empty. */
export const withField = <T extends object>(entity: T, patch: Partial<T>): T =>
  dropUndefined({ ...entity, ...patch });

interface NumberFieldProps {
  label: string;
  value: number | undefined;
  min?: number;
  step?: number;
  onChange: (value: number | undefined) => void;
}

export const NumberField: React.FC<NumberFieldProps> = ({ label, value, min, step, onChange }) => (
  <InputNumber
    size="small"
    min={min}
    step={step}
    prefix={<Text type="secondary">{label}</Text>}
    value={value}
    aria-label={label}
    onChange={(next) => onChange(next ?? undefined)}
  />
);

interface TextFieldProps {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

export const TextField: React.FC<TextFieldProps> = ({ label, value, onChange }) => (
  <Input
    size="small"
    style={{ width: 200 }}
    prefix={<Text type="secondary">{label}</Text>}
    value={value ?? ""}
    aria-label={label}
    onChange={(event) => onChange(event.target.value || undefined)}
  />
);

interface SelectFieldProps<T extends string> {
  label: string;
  value: T | undefined;
  options: readonly T[];
  /** Optional fields can be cleared back to absent. */
  allowClear?: boolean;
  onChange: (value: T | undefined) => void;
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  allowClear,
  onChange,
}: SelectFieldProps<T>) {
  return (
    <Space size={4}>
      <Text type="secondary">{label}</Text>
      <Select
        size="small"
        style={{ minWidth: 130 }}
        value={value}
        allowClear={allowClear}
        aria-label={label}
        onChange={(next) => onChange((next as T | undefined) ?? undefined)}
        options={options.map((o) => ({ value: o, label: o }))}
      />
    </Space>
  );
}

interface FlagFieldProps {
  label: string;
  value: boolean | undefined;
  onChange: (value: true | undefined) => void;
}

/** An optional flag where absent means false: unchecking removes the key. */
export const FlagField: React.FC<FlagFieldProps> = ({ label, value, onChange }) => (
  <Checkbox
    checked={value ?? false}
    aria-label={label}
    onChange={(event) => onChange(event.target.checked ? true : undefined)}
  >
    {label}
  </Checkbox>
);
