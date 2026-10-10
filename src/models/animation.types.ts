import { EntityReference, Metadata } from "./common.types";

/**
 * Fey-owned, engine-agnostic presentation cues. Each engine adapter maps a cue
 * (plus its variant) to its own clips; data never names an engine asset.
 */
export enum AnimationCue {
  AttackGeneric = "AttackGeneric",
  AttackUnarmed = "AttackUnarmed",
  AttackStab = "AttackStab",
  AttackSlash = "AttackSlash",
  AttackThrust = "AttackThrust",
  AttackCrush = "AttackCrush",
  AttackWand = "AttackWand",
  AttackShield = "AttackShield",
  AttackDual = "AttackDual",
  AttackTwoHandSlash = "AttackTwoHandSlash",
  AttackTwoHandChop = "AttackTwoHandChop",
  AttackTwoHandThrust = "AttackTwoHandThrust",
  AttackTwoHandStaff = "AttackTwoHandStaff",
  CastBuff = "CastBuff",
  CastArea = "CastArea",
  CastSummon = "CastSummon",
  CastAttack = "CastAttack",
  CastChannel = "CastChannel",
  HitBlocked = "HitBlocked",
}

export const ALL_ANIMATION_CUES: AnimationCue[] = Object.values(AnimationCue);

export type AnimationSource = {
  cue: AnimationCue;
  /** 0-based alternative of the same cue; adapters wrap when they own fewer. */
  variant: number;
  original_duration: number;
  looping: boolean;
  requires_sheath_weapon: boolean;
};

export type Animation = {
  metadata: Metadata;
  duration: number;
  sources: EntityReference[];
};
