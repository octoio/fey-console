import { EntityReference, Metadata } from "./common.types";
import { QualityType } from "./quality.types";

// Personal quest entity (personal_quest.atd): a goal one character pursues alone, on top of the
// party quest, and what it gives (#356). The first one is a character's first weapon; the others
// are the cards of the offer of three, drawn from the pool the character names (`personal_quests`).
export type PersonalGoalKind =
  | "DefeatMonsters"
  | "DefeatElites"
  | "DealDamage"
  | "HealAllies"
  | "GainLevels";

export interface PersonalGoal {
  kind: PersonalGoalKind;
  /** The starting size of the goal (min 1). */
  count: number;
  /** The size is count * (1 + growth * n), n = chosen quests finished this run; absent = 0 (not negative). */
  growth?: number;
}

/** What breaks a sworn quest: the holder dies, or the holder drinks the flask. */
export type PersonalOath = "NoDeath" | "NoFlask";

export type PersonalRewardKind = "WeaponCache" | "Piece" | "SkillBook" | "Gold";

export interface PersonalReward {
  kind: PersonalRewardKind;
  /** How often the draw of a card picks it among the quest's rewards; absent = 1 (min 1). */
  weight?: number;
  /** WeaponCache only, not empty: the weapons the cache draws from (three weapon classes at least). */
  weapons?: EntityReference[];
  /** Gold only, above 0: the gold given to the character's own purse. */
  gold?: number;
  /** What the card and the line say of the reward ("your first weapon"); absent = worded from the kind. */
  text?: string;
  /** Piece only: the piece is of this quality or better (a sworn quest's sure piece). */
  min_quality?: QualityType;
}

export interface PersonalQuest {
  metadata: Metadata;
  goal: PersonalGoal;
  /** The rewards a card can carry, by weight; at least one. */
  rewards: PersonalReward[];
  /** The line shown while pursuing it; {count} is filled with the size: "Defeat {count} monsters". */
  goal_text: string;
  /** Sworn quest: breaking it loses the quest and gives Oathbreaker. Its rewards are pieces with a min_quality. */
  oath?: PersonalOath;
}
