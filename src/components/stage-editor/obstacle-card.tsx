import { Button, Card, Checkbox, InputNumber, Select, Space, Tag, Typography } from "antd";
import React from "react";
import {
  ALL_OBSTACLE_KINDS,
  ALL_OBSTACLE_SHAPES,
  createDefaultObstacle,
  Obstacle,
  ObstacleKind,
  ObstacleShape,
} from "@models/stage.types";

const { Text } = Typography;

interface ObstacleCardProps {
  index: number;
  obstacle: Obstacle;
  onChange: (obstacle: Obstacle) => void;
  onRemove: () => void;
}

export const ObstacleCard: React.FC<ObstacleCardProps> = ({
  index,
  obstacle,
  onChange,
  onRemove,
}) => {
  const label = `obstacle ${index}`;

  const number = (
    field: "x" | "z" | "radius" | "half_x" | "half_z" | "yaw",
    min?: number,
  ) => (
    <InputNumber
      key={field}
      size="small"
      min={min}
      prefix={<Text type="secondary">{field}</Text>}
      value={obstacle[field]}
      aria-label={`${label} ${field}`}
      onChange={(next) => onChange({ ...obstacle, [field]: next ?? 0 })}
    />
  );

  // Changing the shape swaps the shape fields and keeps the kind, place and sight flag
  const handleShapeChange = (shape: ObstacleShape) => {
    const base = createDefaultObstacle(shape);
    onChange({
      ...base,
      kind: obstacle.kind,
      x: obstacle.x,
      z: obstacle.z,
      blocks_sight: obstacle.blocks_sight,
    });
  };

  return (
    <Card
      size="small"
      title={
        <Space>
          <Text strong>{label}</Text>
          <Tag color="green">{obstacle.kind}</Tag>
        </Space>
      }
      extra={
        <Button danger size="small" onClick={onRemove}>
          Remove
        </Button>
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
        <Select
          size="small"
          style={{ width: 100 }}
          value={obstacle.shape}
          aria-label={`${label} shape`}
          onChange={handleShapeChange}
          options={ALL_OBSTACLE_SHAPES.map((shape) => ({
            value: shape,
            label: shape,
          }))}
        />
        {number("x")}
        {number("z")}
        {obstacle.shape === ObstacleShape.Circle ? (
          number("radius", 0.01)
        ) : (
          <>
            {number("half_x", 0.01)}
            {number("half_z", 0.01)}
            {number("yaw")}
          </>
        )}
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
};
