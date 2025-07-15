import { Color, EntityReference, Metadata, Vector3 } from "./common.types";
import { StatSheet } from "./stat.types";

export enum CharacterType {
  Adventurer = "Adventurer",
  Slime = "Slime",
  Boar = "Boar",
}

export const ALL_CHARACTER_TYPES: CharacterType[] =
  Object.values(CharacterType).sort();

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
};

export type CharacterEntityDefinition = {
  id: string;
  owner: string;
  type: string;
  key: string;
  version: number;
  entity: Character;
};
