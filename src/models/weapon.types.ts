import { StatAffix } from "./affix.types";
import { EntityReference, IntRange, Metadata } from "./common.types";
import { ModelAnchorSet } from "./model.types";
import { QualityType } from "./quality.types";

export enum WeaponCategory {
  None = "None",
  OneHandMace = "OneHandMace",
  TwoHandMace = "TwoHandMace",
  OneHandAxe = "OneHandAxe",
  TwoHandAxe = "TwoHandAxe",
  OneHandSword = "OneHandSword",
  TwoHandSword = "TwoHandSword",
  Dagger = "Dagger",
  Fist = "Fist",
  Bow = "Bow",
  Staff = "Staff",
  Wand = "Wand",
  Shield = "Shield",
}

export const ALL_WEAPON_CATEGORIES: WeaponCategory[] =
  Object.values(WeaponCategory).sort();

export enum WeaponEquipIndex {
  MainHand = "MainHand",
  OffHand = "OffHand",
  TwoHand = "TwoHand",
}

export const ALL_WEAPON_EQUIP_INDICES: WeaponEquipIndex[] =
  Object.values(WeaponEquipIndex).sort();

export enum WeaponSheatheLocation {
  Hips = "Hips",
  Back = "Back",
}

export const ALL_WEAPON_SHEATHE_LOCATIONS: WeaponSheatheLocation[] =
  Object.values(WeaponSheatheLocation).sort();

export type Weapon = {
  metadata: Metadata;
  category: WeaponCategory;
  quality: QualityType;
  sheathe_location: WeaponSheatheLocation;
  icon_reference: EntityReference;
  base_stat_affixes: StatAffix[];
  random_stat_affix_count: IntRange;
  random_stat_affixes: StatAffix[];
  basic_attack?: EntityReference;
  model_anchor_set: ModelAnchorSet;
};

export type WeaponEntityDefinition = {
  id: string;
  owner: string;
  type: string;
  key: string;
  version: number;
  entity: Weapon;
};
