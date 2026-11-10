import { EntityReference, EntityType, FloatRange, IntRange } from "./common.types";
import { Spawn } from "./spawn.types";
import { StatusDuration } from "./status.types";

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
  Healing = "Healing",
  Lever = "Lever",
  GatePack = "GatePack",
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
  Swamp = "Swamp",
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
  maze?: boolean; // loops may end in the entrance and the boss arena and join main-path rooms only
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

// The pack that appears when the locked gate opens, at the anchor bound to the GatePack slot.
export interface LockedGate {
  wake: Spawn[]; // min 1
}

// Gates of a generated crypt: shortcuts closes every loop with a far-side gate and a lever; locked
// puts one gate before the boss.
export interface GateRules {
  shortcuts: boolean;
  locked?: LockedGate;
}

// Who a ground effect lands on: Walkers (characters that do not swim), Swimmers or Everyone.
export enum GroundEffectWho {
  Walkers = "Walkers",
  Swimmers = "Swimmers",
  Everyone = "Everyone",
}

export const ALL_GROUND_EFFECT_WHOS: GroundEffectWho[] =
  Object.values(GroundEffectWho);

// A status a ground zone gives to the characters inside it: on entering, then every `period` seconds.
export interface GroundEffect {
  status: EntityReference; // Status
  who: GroundEffectWho;
  period: number; // min 0.1
  durations: StatusDuration[];
  magnitude: number;
  path_cost?: number; // added to the path cost of a unit of walking in the zone; absent = nothing
}

// What the water of a generated layout does to the characters in it.
export interface WaterRules {
  effects: GroundEffect[]; // min 1
}

export const createDefaultGroundEffect = (): GroundEffect => ({
  status: { id: "", key: "", owner: "Octoio", type: EntityType.Status, version: 1 },
  who: GroundEffectWho.Everyone,
  period: 1,
  durations: [],
  magnitude: 0,
});

export const createDefaultWaterRules = (): WaterRules => ({
  effects: [createDefaultGroundEffect()],
});

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
  gates?: GateRules;
  sewer?: WaterRules; // turns a Crypt into a sewer
  water?: WaterRules; // the water of a Forest or a Swamp
  seed_policy: SeedPolicy;
  fixed_seed?: number;
}

export interface AnchorBinding {
  slot: AnchorSlot;
  ordinal?: number; // default 0
  every?: boolean; // template: one anchor per slot in the layout (ordinal must be absent)
  min_count?: number; // only with every: a layout with fewer anchors of the slot is rejected
}

// The generator version the data is tuned for (fey_core::mapgen::GENERATOR_VERSION)
export const GENERATOR_VERSION = 13;

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
