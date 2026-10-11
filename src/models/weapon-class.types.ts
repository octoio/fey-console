import { EntityReference, Metadata } from "./common.types";
import { WeaponCategory } from "./weapon.types";

// Weapon class entity (weapon_class.atd): maps a family of weapon categories to the animation
// cue played in each animation slot. Each weapon category belongs to exactly one class.
export type AnimationSlot =
  | "Idle"
  | "Walk"
  | "Run"
  | "BasicAttack"
  | "Hit"
  | "Death";

export interface AnimationSetEntry {
  slot: AnimationSlot;
  cue: string;
  variant: string;
}

export interface WeaponClass {
  metadata: Metadata;
  categories: WeaponCategory[];
  animation_set: AnimationSetEntry[];
}

// Presentation layer of a weapon, equipment item or monster (visual.atd).
export interface VisualLayer {
  sheet: string;
  socket?: string;
  sort: number;
  only_for_classes?: EntityReference[];
}
