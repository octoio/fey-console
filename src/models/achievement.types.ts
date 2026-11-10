import { EntityReference, Metadata } from "./common.types";

/** The flags a quest grants and requires (achievement.atd `achievement_type`). */
export type AchievementType =
  | "None"
  | "SlimeExterminator"
  | "BoarDefender"
  | "ActTwoCleared";

export const ALL_ACHIEVEMENT_TYPES: AchievementType[] = [
  "None",
  "SlimeExterminator",
  "BoarDefender",
  "ActTwoCleared",
];

export enum AchievementOp {
  Ge = "Ge",
  Le = "Le",
  Eq = "Eq",
}

/** Lifetime: every run so far plus the current one. Run: the current run only. */
export enum AchievementScope {
  Lifetime = "Lifetime",
  Run = "Run",
}

export enum AchievementConditionType {
  Stat = "Stat",
  All = "All",
  Any = "Any",
}

/**
 * A ledger metric compared to a value. `key` is a metric id of the Rust ledger registry; `subject`
 * names an entity (a character, skill or quest), `subject_tag` the subject of the metrics that have
 * no entity (a monster rank, a tier).
 */
export type AchievementConditionStat = {
  type: AchievementConditionType.Stat;
  key: string;
  subject?: EntityReference;
  subject_tag?: string;
  op: AchievementOp;
  value: number; // min 0
  scope: AchievementScope;
};

export type AchievementConditionAll = {
  type: AchievementConditionType.All;
  children: AchievementCondition[]; // min 1
};

export type AchievementConditionAny = {
  type: AchievementConditionType.Any;
  children: AchievementCondition[]; // min 1
};

export type AchievementCondition =
  | AchievementConditionStat
  | AchievementConditionAll
  | AchievementConditionAny;

export enum UnlockKind {
  ItemPool = "ItemPool",
  WeaponClass = "WeaponClass",
  SkillPool = "SkillPool",
  Tier = "Tier",
}

/** One entry an achievement adds to a drop pool, or the tier it opens in the lobby. */
export type Unlock = {
  kind: UnlockKind;
  target: EntityReference;
};

/** Earned when `condition` holds over a player's stat ledger; it only unlocks options. */
export type Achievement = {
  metadata: Metadata;
  /** The client lists it only once earned. */
  hidden: boolean;
  condition: AchievementCondition;
  /** May be empty: the achievement is then a trophy only. */
  rewards: Unlock[];
};

export type AchievementEntityDefinition = {
  id: string;
  owner: string;
  type: string;
  key: string;
  version: number;
  entity: Achievement;
};

export const ALL_ACHIEVEMENT_OPS: AchievementOp[] =
  Object.values(AchievementOp);
export const ALL_ACHIEVEMENT_SCOPES: AchievementScope[] =
  Object.values(AchievementScope);
export const ALL_ACHIEVEMENT_CONDITION_TYPES: AchievementConditionType[] =
  Object.values(AchievementConditionType);
export const ALL_UNLOCK_KINDS: UnlockKind[] = Object.values(UnlockKind);
