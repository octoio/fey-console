import { Color, EntityReference, Metadata } from "./common.types";
import { GeneratorSpec, GroundEffect } from "./generator.types";

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
  prop?: string; // prop kind, model key or model id, resolved by the client catalog
}

// Non-colliding scenery named by prop kind, model key or model id.
export interface StageProp {
  prop: string;
  x: number;
  z: number;
  yaw?: number;
  scale?: number;
}

// Which ground a ground zone is. Water slows everyone inside it (unless the character swims);
// Boardwalk is walked like Dry with its own look and footstep sound.
export enum GroundKind {
  Water = "Water",
  Dry = "Dry",
  Boardwalk = "Boardwalk",
}

export const ALL_GROUND_KINDS: GroundKind[] = Object.values(GroundKind);

// A patch of ground: a circle (radius) or an oriented box (half_x, half_z, yaw), like an obstacle.
// Where zones overlap the last one in the list wins; a point no zone covers is dry.
export interface GroundZone {
  id?: string; // unique on the stage; what a gate's drains names
  kind: GroundKind;
  shape: ObstacleShape;
  x: number;
  z: number;
  radius?: number; // Circle
  half_x?: number; // Box
  half_z?: number; // Box
  yaw?: number; // Box, degrees
  effects?: GroundEffect[]; // what the zone does to the characters in it
}

// How a gate opens. Interact: a character uses its lever anchor. FromSide: like Interact, only from
// the side (side_x, side_z) points to. Quest: only a quest action (OpenGate) opens it.
export enum GateOpening {
  Interact = "Interact",
  FromSide = "FromSide",
  Quest = "Quest",
}

export const ALL_GATE_OPENINGS: GateOpening[] = Object.values(GateOpening);

// An obstacle that can leave the level during a stage. It starts closed unless starts_open.
export interface Gate {
  id: string; // unique on the stage; what a quest names
  obstacle: Obstacle;
  starts_open?: boolean;
  opening: GateOpening;
  lever?: EntityReference; // Anchor
  side_x?: number;
  side_z?: number;
  drains?: string[]; // ids of the ground zones that are gone once the gate opens
}

export const createDefaultObstacle = (
  shape: ObstacleShape = ObstacleShape.Circle,
): Obstacle =>
  shape === ObstacleShape.Circle
    ? { kind: ObstacleKind.Rock, shape, x: 0, z: 0, radius: 1 }
    : { kind: ObstacleKind.Wall, shape, x: 0, z: 0, half_x: 1, half_z: 1, yaw: 0 };

export const createDefaultGate = (): Gate => ({
  id: "",
  obstacle: createDefaultObstacle(ObstacleShape.Box),
  opening: GateOpening.Interact,
});

// Stage entity (stage.atd): an art scene plus the anchors (gameplay markers) it owns.
export interface Stage {
  metadata: Metadata;
  scene_name: string;
  theme_color: Color;
  thumbnail_reference?: EntityReference; // Image
  anchors: EntityReference[]; // Anchor
  quest?: EntityReference; // Quest
  obstacles?: Obstacle[]; // solid level geometry (optional)
  decor?: StageProp[]; // non-colliding scenery (optional)
  ground?: GroundZone[]; // ground that is not plain dry floor (optional)
  gates?: Gate[]; // obstacles that can open during the stage (optional)
  generator?: GeneratorSpec; // map generator spec (generator.atd); every anchor then needs a binding
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
