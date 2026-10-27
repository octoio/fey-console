import { Button, Card, Checkbox, Input, InputNumber, Select, Space, Tag, Typography } from "antd";
import React from "react";
import {
  ALL_ANCHOR_TYPES,
  ALL_ZONE_DETECTION_TYPES,
  Anchor,
  AnchorEntityDefinition,
  AnchorType,
  createDefaultAnchor,
} from "@models/anchor.types";
import { ALL_ANCHOR_SLOTS, AnchorSlot } from "@models/generator.types";
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
      binding: anchor.binding,
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

        <Space wrap>
          <Text strong>binding</Text>
          <Select
            size="small"
            style={{ width: 150 }}
            allowClear
            placeholder="none"
            value={anchor.binding?.slot}
            aria-label={`${definition.key} binding slot`}
            onChange={(slot: AnchorSlot | undefined) =>
              updateAnchor({
                ...anchor,
                binding: slot
                  ? { ...(anchor.binding ?? {}), slot }
                  : undefined,
              })
            }
            options={ALL_ANCHOR_SLOTS.map((slot) => ({ value: slot, label: slot }))}
          />
          {anchor.binding && !anchor.binding.every && (
            <InputNumber
              size="small"
              min={0}
              prefix={<Text type="secondary">ordinal</Text>}
              value={anchor.binding.ordinal}
              placeholder="0"
              aria-label={`${definition.key} binding ordinal`}
              onChange={(ordinal) =>
                updateAnchor({
                  ...anchor,
                  binding: {
                    ...anchor.binding!,
                    ordinal: ordinal ?? undefined,
                  },
                })
              }
            />
          )}
          {anchor.binding && (
            <Checkbox
              checked={anchor.binding.every ?? false}
              aria-label={`${definition.key} binding every`}
              onChange={(event) =>
                updateAnchor({
                  ...anchor,
                  binding: {
                    slot: anchor.binding!.slot,
                    ...(event.target.checked ? { every: true } : {}),
                  },
                })
              }
            >
              every
            </Checkbox>
          )}
        </Space>

        {(anchor.type === AnchorType.LampPost ||
          anchor.type === AnchorType.HealingShrine) && (
          <Space wrap>
            <Text strong>model</Text>
            <Input
              size="small"
              style={{ width: 200 }}
              value={anchor.model}
              aria-label={`${definition.key} ${
                anchor.type === AnchorType.LampPost ? "lamp post" : "shrine"
              } model`}
              onChange={(event) =>
                updateAnchor({ ...anchor, model: event.target.value })
              }
            />
            {anchor.type === AnchorType.HealingShrine && (
              <>
                <Text strong>price</Text>
                <InputNumber
                  size="small"
                  min={1}
                  precision={0}
                  value={anchor.price}
                  aria-label={`${definition.key} shrine price`}
                  onChange={(price) =>
                    updateAnchor({ ...anchor, price: price ?? 1 })
                  }
                />
              </>
            )}
          </Space>
        )}

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
