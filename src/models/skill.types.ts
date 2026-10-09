import { EntityReference, FloatRange, Metadata, Vector3 } from "./common.types";
import { HitEffect, StatusEffect } from "./effect.types";
import { SkillExperience } from "./progression.types";
import { QualityType } from "./quality.types";
import { RequirementEvaluation } from "./requirement.types";
import { Trigger } from "./trigger.types";

export enum SkillCategory {
  None = "None",
  All = "All",
  Offense = "Offense",
  Defense = "Defense",
  Utility = "Utility",
  Healing = "Healing",
  Control = "Control",
  Mobility = "Mobility",
}

export type SkillCost = {
  mana: number;
};

export enum SkillTargetType {
  Self = "Self",
  Ally = "Ally",
  Enemy = "Enemy",
  Any = "Any",
  Position = "Position",
  None = "None",
}

export enum SkillActionNodeType {
  Sequence = "Sequence",
  Parallel = "Parallel",
  Delay = "Delay",
  Animation = "Animation",
  Sound = "Sound",
  Hit = "Hit",
  Status = "Status",
  Summon = "Summon",
  Projectile = "Projectile",
  Move = "Move",
  Requirement = "Requirement",
}

export type SkillActionNode = {
  type: SkillActionNodeType;
  name: string;
};

export type SkillActionSequenceNode = SkillActionNode & {
  type: SkillActionNodeType.Sequence;
  children: SkillActionNode[];
  loop: number;
};

export type SkillActionParallelNode = SkillActionNode & {
  type: SkillActionNodeType.Parallel;
  children: SkillActionNode[];
  loop: number;
};

export type SkillActionDelayNode = SkillActionNode & {
  type: SkillActionNodeType.Delay;
  delay: number;
};

export type SkillActionAnimationNode = SkillActionNode & {
  type: SkillActionNodeType.Animation;
  show_progress: boolean;
  duration: number;
  animations: EntityReference[];
};

export type SkillActionSoundNode = SkillActionNode & {
  type: SkillActionNodeType.Sound;
  sound: EntityReference;
};

export type SkillActionHitEffectNode = SkillActionNode & {
  type: SkillActionNodeType.Hit;
  hit_effect: HitEffect;
};

export type SkillActionStatusEffectNode = SkillActionNode & {
  type: SkillActionNodeType.Status;
  status_effect: StatusEffect;
};

export type SkillActionSummonNode = SkillActionNode & {
  type: SkillActionNodeType.Summon;
  summon_entity: EntityReference;
  position_offset: Vector3;
  /** Seconds the summon lives; absent = until it dies or its summoner does. */
  lifetime?: number;
  /** How many summons of this entity one summoner may have alive. */
  max_alive?: number;
  /** The summoner steers the summon for its lifetime while its body idles. */
  controlled?: boolean;
};

export enum SkillMoveMode {
  Dash = "Dash",
  Blink = "Blink",
  ShadowStep = "ShadowStep",
  Swap = "Swap",
}

/**
 * Moves the caster. Dash: `distance` units over `duration` s, through bodies (needs both > 0).
 * Blink and ShadowStep: instant, `distance` is the range (duration 0). Swap: trades places with
 * the target (both 0).
 */
export type SkillActionMoveNode = SkillActionNode & {
  type: SkillActionNodeType.Move;
  mode: SkillMoveMode;
  distance: number;
  duration: number;
};

export enum ProjectileSpawnPositionType {
  Character = "Character",
  World = "World",
}

export type ProjectileSpawnPosition = {
  type: ProjectileSpawnPositionType;
  position: Vector3;
  offset: Vector3;
};

export type SkillActionProjectileNode = SkillActionNode & {
  type: SkillActionNodeType.Projectile;
  projectile: EntityReference;
  spawn_position: ProjectileSpawnPosition;
  direction: Vector3;
};

export type SkillActionRequirementNode = SkillActionNode & {
  type: SkillActionNodeType.Requirement;
  requirements: RequirementEvaluation;
  child: SkillActionNode;
};

export enum SkillIndicatorPosition {
  Character = "Character",
  Mouse = "Mouse",
  FromCharacterToMouse = "FromCharacterToMouse",
}

export type SkillIndicator = {
  model_reference: EntityReference;
  position: SkillIndicatorPosition;
  scale: Vector3;
};

export type Skill = {
  metadata: Metadata;
  quality: QualityType;
  icon_reference: EntityReference;
  categories: SkillCategory[];
  cost: SkillCost;
  cooldown: number;
  target_type: SkillTargetType;
  execution_root: SkillActionNode;
  cast_distance: FloatRange;
  indicators: SkillIndicator[];
  /** Skill XP earned on use and how the level scales the skill; absent = no XP. */
  experience?: SkillExperience;
  /** true: the caster cannot walk from the start of the cast until it completes or is cancelled. */
  root_while_casting?: boolean;
  /** true: casting this skill cancels the cast in progress (a dash). */
  cancels_cast?: boolean;
  /** How many casts can be stocked; one charge comes back every cooldown. Absent = 1. */
  charges?: number;
  /** Fire while the character knows the skill. */
  triggers?: Trigger[];
};

export type SkillEntityDefinition = {
  id: string;
  owner: string;
  type: string;
  key: string;
  version: number;
  entity: Skill;
};
export const ALL_SKILL_CATEGORIES: SkillCategory[] =
  Object.values(SkillCategory).sort();

export const ALL_SKILL_TARGET_TYPES: SkillTargetType[] =
  Object.values(SkillTargetType).sort();

export const ALL_SKILL_ACTION_NODE_TYPES: SkillActionNodeType[] =
  Object.values(SkillActionNodeType).sort();

export const ALL_SKILL_MOVE_MODES: SkillMoveMode[] =
  Object.values(SkillMoveMode).sort();

export const ALL_SKILL_INDICATOR_POSITIONS: SkillIndicatorPosition[] =
  Object.values(SkillIndicatorPosition).sort();

export const ALL_PROJECTILE_SPAWN_POSITION_TYPES: ProjectileSpawnPositionType[] =
  Object.values(ProjectileSpawnPositionType).sort();
