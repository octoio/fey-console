import { CharacterType } from "./character.types";
import {
  Color,
  EntityReference,
  Metadata,
  ZoneType,
} from "./common.types";

export type StageType = "None" | "TheVillage" | "TheForest" | "TheFarm";

export type PortalType = "Primary";

export type AchievementType = "None" | "SlimeExterminator";

// Spawn types (spawn.atd)
export interface Spawn {
  spawn_count: number;
  character: EntityReference;
  target_adventurer_on_spawn: boolean;
}

export interface SpawnSequenceStep {
  timing: number;
  spawns: Spawn[];
}

export interface SpawnSequence {
  duration: number;
  steps: SpawnSequenceStep[];
}

// Quest difficulty entity
export type QuestDifficultyType =
  | "Easy"
  | "Normal"
  | "Hard"
  | "Insane"
  | "Impossible";

export interface QuestDifficulty {
  metadata: Metadata;
  type: QuestDifficultyType;
  color: Color;
}

export type QuestOrigin =
  | "QuestBoard"
  | "Item"
  | "NPC"
  | "World"
  | "Stage"
  | "Quest"
  | "Event"
  | "Player";

export type QuestAssignee = "Player" | "Team" | "PlayerHidden" | "TeamHidden";

// Objective requirements
export type QuestObjectiveRequirementType =
  | "Collect"
  | "KillSpecific"
  | "Activate"
  | "Charge"
  | "PickQuest"
  | "Teleport"
  | "EnterZone"
  | "StayInZone";

// amount: how much of the requirement must be completed. Negative values mean ALL
export interface QuestObjectiveRequirement {
  type: QuestObjectiveRequirementType;
  metadata: Metadata;
  amount: number;
}

export interface QuestObjectiveRequirementCollect
  extends QuestObjectiveRequirement {
  type: "Collect";
}

export interface QuestObjectiveRequirementKillSpecific
  extends QuestObjectiveRequirement {
  type: "KillSpecific";
  character_types: CharacterType[];
}

export interface QuestObjectiveRequirementActivate
  extends QuestObjectiveRequirement {
  type: "Activate";
}

export interface QuestObjectiveRequirementCharge
  extends QuestObjectiveRequirement {
  type: "Charge";
}

export interface QuestObjectiveRequirementPickQuest
  extends QuestObjectiveRequirement {
  type: "PickQuest";
}

export interface QuestObjectiveRequirementTeleport
  extends QuestObjectiveRequirement {
  type: "Teleport";
}

export interface QuestObjectiveRequirementEnterZone
  extends QuestObjectiveRequirement {
  type: "EnterZone";
  zone_types: ZoneType[];
}

export interface QuestObjectiveRequirementStayInZone
  extends QuestObjectiveRequirement {
  type: "StayInZone";
  zone_types: ZoneType[];
}

export type QuestObjectiveRequirementUnion =
  | QuestObjectiveRequirementCollect
  | QuestObjectiveRequirementKillSpecific
  | QuestObjectiveRequirementActivate
  | QuestObjectiveRequirementCharge
  | QuestObjectiveRequirementPickQuest
  | QuestObjectiveRequirementTeleport
  | QuestObjectiveRequirementEnterZone
  | QuestObjectiveRequirementStayInZone;

// Completion results
export type QuestCompletionResultType =
  | "Spawn"
  | "ActivatePortal"
  | "EnableQuestBoardQuest"
  | "ActivateZone"
  | "DeactivateZone"
  | "StartSpawnSequence";

export type QuestCompletionResultActivatePortalType =
  | "BackToTheVillage"
  | "QuestBoardQuestStage";

export interface QuestCompletionResult {
  type: QuestCompletionResultType;
  message: string;
}

export interface QuestCompletionResultSpawn extends QuestCompletionResult {
  type: "Spawn";
  characters: EntityReference[];
}

export interface QuestCompletionResultActivatePortal
  extends QuestCompletionResult {
  type: "ActivatePortal";
  activate_portal_type: QuestCompletionResultActivatePortalType;
  portal_type: PortalType;
}

export interface QuestCompletionResultEnableQuestBoardQuest
  extends QuestCompletionResult {
  type: "EnableQuestBoardQuest";
}

export interface QuestCompletionResultActivateZone
  extends QuestCompletionResult {
  type: "ActivateZone";
  zone_type: ZoneType;
}

export interface QuestCompletionResultDeactivateZone
  extends QuestCompletionResult {
  type: "DeactivateZone";
  zone_type: ZoneType;
}

export interface QuestCompletionResultStartSpawnSequence
  extends QuestCompletionResult {
  type: "StartSpawnSequence";
  spawn_sequence: SpawnSequence;
}

export type QuestCompletionResultUnion =
  | QuestCompletionResultSpawn
  | QuestCompletionResultActivatePortal
  | QuestCompletionResultEnableQuestBoardQuest
  | QuestCompletionResultActivateZone
  | QuestCompletionResultDeactivateZone
  | QuestCompletionResultStartSpawnSequence;

// Quest structure
export interface QuestObjective {
  metadata: Metadata;
  is_optional: boolean;
  requirements: QuestObjectiveRequirementUnion[];
}

export interface QuestStep {
  objectives: QuestObjective[];
  completion_results: QuestCompletionResultUnion[];
}

export interface Quest {
  metadata: Metadata;
  origin: QuestOrigin;
  assignee: QuestAssignee;
  difficulty: EntityReference;
  steps: QuestStep[];
  stage_to_go_from_quest_board: StageType;
  is_repeatable: boolean;
  achievement_on_complete: AchievementType;
  required_achievements: AchievementType[];
  start_results: QuestCompletionResultUnion[];
}
