import {
  EntityReference,
  FloatRange,
  HitType,
  Metadata,
  Vector3,
} from "./common.types";
import { QualityType } from "./quality.types";
import { RequirementEvaluation } from "./requirement.types";
import { StatType } from "./stat.types";
import { StatusDuration } from "./status.types";

export enum SkillCategory {
  None = "None",
  All = "All",
  Offense = "Offense",
  Defense = "Defense",
  Utility = "Utility",
  Healing = "Healing",
}

export type SkillCost = {
  mana: number;
};

export enum SkillEffectTargetMechanicType {
  Self = "Self",
  Team = "Team",
  Selected = "Selected",
  Circle = "Circle",
  Rectangle = "Rectangle",
}

export enum CharacterTeam {
  Ally = "Ally",
  Enemy = "Enemy",
  Neutral = "Neutral",
}

export type SkillEffectTargetMechanic = {
  type: SkillEffectTargetMechanicType;
};

export type SkillEffectTargetMechanicSelf = SkillEffectTargetMechanic & {
  type: SkillEffectTargetMechanicType.Self;
};

export type SkillEffectTargetMechanicTeam = SkillEffectTargetMechanic & {
  type: SkillEffectTargetMechanicType.Team;
  team: CharacterTeam;
};

export type SkillEffectTargetMechanicSelected = SkillEffectTargetMechanic & {
  type: SkillEffectTargetMechanicType.Selected;
};

export type SkillEffectTargetMechanicCircle = SkillEffectTargetMechanic & {
  type: SkillEffectTargetMechanicType.Circle;
  hit_count: number;
  radius: number;
};

export type SkillEffectTargetMechanicRectangle = SkillEffectTargetMechanic & {
  type: SkillEffectTargetMechanicType.Rectangle;
  hit_count: number;
  width: number;
  height: number;
};

export enum SkillEffectTarget {
  Ally = "Ally",
  Enemy = "Enemy",
  Any = "Any",
}

export type SkillEffectScaling = {
  base: number;
  scaling: FloatRange;
  stat: StatType;
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

export type HitEffect = {
  hit_type: HitType;
  scalers: SkillEffectScaling[];
  target_mechanic: SkillEffectTargetMechanic;
  target: SkillEffectTarget;
  hit_sound: EntityReference;
  can_crit: boolean;
  can_miss: boolean;
};

export type StatusEffect = {
  target_mechanic: SkillEffectTargetMechanic;
  target: SkillEffectTarget;
  durations: StatusDuration[];
  scalers: SkillEffectScaling[];
  status: EntityReference;
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

export const ALL_SKILL_EFFECT_TARGET_MECHANIC_TYPES: SkillEffectTargetMechanicType[] =
  Object.values(SkillEffectTargetMechanicType).sort();

export const ALL_CHARACTER_TEAMS: CharacterTeam[] =
  Object.values(CharacterTeam).sort();

export const ALL_SKILL_EFFECT_TARGETS: SkillEffectTarget[] =
  Object.values(SkillEffectTarget).sort();

export const ALL_SKILL_TARGET_TYPES: SkillTargetType[] =
  Object.values(SkillTargetType).sort();

export const ALL_SKILL_ACTION_NODE_TYPES: SkillActionNodeType[] =
  Object.values(SkillActionNodeType).sort();

export const ALL_SKILL_INDICATOR_POSITIONS: SkillIndicatorPosition[] =
  Object.values(SkillIndicatorPosition).sort();
