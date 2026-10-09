import { EntityReference } from "./common.types";
import { HitEffect, StatusEffect } from "./effect.types";

/** What raises a trigger. The owner is the subject of the event; "other" is its counterpart. */
export enum TriggerOn {
  /** The owner dealt damage that was not dodged. */
  Hit = "Hit",
  /** The owner dealt a critical hit or heal. */
  Crit = "Crit",
  /** The owner dealt the last damage to a character that died. */
  Kill = "Kill",
  /** The owner healed (also at full health, with amount 0). */
  Heal = "Heal",
  /** The owner dodged a hit. */
  Dodge = "Dodge",
  /** The owner applied a status. */
  StatusApplied = "StatusApplied",
  /** The owner took damage that was not dodged. */
  DamageTaken = "DamageTaken",
  /** The owner died (equipment and skill triggers only). */
  Death = "Death",
  /** A living teammate of the owner died. */
  AllyDeath = "AllyDeath",
  /** The owner started a cast. */
  CastStart = "CastStart",
  /** The owner finished a cast. */
  CastFinish = "CastFinish",
  /** The owner healed past max health; the amount is the overheal. */
  Overheal = "Overheal",
}

export const ALL_TRIGGER_ONS: TriggerOn[] = Object.values(TriggerOn).sort();

/** How "other" must relate to the owner. */
export enum TriggerRelation {
  Any = "Any",
  Enemy = "Enemy",
  /** Same team, the owner included. */
  Ally = "Ally",
  Owner = "Owner",
}

export const ALL_TRIGGER_RELATIONS: TriggerRelation[] =
  Object.values(TriggerRelation).sort();

/** Exactly one of hit, status, skill. Targets: the caster is the owner, the selected target is "other". */
export type TriggerEffect = {
  hit?: HitEffect;
  status?: StatusEffect;
  /** The instant Hit and Status nodes of this skill run as if cast for free by the owner. */
  skill?: EntityReference;
  /** Leave "other" out of the targets (a chain jump). */
  exclude_other?: boolean;
};

export type Trigger = {
  /** Unique among the triggers of one owner; shows up in the balance metrics. */
  key: string;
  on: TriggerOn;
  relation?: TriggerRelation;
  /** Probability in [0, 1], drawn from the Trigger stream. */
  chance: number;
  /** Internal cooldown in seconds, per owner and trigger. */
  cooldown: number;
  /** The event amount (effective damage or healing) must be at least this. */
  min_amount?: number;
  /** Only for StatusApplied: the status that was applied. */
  status?: EntityReference;
  /** Only events raised by effects of chain depth up to this one. */
  max_chain?: number;
  /** true: the effects raise no further triggers. */
  terminal?: boolean;
  effects: TriggerEffect[];
};
