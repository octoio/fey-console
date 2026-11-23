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
  Cone = "Cone",
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

/** A wedge with its tip on the caster: `angle` is the full opening in degrees (1..360). `behind` turns the axis round. */
export type EffectTargetMechanicCone = EffectTargetMechanic & {
  type: EffectTargetMechanicType.Cone;
  hit_count: number;
  radius: number;
  angle: number;
  behind?: boolean;
};

export type EffectTargetMechanicInternal =
  | EffectTargetMechanicSelf
  | EffectTargetMechanicTeam
  | EffectTargetMechanicSelected
  | EffectTargetMechanicCircle
  | EffectTargetMechanicRectangle
  | EffectTargetMechanicCone;

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

/** A damage bonus on a weak target: below `below` of its maximum health (in (0, 1]) the hit deals `factor` times the damage. */
export type ExecuteBonus = {
  below: number;
  factor: number;
};

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
  /** Damage only: the hit multiplies on a target below a health fraction. */
  execute?: ExecuteBonus;
  /** Damage only: units a surviving target is pushed away from the caster (positive). */
  knockback?: number;
  /** Damage only, not with a knockback: units a surviving target is dragged towards water (positive). */
  pull?: number;
  /** Damage only: mana the caster gets for each target the hit lands on (positive). */
  mana_on_hit?: number;
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
