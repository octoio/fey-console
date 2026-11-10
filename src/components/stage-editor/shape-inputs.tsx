import { InputNumber, Select, Typography } from "antd";
import { dropUndefined } from "@models/generator.types";
import {
  ALL_OBSTACLE_SHAPES,
  createDefaultObstacle,
  Obstacle,
  ObstacleShape,
} from "@models/stage.types";

const { Text } = Typography;

// What an obstacle and a ground zone share: a circle (radius) or an oriented box (half_x, half_z, yaw)
export type Footprint = Pick<
  Obstacle,
  "shape" | "x" | "z" | "radius" | "half_x" | "half_z" | "yaw"
>;

type ShapeField = "x" | "z" | "radius" | "half_x" | "half_z" | "yaw";

interface ShapeInputsProps<T extends Footprint> {
  label: string; // names the controls: "<label> shape", "<label> x"
  value: T;
  onChange: (value: T) => void;
}

// The shape select and the place and size inputs of a footprint
export const ShapeInputs = <T extends Footprint>({
  label,
  value,
  onChange,
}: ShapeInputsProps<T>) => {
  const number = (field: ShapeField, min?: number) => (
    <InputNumber
      key={field}
      size="small"
      min={min}
      prefix={<Text type="secondary">{field}</Text>}
      value={value[field]}
      aria-label={`${label} ${field}`}
      onChange={(next) => onChange({ ...value, [field]: next ?? 0 })}
    />
  );

  // Changing the shape swaps the size fields and keeps everything else
  const handleShapeChange = (shape: ObstacleShape) => {
    const { radius, half_x, half_z, yaw } = createDefaultObstacle(shape);
    onChange(dropUndefined({ ...value, shape, radius, half_x, half_z, yaw }));
  };

  return (
    <>
      <Select
        size="small"
        style={{ width: 100 }}
        value={value.shape}
        aria-label={`${label} shape`}
        onChange={handleShapeChange}
        options={ALL_OBSTACLE_SHAPES.map((shape) => ({
          value: shape,
          label: shape,
        }))}
      />
      {number("x")}
      {number("z")}
      {value.shape === ObstacleShape.Circle ? (
        number("radius", 0.01)
      ) : (
        <>
          {number("half_x", 0.01)}
          {number("half_z", 0.01)}
          {number("yaw")}
        </>
      )}
    </>
  );
};
