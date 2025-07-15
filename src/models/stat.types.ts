import { Color, Metadata } from "./common.types";

/**
 * Enum for different types of stats.
 */
export enum StatType {
  Vit = "Vit",
  Str = "Str",
  Int = "Int",
  Dex = "Dex",
  Armor = "Armor",
  MagicResist = "MagicResist",
  Health = "Health",
  Mana = "Mana",
  DamageTakenModifier = "DamageTakenModifier",
  DamageModifier = "DamageModifier",
  MovementSpeed = "MovementSpeed",
  MovementSpeedModifier = "MovementSpeedModifier",
  AttackSpeed = "AttackSpeed",
  AttackPower = "AttackPower",
  AbilityPower = "AbilityPower",
  CriticalChance = "CriticalChance",
  CriticalDamage = "CriticalDamage",
  CooldownReduction = "CooldownReduction",
  DodgeChance = "DodgeChance",
  ManaRegen = "ManaRegen",
  HealthRegen = "HealthRegen",
  ExperienceModifier = "ExperienceModifier",
  GoldModifier = "GoldModifier",
  LifeSteal = "LifeSteal",
}

/**
 * Array containing all stat types.
 */
export const ALL_STAT_TYPES: StatType[] = Object.values(StatType).sort();

/**
 * Stat entity.
 */
export interface Stat {
  metadata: Metadata;
  type: StatType;
  color: Color;
}

/**
 * Stat sheet containing all stat values.
 */
export interface StatSheet {
  vit: number;
  str: number;
  int: number; // Named _int in ATD due to reserved keyword
  dex: number;
  armor: number;
  magic_resist: number;
  health: number;
  mana: number;
  damage_taken_modifier: number;
  damage_modifier: number;
  movement_speed: number;
  movement_speed_modifier: number;
  attack_speed: number;
  attack_power: number;
  ability_power: number;
  critical_chance: number;
  critical_damage: number;
  cooldown_reduction: number;
  dodge_chance: number;
  mana_regen: number;
  health_regen: number;
  experience_modifier: number;
  gold_modifier: number;
  life_steal: number;
}
