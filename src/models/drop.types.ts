import { MonsterRank } from "./character.types";
import { EntityReference, IntRange, Metadata } from "./common.types";
import { QualityType } from "./quality.types";
import { RequirementEvaluation } from "./requirement.types";

export enum DropType {
  Gold = "Gold",
  Equipment = "Equipment",
  Weapon = "Weapon",
  Skill = "Skill",
  SkillBook = "SkillBook",
}

export const ALL_DROP_TYPES: DropType[] = Object.values(DropType);

/**
 * Restricts an item entry to stronger monsters. A monster below `min_rank` (but not below
 * `min_level`) can still drop the entry at weight `lower_rank_weight`; without it the rank is a
 * hard gate.
 */
export type DropGate = {
  min_level?: number;
  /** The quest tier (QuestTier order) the quest must be played at. */
  min_tier?: number;
  min_rank?: MonsterRank;
  lower_rank_weight?: number;
};

export type GoldDrop = {
  type: DropType.Gold;
  weight: number; // min 1
  amount: IntRange; // 1..1000
};

export type EquipmentDrop = {
  type: DropType.Equipment;
  weight: number; // min 1
  equipment: EntityReference; // Equipment
  gate?: DropGate;
};

export type WeaponDrop = {
  type: DropType.Weapon;
  weight: number; // min 1
  weapon: EntityReference; // Weapon
  gate?: DropGate;
};

export type SkillDrop = {
  type: DropType.Skill;
  weight: number; // min 1
  skill: EntityReference; // Skill
};

export type SkillBookDrop = {
  type: DropType.SkillBook;
  weight: number; // min 1
  skill_book: EntityReference; // SkillBook
  gate?: DropGate;
};

export type Drop =
  | GoldDrop
  | EquipmentDrop
  | WeaponDrop
  | SkillDrop
  | SkillBookDrop;

/** Relative weights of the rarity tiers for the item drops of a table (only the sum must be positive). */
export type RarityWeights = {
  common: number;
  uncommon: number;
  rare: number;
  epic: number;
  legendary: number;
};

/** The weight of tier i (Common = 0 ... Legendary = 4) is multiplied by (1 + tilt)^i. */
export type RarityCurve = {
  weights: RarityWeights;
  per_level?: number;
  elite_tilt?: number;
  boss_tilt?: number;
};

/** A monster of at least `min_rank` always drops one item of `kind` of at least `min_quality`. */
export type DropGuarantee = {
  min_rank: MonsterRank;
  kind: DropType; // Equipment, Weapon or SkillBook
  min_quality: QualityType;
};

/** Gold grows with the killed monster's level and rank; absent fields add nothing. */
export type GoldScaling = {
  per_level?: number;
  elite?: number;
  boss?: number;
};

/** Poll (default): need / greed / pass. Everyone: a copy each. Individual: one player per item. */
export enum LootDistribution {
  Poll = "Poll",
  Everyone = "Everyone",
  Individual = "Individual",
}

export const ALL_LOOT_DISTRIBUTIONS: LootDistribution[] =
  Object.values(LootDistribution);

export type DropEvaluation = {
  operator: RequirementEvaluation;
  drops: Drop[];
};

export type DropTable = {
  metadata: Metadata;
  gold_drops: Drop[];
  equipment_drops: Drop[];
  weapon_drops: Drop[];
  skill_book_drops: Drop[];
  /** Absent: items are picked by entry weight alone. */
  rarity_curve?: RarityCurve;
  guarantees?: DropGuarantee[];
  /** Absent: gold amounts are not scaled. */
  gold_scaling?: GoldScaling;
  /** Absent: Poll. */
  distribution?: LootDistribution;
  /** Each eligible player beyond the first multiplies the chance of every item category by 1 + this. */
  party_scaling?: number;
};

export type DropTableEntityDefinition = {
  id: string;
  owner: string;
  type: string;
  key: string;
  version: number;
  entity: DropTable;
};
