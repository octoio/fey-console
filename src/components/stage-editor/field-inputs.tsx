import { Input, InputNumber, Space, Typography } from "antd";
import React from "react";
import { Color, Metadata, Vector3 } from "@models/common.types";

const { Text } = Typography;

interface Vector3InputProps {
  label: string;
  value: Vector3;
  onChange: (value: Vector3) => void;
}

export const Vector3Input: React.FC<Vector3InputProps> = ({
  label,
  value,
  onChange,
}) => (
  <Space wrap>
    <Text strong>{label}</Text>
    {(["x", "y", "z"] as const).map((axis) => (
      <InputNumber
        key={axis}
        size="small"
        prefix={<Text type="secondary">{axis}</Text>}
        value={value[axis]}
        aria-label={`${label} ${axis}`}
        onChange={(next) => onChange({ ...value, [axis]: next ?? 0 })}
      />
    ))}
  </Space>
);

interface ColorInputProps {
  label: string;
  value: Color;
  onChange: (value: Color) => void;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const ColorInput: React.FC<ColorInputProps> = ({
  label,
  value,
  onChange,
}) => (
  <Space wrap>
    <Text strong>{label}</Text>
    {(["r", "g", "b", "a"] as const).map((channel) => (
      <InputNumber
        key={channel}
        size="small"
        min={0}
        max={1}
        step={0.05}
        prefix={<Text type="secondary">{channel}</Text>}
        value={value[channel]}
        aria-label={`${label} ${channel}`}
        onChange={(next) =>
          onChange({ ...value, [channel]: clamp01(next ?? 0) })
        }
      />
    ))}
    <span
      aria-label={`${label} preview`}
      style={{
        display: "inline-block",
        width: 24,
        height: 24,
        borderRadius: 4,
        border: "1px solid #d9d9d9",
        backgroundColor: `rgba(${value.r * 255}, ${value.g * 255}, ${value.b * 255}, ${value.a})`,
      }}
    />
  </Space>
);

interface MetadataInputProps {
  value: Metadata;
  onChange: (value: Metadata) => void;
}

export const MetadataInput: React.FC<MetadataInputProps> = ({
  value,
  onChange,
}) => (
  <Space direction="vertical" style={{ width: "100%" }}>
    <Input
      size="small"
      prefix={<Text strong>title</Text>}
      value={value.title}
      aria-label="Metadata title"
      onChange={(event) => onChange({ ...value, title: event.target.value })}
    />
    <Input.TextArea
      rows={2}
      value={value.description}
      placeholder="Description"
      aria-label="Metadata description"
      onChange={(event) =>
        onChange({ ...value, description: event.target.value })
      }
    />
  </Space>
);
