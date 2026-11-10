import { StatAffix } from "./affix.types";
import { EntityReference, IntRange, Metadata } from "./common.types";
import { QualityType } from "./quality.types";
import { Trigger } from "./trigger.types";
import { VisualLayer } from "./weapon-class.types";

export enum EquipmentCategory {
  Head = "Head",
  Eyes = "Eyes",
  Earings = "Earings",
  FaceAccessory = "FaceAccessory",
  Back = "Back",
  Neck = "Neck",
  Shoulders = "Shoulders",
  Bracers = "Bracers",
  Hands = "Hands",
  Ring = "Ring",
  Chest = "Chest",
  Waist = "Waist",
  Legs = "Legs",
  Feet = "Feet",
}

export const ALL_EQUIPMENT_CATEGORIES: EquipmentCategory[] =
  Object.values(EquipmentCategory);

export type Equipment = {
  metadata: Metadata;
  category: EquipmentCategory;
  quality: QualityType;
  icon_reference: EntityReference; // Image
  base_stat_affixes: StatAffix[];
  random_stat_affix_count: IntRange; // 0..100
  random_stat_affixes: StatAffix[];
  /** Fire on something happening to the wearer while the item is worn. */
  triggers?: Trigger[];
  /** Character level needed to equip it (absent: any; min 2). */
  min_level?: number;
  /** The look layer shown for it; it replaces the base layer of the category's slot. */
  visual?: VisualLayer;
};

export type EquipmentEntityDefinition = {
  id: string;
  owner: string;
  type: string;
  key: string;
  version: number;
  entity: Equipment;
};
