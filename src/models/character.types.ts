import { Color, EntityReference, Metadata, Vector3 } from "./common.types";
import { StatusEffect } from "./effect.types";
import { LevelGrowth, XpChart } from "./progression.types";
import { StatSheet } from "./stat.types";

export enum CharacterType {
  Adventurer = "Adventurer",
  Slime = "Slime",
  Boar = "Boar",
}

export const ALL_CHARACTER_TYPES: CharacterType[] =
  Object.values(CharacterType).sort();

/** How dangerous a monster is: drop tables gate and tilt their rewards by it. */
export enum MonsterRank {
  Normal = "Normal",
  Elite = "Elite",
  Boss = "Boss",
}

export const ALL_MONSTER_RANKS: MonsterRank[] = Object.values(MonsterRank);

export enum CharacterVariantColorType {
  Primary = "Primary",
  Secondary = "Secondary",
  Tertiary = "Tertiary",
  Other = "Other",
}

export const ALL_CHARACTER_VARIANT_COLOR_TYPES: CharacterVariantColorType[] =
  Object.values(CharacterVariantColorType).sort();

export type CharacterVariantColor = {
  type: CharacterVariantColorType;
  color: Color;
};

export type CharacterVariant = {
  colors: CharacterVariantColor[];
  scale: Vector3;
};

/** After `after` seconds in combat the effects are applied to the monster itself. */
export type Enrage = {
  after: number;
  effects: StatusEffect[];
};

export type Character = {
  metadata: Metadata;
  type: CharacterType;
  variant?: CharacterVariant;
  pivot_offset: Vector3;
  vision_range: number;
  auto_attack: EntityReference;
  skills: EntityReference[];
  stat_sheet: StatSheet;
  drop_table: EntityReference;
  foot_step_sound: EntityReference;
  hit_sound: EntityReference;
  enrage?: Enrage;
  /** Character level curve (default: the game's). */
  xp_chart?: XpChart;
  /** Starting level (default 1). Stats change only through level_growth; scales the XP a kill pays and the damage rule against the opponent's level. */
  level?: number;
  /** Per-level stat growth and level cap. */
  level_growth?: LevelGrowth;
  /** Normal (default), Elite or Boss. */
  rank?: MonsterRank;
  /** true: goes for hostile healers instead of the threat holder. */
  hunts_healers?: boolean;
  /** Equipment (entity references) a new player character wears. */
  starting_equipment?: EntityReference[];
  /** Weapons (entity references) a new player character wields. */
  starting_weapons?: EntityReference[];
};

export type CharacterEntityDefinition = {
  id: string;
  owner: string;
  type: string;
  key: string;
  version: number;
  entity: Character;
};
