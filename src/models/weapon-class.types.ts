import { AnimationCue } from "./animation.types";
import { Metadata } from "./common.types";
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
  cue: AnimationCue;
  variant: number; // min 0
}

export interface WeaponClass {
  metadata: Metadata;
  categories: WeaponCategory[];
  animation_set: AnimationSetEntry[];
}
