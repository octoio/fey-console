import { Color, EntityReference, Metadata } from "./common.types";

// Obstacle (stage.atd): solid level geometry. The kind is presentation only; the shape decides
// the collision. A circle uses radius; a box uses half_x / half_z (and yaw in degrees).
export enum ObstacleKind {
  Rock = "Rock",
  Tree = "Tree",
  Wall = "Wall",
  Pillar = "Pillar",
  Water = "Water",
  Ruin = "Ruin",
  Crate = "Crate",
  Bush = "Bush",
}

export enum ObstacleShape {
  Circle = "Circle",
  Box = "Box",
}

export const ALL_OBSTACLE_KINDS: ObstacleKind[] = Object.values(ObstacleKind);
export const ALL_OBSTACLE_SHAPES: ObstacleShape[] = Object.values(ObstacleShape);

export interface Obstacle {
  kind: ObstacleKind;
  shape: ObstacleShape;
  x: number;
  z: number;
  radius?: number; // Circle
  half_x?: number; // Box
  half_z?: number; // Box
  yaw?: number; // Box, degrees
  blocks_sight?: boolean; // default true
}

export const createDefaultObstacle = (
  shape: ObstacleShape = ObstacleShape.Circle,
): Obstacle =>
  shape === ObstacleShape.Circle
    ? { kind: ObstacleKind.Rock, shape, x: 0, z: 0, radius: 1 }
    : { kind: ObstacleKind.Wall, shape, x: 0, z: 0, half_x: 1, half_z: 1, yaw: 0 };

// Stage entity (stage.atd): an art scene plus the anchors (gameplay markers) it owns.
export interface Stage {
  metadata: Metadata;
  scene_name: string;
  theme_color: Color;
  thumbnail_reference?: EntityReference; // Image
  anchors: EntityReference[]; // Anchor
  quest?: EntityReference; // Quest
  obstacles?: Obstacle[]; // solid level geometry (optional)
}

export type StageEntityDefinition = {
  id: string;
  owner: string;
  type: string;
  key: string;
  version: number;
  entity: Stage;
};

export const createDefaultStage = (): Stage => ({
  metadata: { title: "", description: "" },
  scene_name: "",
  theme_color: { r: 1, g: 1, b: 1, a: 1 },
  anchors: [],
});
