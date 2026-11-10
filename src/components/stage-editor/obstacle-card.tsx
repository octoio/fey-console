import { Button, Card, Checkbox, Select, Space, Tag, Typography } from "antd";
import React from "react";
import { ALL_OBSTACLE_KINDS, Obstacle, ObstacleKind } from "@models/stage.types";
import { ShapeInputs } from "./shape-inputs";

const { Text } = Typography;

interface ObstacleCardProps {
  index: number;
  obstacle: Obstacle;
  onChange: (obstacle: Obstacle) => void;
  onRemove?: () => void; // absent: the obstacle belongs to something else (a gate) and is not removed alone
  label?: string; // default "obstacle <index>"; what the controls are named
}

export const ObstacleCard: React.FC<ObstacleCardProps> = ({
  index,
  obstacle,
  onChange,
  onRemove,
  label = `obstacle ${index}`,
}) => (
  <Card
    size="small"
    title={
      <Space>
        <Text strong>{label}</Text>
        <Tag color="green">{obstacle.kind}</Tag>
      </Space>
    }
    extra={
      onRemove && (
        <Button danger size="small" onClick={onRemove}>
          Remove
        </Button>
      )
    }
  >
    <Space wrap>
      <Select
        size="small"
        style={{ width: 110 }}
        value={obstacle.kind}
        aria-label={`${label} kind`}
        onChange={(kind: ObstacleKind) => onChange({ ...obstacle, kind })}
        options={ALL_OBSTACLE_KINDS.map((kind) => ({
          value: kind,
          label: kind,
        }))}
      />
      <ShapeInputs label={label} value={obstacle} onChange={onChange} />
      <Checkbox
        checked={obstacle.blocks_sight ?? true}
        aria-label={`${label} blocks sight`}
        onChange={(event) =>
          onChange({
            ...obstacle,
            blocks_sight: event.target.checked ? undefined : false,
          })
        }
      >
        blocks sight
      </Checkbox>
    </Space>
  </Card>
);
