import { Button, Card, Empty, Input, Select, Space, Tag, Typography } from "antd";
import React from "react";
import { dropUndefined } from "@models/generator.types";
import {
  ALL_GROUND_KINDS,
  createDefaultGroundZone,
  GroundZone,
} from "@models/stage.types";
import { GroundEffectsEditor } from "./ground-effects-editor";
import { ShapeInputs } from "./shape-inputs";

const { Text } = Typography;

interface GroundZoneCardProps {
  index: number;
  zone: GroundZone;
  onChange: (zone: GroundZone) => void;
  onRemove: () => void;
}

const GroundZoneCard: React.FC<GroundZoneCardProps> = ({
  index,
  zone,
  onChange,
  onRemove,
}) => {
  const label = `ground ${index}`;
  // An optional field is absent from the JSON when cleared
  const set = (patch: Partial<GroundZone>) => onChange(dropUndefined({ ...zone, ...patch }));

  return (
    <Card
      size="small"
      title={
        <Space>
          <Text strong>{label}</Text>
          <Tag color="blue">{zone.kind}</Tag>
        </Space>
      }
      extra={
        <Button danger size="small" onClick={onRemove}>
          Remove
        </Button>
      }
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <Space wrap>
          <Input
            size="small"
            style={{ width: 180 }}
            prefix={<Text type="secondary">id</Text>}
            value={zone.id ?? ""}
            aria-label={`${label} id`}
            onChange={(event) => set({ id: event.target.value || undefined })}
          />
          <Select
            size="small"
            style={{ width: 120 }}
            value={zone.kind}
            aria-label={`${label} kind`}
            onChange={(kind) => set({ kind })}
            options={ALL_GROUND_KINDS.map((kind) => ({ value: kind, label: kind }))}
          />
          <ShapeInputs label={label} value={zone} onChange={onChange} />
        </Space>
        <GroundEffectsEditor
          label={label}
          effects={zone.effects ?? []}
          onChange={(effects) => set({ effects: effects.length > 0 ? effects : undefined })}
        />
      </Space>
    </Card>
  );
};

interface GroundCardProps {
  ground: GroundZone[];
  onChange: (ground: GroundZone[]) => void;
}

// The stage's ground zones, in order: where zones overlap the last one wins
export const GroundCard: React.FC<GroundCardProps> = ({ ground, onChange }) => (
  <Card
    size="small"
    title={`Ground (${ground.length})`}
    extra={
      <Button size="small" onClick={() => onChange([...ground, createDefaultGroundZone()])}>
        Add Ground
      </Button>
    }
  >
    <Space direction="vertical" style={{ width: "100%" }}>
      {ground.length === 0 && <Empty description="No ground zones: the stage is dry floor" />}
      {ground.map((zone, index) => (
        <GroundZoneCard
          key={index}
          index={index}
          zone={zone}
          onChange={(updated) => onChange(ground.map((z, i) => (i === index ? updated : z)))}
          onRemove={() => onChange(ground.filter((_, i) => i !== index))}
        />
      ))}
    </Space>
  </Card>
);
