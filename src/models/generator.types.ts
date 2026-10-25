import { EntityReference, FloatRange, IntRange } from "./common.types";

// Map generation data contract (generator.atd). The generator itself is Rust-only; these types
// are the spec it reads. Optional fields are absent in the JSON, never null.

export enum RoomRole {
  Entrance = "Entrance",
  Combat = "Combat",
  Ambush = "Ambush",
  Rest = "Rest",
  Treasure = "Treasure",
  Objective = "Objective",
  Boss = "Boss",
  Filler = "Filler",
}

export enum AnchorSlot {
  PlayerSpawn = "PlayerSpawn",
  EntryPortal = "EntryPortal",
  PackSpawn = "PackSpawn",
  BossSpawn = "BossSpawn",
  ExitPortal = "ExitPortal",
  Shrine = "Shrine",
  Chest = "Chest",
  ObjectiveZone = "ObjectiveZone",
  TrailSpawn = "TrailSpawn",
  WaterSpawn = "WaterSpawn",
  Cocoon = "Cocoon",
  Marker = "Marker",
}

export enum RoomSize {
  Small = "Small",
  Medium = "Medium",
  Large = "Large",
  Huge = "Huge",
}

export enum PathRule {
  MainPath = "MainPath",
  Branch = "Branch",
  Any = "Any",
}

export enum GeneratorKind {
  Crypt = "Crypt",
  Forest = "Forest",
}

export enum SeedPolicy {
  PerRun = "PerRun",
  Fixed = "Fixed",
}

export enum Facing {
  PosX = "PosX",
  PosZ = "PosZ",
  NegX = "NegX",
  NegZ = "NegZ",
}

export const ALL_ROOM_ROLES: RoomRole[] = Object.values(RoomRole);
export const ALL_ANCHOR_SLOTS: AnchorSlot[] = Object.values(AnchorSlot);
export const ALL_ROOM_SIZES: RoomSize[] = Object.values(RoomSize);
export const ALL_PATH_RULES: PathRule[] = Object.values(PathRule);
export const ALL_GENERATOR_KINDS: GeneratorKind[] = Object.values(GeneratorKind);
export const ALL_SEED_POLICIES: SeedPolicy[] = Object.values(SeedPolicy);
export const ALL_FACINGS: Facing[] = Object.values(Facing);

export interface PlanePoint {
  x: number;
  z: number;
}

export interface RoomPlacement {
  farthest?: boolean;
  min_depth?: number;
  max_depth?: number;
  chokepoint?: boolean;
}

export interface RoomTags {
  max_enemies?: number;
  torches?: boolean;
  min_exits?: number;
}

export interface RoomRequirement {
  role: RoomRole;
  min: number;
  max: number;
  hard?: boolean; // default true
  size: RoomSize;
  placement?: RoomPlacement;
  path?: PathRule; // absent = Any
  min_spacing?: number;
  prefab?: EntityReference; // RoomPrefab
  tags?: RoomTags;
  weight?: number;
}

export interface ConnectionRules {
  main_path: IntRange;
  loops: IntRange;
  dead_ends: boolean;
  branch_len: IntRange;
}

export interface RolePair {
  a: RoomRole;
  b: RoomRole;
}

export interface PinnedPrefab {
  prefab: EntityReference; // RoomPrefab
  role: RoomRole;
  at?: PlanePoint;
  facing?: Facing;
}

export interface ParRule {
  boss_path: FloatRange;
}

export interface GeneratorSpec {
  generator: GeneratorKind;
  version: number;
  requirements: RoomRequirement[];
  connections: ConnectionRules;
  forbidden_adjacent?: RolePair[];
  pinned?: PinnedPrefab[];
  party_size?: number;
  corridor_width?: number;
  fill: RoomRole;
  max_attempts?: number;
  candidates?: number;
  par?: ParRule;
  seed_policy: SeedPolicy;
  fixed_seed?: number;
}

export interface AnchorBinding {
  slot: AnchorSlot;
  ordinal?: number; // default 0
  every?: boolean; // template: one anchor per slot in the layout (ordinal must be absent)
}

export const GENERATOR_VERSION = 2;

export const createDefaultRequirement = (
  role: RoomRole = RoomRole.Combat,
): RoomRequirement => ({ role, min: 1, max: 1, size: RoomSize.Medium });

export const createDefaultGeneratorSpec = (
  kind: GeneratorKind = GeneratorKind.Crypt,
): GeneratorSpec => ({
  generator: kind,
  version: GENERATOR_VERSION,
  requirements: [
    { role: RoomRole.Entrance, min: 1, max: 1, size: RoomSize.Medium },
    {
      role: RoomRole.Boss,
      min: 1,
      max: 1,
      size: RoomSize.Huge,
      path: PathRule.MainPath,
      placement: { farthest: true },
    },
  ],
  connections: {
    main_path: { min: 7, max: 9 },
    loops: { min: 0, max: 1 },
    dead_ends: true,
    branch_len: { min: 1, max: 2 },
  },
  fill: RoomRole.Combat,
  seed_policy: SeedPolicy.PerRun,
});

// Optional fields are dropped when empty so the JSON matches what fey-data expects
export const dropUndefined = <T extends object>(value: T): T =>
  Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined),
  ) as T;
