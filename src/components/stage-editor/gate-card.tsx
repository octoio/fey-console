import { Button, Card, Checkbox, InputNumber, Input, Select, Space, Tag, Typography } from "antd";
import React from "react";
import { EntityReferenceSelect } from "@components/common/entity-reference-select";
import { EntityType } from "@models/common.types";
import { dropUndefined } from "@models/generator.types";
import { ALL_GATE_OPENINGS, Gate } from "@models/stage.types";
import { ObstacleCard } from "./obstacle-card";

const { Text } = Typography;

interface GateCardProps {
  index: number;
  gate: Gate;
  groundIds: string[]; // ids of the stage's ground zones, what drains can name
  onChange: (gate: Gate) => void;
  onRemove: () => void;
}

export const GateCard: React.FC<GateCardProps> = ({
  index,
  gate,
  groundIds,
  onChange,
  onRemove,
}) => {
  const label = `gate ${index}`;
  // An optional field is absent from the JSON when cleared
  const set = (patch: Partial<Gate>) => onChange(dropUndefined({ ...gate, ...patch }));
  const side = (field: "side_x" | "side_z") => (
    <InputNumber
      size="small"
      prefix={<Text type="secondary">{field}</Text>}
      value={gate[field]}
      aria-label={`${label} ${field}`}
      onChange={(next) => set({ [field]: next ?? undefined })}
    />
  );

  return (
    <Card
      size="small"
      title={
        <Space>
          <Text strong>{label}</Text>
          <Tag color="purple">{gate.opening}</Tag>
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
            value={gate.id}
            aria-label={`${label} id`}
            onChange={(event) => set({ id: event.target.value })}
          />
          <Select
            size="small"
            style={{ width: 120 }}
            value={gate.opening}
            aria-label={`${label} opening`}
            onChange={(opening) => set({ opening })}
            options={ALL_GATE_OPENINGS.map((o) => ({ value: o, label: o }))}
          />
          {/* starts_open is optional and absent means closed: unchecking drops the key */}
          <Checkbox
            checked={gate.starts_open ?? false}
            aria-label={`${label} starts open`}
            onChange={(event) => set({ starts_open: event.target.checked ? true : undefined })}
          >
            starts open
          </Checkbox>
          {side("side_x")}
          {side("side_z")}
        </Space>
        <Space>
          <Text strong>lever</Text>
          <EntityReferenceSelect
            entityType={EntityType.Anchor}
            value={gate.lever?.key}
            onChange={(lever) => set({ lever: lever.key ? lever : undefined })}
          />
        </Space>
        <Space>
          <Text strong>drains</Text>
          <Select
            size="small"
            mode="tags"
            style={{ minWidth: 220 }}
            placeholder="ground zone ids"
            value={gate.drains ?? []}
            aria-label={`${label} drains`}
            onChange={(drains: string[]) => set({ drains: drains.length > 0 ? drains : undefined })}
            options={groundIds.map((id) => ({ value: id, label: id }))}
          />
        </Space>
        <ObstacleCard
          index={0}
          label={`${label} obstacle`}
          obstacle={gate.obstacle}
          onChange={(obstacle) => set({ obstacle })}
        />
      </Space>
    </Card>
  );
};
