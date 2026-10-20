import { Metadata } from "./common.types";

/**
 * The global balance knobs: one entity, key Global. Every multiplier scales a whole quantity of one
 * side at once (1.0 = no change). The party side is every adventurer; the monster side is every
 * hostile, after the level curves.
 */
export interface Balance {
  metadata: Metadata;
  party_health: number;
  party_damage: number;
  party_mana: number;
  monster_health: number;
  monster_damage: number;
  monster_mana: number;
}
