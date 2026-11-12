import { Input, InputNumber, Space, Typography } from "antd";
import React from "react";
import { AnchorMerchant } from "@models/anchor.types";

const { Text } = Typography;

const TIERS = ["common", "uncommon", "rare", "epic", "legendary"] as const;

type Tiers = Record<(typeof TIERS)[number], number>;

interface TierInputsProps {
  label: string;
  value: Tiers;
  min: number;
  onChange: (value: Tiers) => void;
}

/** One number per rarity tier (the price chart, a table of weights). */
const TierInputs: React.FC<TierInputsProps> = ({ label, value, min, onChange }) => (
  <Space wrap>
    <Text strong>{label}</Text>
    {TIERS.map((tier) => (
      <InputNumber
        key={tier}
        size="small"
        min={min}
        precision={0}
        prefix={<Text type="secondary">{tier}</Text>}
        value={value[tier]}
        aria-label={`${label} ${tier}`}
        onChange={(next) => onChange({ ...value, [tier]: next ?? min })}
      />
    ))}
  </Space>
);

interface MerchantFieldsProps {
  anchor: AnchorMerchant;
  onChange: (anchor: AnchorMerchant) => void;
}

export const MerchantFields: React.FC<MerchantFieldsProps> = ({ anchor, onChange }) => (
  <Space direction="vertical" style={{ width: "100%" }}>
    <Space wrap>
      <Text strong>model</Text>
      <Input
        size="small"
        style={{ width: 200 }}
        value={anchor.model}
        aria-label="merchant model"
        onChange={(event) => onChange({ ...anchor, model: event.target.value })}
      />
      <Text strong>sell fraction</Text>
      <InputNumber
        size="small"
        min={0}
        max={1}
        step={0.05}
        value={anchor.sell_fraction}
        aria-label="merchant sell fraction"
        onChange={(next) => onChange({ ...anchor, sell_fraction: next ?? 0 })}
      />
      <Text strong>commission price</Text>
      <InputNumber
        size="small"
        min={1}
        precision={0}
        value={anchor.commission_price}
        aria-label="merchant commission price"
        onChange={(next) => onChange({ ...anchor, commission_price: next ?? 1 })}
      />
    </Space>
    <TierInputs
      label="price"
      min={1}
      value={anchor.prices}
      onChange={(prices) => onChange({ ...anchor, prices })}
    />
    <Space wrap>
      <Text strong>stock size</Text>
      <InputNumber
        size="small"
        min={1}
        precision={0}
        value={anchor.stock.size}
        aria-label="merchant stock size"
        onChange={(size) =>
          onChange({ ...anchor, stock: { ...anchor.stock, size: size ?? 1 } })
        }
      />
      {(["equipment", "weapon"] as const).map((kind) => (
        <InputNumber
          key={kind}
          size="small"
          min={0}
          precision={0}
          prefix={<Text type="secondary">{kind}</Text>}
          value={anchor.stock.kinds[kind]}
          aria-label={`merchant stock kind ${kind}`}
          onChange={(next) =>
            onChange({
              ...anchor,
              stock: {
                ...anchor.stock,
                kinds: { ...anchor.stock.kinds, [kind]: next ?? 0 },
              },
            })
          }
        />
      ))}
    </Space>
    <TierInputs
      label="stock rarity"
      min={0}
      value={anchor.stock.rarity}
      onChange={(rarity) =>
        onChange({ ...anchor, stock: { ...anchor.stock, rarity } })
      }
    />
    <TierInputs
      label="showcase rarity"
      min={0}
      value={anchor.showcase.rarity}
      onChange={(rarity) => onChange({ ...anchor, showcase: { rarity } })}
    />
  </Space>
);
