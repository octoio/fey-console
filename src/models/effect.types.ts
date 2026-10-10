import { EntityReference, FloatRange, HitType } from "./common.types";
import { StatType } from "./stat.types";
import { StatusDuration } from "./status.types";

export enum CharacterTeam {
  Ally = "Ally",
  Enemy = "Enemy",
  Neutral = "Neutral",
}

export enum EffectTargetMechanicType {
  Self = "Self",
  Team = "Team",
  Selected = "Selected",
  Circle = "Circle",
  Rectangle = "Rectangle",
}

export type EffectTargetMechanic = {
  type: EffectTargetMechanicType;
};

export type EffectTargetMechanicSelf = EffectTargetMechanic & {
  type: EffectTargetMechanicType.Self;
};

export type EffectTargetMechanicTeam = EffectTargetMechanic & {
  type: EffectTargetMechanicType.Team;
  team: CharacterTeam;
};

export type EffectTargetMechanicSelected = EffectTargetMechanic & {
  type: EffectTargetMechanicType.Selected;
};

export type EffectTargetMechanicCircle = EffectTargetMechanic & {
  type: EffectTargetMechanicType.Circle;
  hit_count: number;
  radius: number;
};

export type EffectTargetMechanicRectangle = EffectTargetMechanic & {
  type: EffectTargetMechanicType.Rectangle;
  hit_count: number;
  width: number;
  height: number;
};

export type EffectTargetMechanicInternal =
  | EffectTargetMechanicSelf
  | EffectTargetMechanicTeam
  | EffectTargetMechanicSelected
  | EffectTargetMechanicCircle
  | EffectTargetMechanicRectangle;

export enum EffectTarget {
  Ally = "Ally",
  Enemy = "Enemy",
  Any = "Any",
}

export type EffectScaling = {
  base: number;
  scaling: FloatRange;
  stat: StatType;
};

// Resistance that mitigates a damage hit: Armor (Physical) or MagicResist (Magical)
export type DamageSchool = "Physical" | "Magical";
export const ALL_DAMAGE_SCHOOLS: DamageSchool[] = ["Physical", "Magical"];

export type HitEffect = {
  hit_type: HitType;
  scalers: EffectScaling[];
  target_mechanic: EffectTargetMechanic;
  target: EffectTarget;
  hit_sound: EntityReference;
  can_crit: boolean;
  can_miss: boolean;
  // Damage and Heal only; absent: each scaler goes to the school of its stat
  school?: DamageSchool;
};

export type StatusEffect = {
  target_mechanic: EffectTargetMechanic;
  target: EffectTarget;
  durations: StatusDuration[];
  scalers: EffectScaling[];
  status: EntityReference;
  /** true: remove the status from the targets instead of applying it (durations and scalers must be empty). */
  dispel?: boolean;
};

export const ALL_CHARACTER_TEAMS: CharacterTeam[] =
  Object.values(CharacterTeam).sort();

export const ALL_EFFECT_TARGET_MECHANIC_TYPES: EffectTargetMechanicType[] =
  Object.values(EffectTargetMechanicType).sort();

export const ALL_EFFECT_TARGETS: EffectTarget[] =
  Object.values(EffectTarget).sort();
