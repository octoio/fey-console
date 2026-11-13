import { Input, Select, Space, Typography } from "antd";
import React from "react";
import { EntityReferenceSelect } from "@components/common/entity-reference-select";
import { AnchorChest } from "@models/anchor.types";
import { EntityType } from "@models/common.types";
import { QualityType } from "@models/quality.types";

const { Text } = Typography;

/** The qualities a chest can set as its floor (the schema validates Uncommon..Epic). */
export const CHEST_QUALITIES: QualityType[] = [
  QualityType.Uncommon,
  QualityType.Rare,
  QualityType.Epic,
];

interface ChestFieldsProps {
  anchor: AnchorChest;
  onChange: (anchor: AnchorChest) => void;
}

export const ChestFields: React.FC<ChestFieldsProps> = ({ anchor, onChange }) => (
  <Space wrap>
    <Text strong>model</Text>
    <Input
      size="small"
      style={{ width: 200 }}
      value={anchor.model}
      aria-label="chest model"
      onChange={(event) => onChange({ ...anchor, model: event.target.value })}
    />
    <Text strong>min quality</Text>
    <Select
      size="small"
      style={{ width: 120 }}
      value={anchor.min_quality}
      aria-label="chest min quality"
      options={CHEST_QUALITIES.map((quality) => ({ value: quality, label: quality }))}
      onChange={(min_quality) => onChange({ ...anchor, min_quality })}
    />
    <Text strong>guard</Text>
    <EntityReferenceSelect
      entityType={EntityType.Anchor}
      value={anchor.guard.key}
      onChange={(guard) => onChange({ ...anchor, guard })}
    />
  </Space>
);
