import { EntityReference, Metadata } from "./common.types";

// Personal quest entity (personal_quest.atd): a goal one character pursues alone, on top of the
// party quest, and the reward it gives. The first one is a character's first weapon (#356).
export type PersonalGoalKind = "DefeatMonsters";

export interface PersonalGoal {
  kind: PersonalGoalKind;
  /** How many monsters to defeat (credited kills count; min 1). */
  count: number;
}

export type PersonalRewardKind = "WeaponCache";

export interface PersonalReward {
  kind: PersonalRewardKind;
  /** Weapons (entity references) the cache draws from: at least three weapon classes. */
  weapons: EntityReference[];
}

export interface PersonalQuest {
  metadata: Metadata;
  goal: PersonalGoal;
  reward: PersonalReward;
  /** The line shown while pursuing it: "Defeat 4 monsters with your fists". */
  goal_text: string;
  /** What it gives, in the line: "your first weapon". */
  reward_text: string;
}
