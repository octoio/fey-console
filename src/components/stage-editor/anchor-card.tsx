import { Button, Card, Checkbox, InputNumber, Select, Space, Tag, Typography } from "antd";
import React from "react";
import {
  ALL_ANCHOR_TYPES,
  ALL_ZONE_DETECTION_TYPES,
  Anchor,
  AnchorEntityDefinition,
  AnchorType,
  createDefaultAnchor,
} from "@models/anchor.types";
import { ColorInput, MetadataInput, Vector3Input } from "./field-inputs";

const { Text } = Typography;

interface AnchorCardProps {
  definition: AnchorEntityDefinition;
  isNew: boolean;
  onChange: (definition: AnchorEntityDefinition) => void;
  onRemove: () => void;
}

export const AnchorCard: React.FC<AnchorCardProps> = ({
  definition,
  isNew,
  onChange,
  onRemove,
}) => {
  const anchor = definition.entity;

  const updateAnchor = (entity: Anchor) => onChange({ ...definition, entity });

  const handleTypeChange = (type: AnchorType) => {
    // Changing type swaps the variant but keeps the shared fields
    const next = createDefaultAnchor(type);
    updateAnchor({
      ...next,
      metadata: anchor.metadata,
      transform: anchor.transform,
    });
  };

  return (
    <Card
      size="small"
      title={
        <Space>
          <Text strong>{definition.key}</Text>
          <Tag color="blue">{anchor.type}</Tag>
          {isNew && <Tag color="orange">not saved yet</Tag>}
        </Space>
      }
      extra={
        <Button danger size="small" onClick={onRemove}>
          Remove
        </Button>
      }
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <Space>
          <Text strong>type</Text>
          <Select
            size="small"
            style={{ width: 140 }}
            value={anchor.type}
            aria-label={`${definition.key} anchor type`}
            onChange={handleTypeChange}
            options={ALL_ANCHOR_TYPES.map((type) => ({
              value: type,
              label: type,
            }))}
          />
        </Space>

        <MetadataInput
          value={anchor.metadata}
          onChange={(metadata) => updateAnchor({ ...anchor, metadata })}
        />

        <Vector3Input
          label="position"
          value={anchor.transform.position}
          onChange={(position) =>
            updateAnchor({
              ...anchor,
              transform: { ...anchor.transform, position },
            })
          }
        />
        <Vector3Input
          label="rotation"
          value={anchor.transform.rotation}
          onChange={(rotation) =>
            updateAnchor({
              ...anchor,
              transform: { ...anchor.transform, rotation },
            })
          }
        />
        <Vector3Input
          label="scale"
          value={anchor.transform.scale}
          onChange={(scale) =>
            updateAnchor({
              ...anchor,
              transform: { ...anchor.transform, scale },
            })
          }
        />

        {anchor.type === AnchorType.Zone && (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Space wrap>
              <Text strong>detection</Text>
              <Select
                size="small"
                style={{ width: 120 }}
                value={anchor.detection}
                aria-label={`${definition.key} zone detection`}
                onChange={(detection) => updateAnchor({ ...anchor, detection })}
                options={ALL_ZONE_DETECTION_TYPES.map((type) => ({
                  value: type,
                  label: type,
                }))}
              />
              <Text strong>radius</Text>
              <InputNumber
                size="small"
                min={0.1}
                step={0.1}
                value={anchor.radius}
                aria-label={`${definition.key} zone radius`}
                onChange={(radius) =>
                  updateAnchor({ ...anchor, radius: radius ?? 0.1 })
                }
              />
              <Checkbox
                checked={anchor.show_vfx}
                onChange={(event) =>
                  updateAnchor({ ...anchor, show_vfx: event.target.checked })
                }
              >
                show vfx
              </Checkbox>
            </Space>
            <ColorInput
              label="color"
              value={anchor.color}
              onChange={(color) => updateAnchor({ ...anchor, color })}
            />
          </Space>
        )}
      </Space>
    </Card>
  );
};
