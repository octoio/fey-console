import { CharacterType } from "./character.types";
import { Color, EntityReference, Metadata } from "./common.types";

export type AchievementType = "None" | "SlimeExterminator" | "BoarDefender";

// Spawn types (spawn.atd)
export interface Spawn {
  spawn_count: number; // min 1
  character: EntityReference; // Character
  anchor: EntityReference; // Anchor
  target_adventurer_on_spawn: boolean;
}

export interface SpawnSequenceStep {
  timing: number; // 0..1 fraction of the sequence duration
  spawns: Spawn[];
}

export interface SpawnSequence {
  duration: number; // 1..300 seconds
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

// Conditions: single event-driven checks tracked by the server.
// Combining conditions is the tree's job (Parallel/Any/Sequence).
export type QuestConditionType =
  | "KillSpecific"
  | "EnterAnchor"
  | "StayInAnchor"
  | "PickQuest"
  | "Teleport";

export interface QuestConditionKillSpecific {
  type: "KillSpecific";
  character_types: CharacterType[]; // min 1
  character?: EntityReference; // Character: only deaths of this definition count
  amount: number; // min 1
}

// amount: characters required inside the anchor; negative means all players
export interface QuestConditionEnterAnchor {
  type: "EnterAnchor";
  anchor: EntityReference; // Anchor
  amount: number;
}

export interface QuestConditionStayInAnchor {
  type: "StayInAnchor";
  anchor: EntityReference; // Anchor
  duration: number; // min 0.1
}

export interface QuestConditionPickQuest {
  type: "PickQuest";
}

export interface QuestConditionTeleport {
  type: "Teleport";
}

export type QuestCondition =
  | QuestConditionKillSpecific
  | QuestConditionEnterAnchor
  | QuestConditionStayInAnchor
  | QuestConditionPickQuest
  | QuestConditionTeleport;

// Actions: fire-and-forget world mutations (no rollback)
export type QuestActionType =
  | "Spawn"
  | "StartSpawnSequence"
  | "ActivateAnchor"
  | "DeactivateAnchor"
  | "ActivatePortalToStage"
  | "ActivatePortalToQuestStage"
  | "Message"
  | "EnableQuestBoardQuest";

export interface QuestActionSpawn {
  type: "Spawn";
  spawn: Spawn;
}

export interface QuestActionStartSpawnSequence {
  type: "StartSpawnSequence";
  spawn_sequence: SpawnSequence;
}

export interface QuestActionActivateAnchor {
  type: "ActivateAnchor";
  anchor: EntityReference; // Anchor
}

export interface QuestActionDeactivateAnchor {
  type: "DeactivateAnchor";
  anchor: EntityReference; // Anchor
}

export interface QuestActionActivatePortalToStage {
  type: "ActivatePortalToStage";
  anchor: EntityReference; // Anchor
  destination: EntityReference; // Stage
}

// Destination resolved at runtime: the stage of the pending quest board quest
export interface QuestActionActivatePortalToQuestStage {
  type: "ActivatePortalToQuestStage";
  anchor: EntityReference; // Anchor
}

export interface QuestActionMessage {
  type: "Message";
  message: string; // min length 1
}

export interface QuestActionEnableQuestBoardQuest {
  type: "EnableQuestBoardQuest";
}

export type QuestAction =
  | QuestActionSpawn
  | QuestActionStartSpawnSequence
  | QuestActionActivateAnchor
  | QuestActionDeactivateAnchor
  | QuestActionActivatePortalToStage
  | QuestActionActivatePortalToQuestStage
  | QuestActionMessage
  | QuestActionEnableQuestBoardQuest;

// Execution tree — mirrors the skill action node pattern.
// Node ids are explicit, unique within a quest, and name nodes in network
// records; they survive data edits (future hot reload).
export type QuestNodeType =
  | "Sequence"
  | "Parallel"
  | "Any"
  | "Timer"
  | "Objective"
  | "Action";

export type QuestTimerTimeoutType = "Fail" | "Complete";

export interface QuestNodeBase {
  type: QuestNodeType;
  id: number; // 0..65535, unique within a quest
  name: string;
}

export interface QuestSequenceNode extends QuestNodeBase {
  type: "Sequence";
  children: QuestNode[]; // min 1
}

export interface QuestParallelNode extends QuestNodeBase {
  type: "Parallel";
  children: QuestNode[]; // min 1
}

// First child to complete wins; losing branches are cancelled without rollback
export interface QuestAnyNode extends QuestNodeBase {
  type: "Any";
  children: QuestNode[]; // min 1
}

export interface QuestTimerNode extends QuestNodeBase {
  type: "Timer";
  duration: number; // min 0.1
  child: QuestNode;
  on_timeout: QuestTimerTimeoutType;
}

export interface QuestObjectiveNode extends QuestNodeBase {
  type: "Objective";
  metadata: Metadata;
  is_optional: boolean;
  condition: QuestCondition;
}

export interface QuestActionNode extends QuestNodeBase {
  type: "Action";
  action: QuestAction;
}

export type QuestNode =
  | QuestSequenceNode
  | QuestParallelNode
  | QuestAnyNode
  | QuestTimerNode
  | QuestObjectiveNode
  | QuestActionNode;

export interface Quest {
  metadata: Metadata;
  origin: QuestOrigin;
  assignee: QuestAssignee;
  difficulty: EntityReference; // QuestDifficulty
  stage: EntityReference; // Stage
  root: QuestNode;
  is_repeatable: boolean;
  achievement_on_complete: AchievementType;
  required_achievements: AchievementType[]; // min 1
}

export type QuestEntityDefinition = {
  id: string;
  owner: string;
  type: string;
  key: string;
  version: number;
  entity: Quest;
};

// Traversal helpers, mirror of QuestNodeWalker in the Unity codebase
export const questNodeChildren = (node: QuestNode): QuestNode[] => {
  switch (node.type) {
    case "Sequence":
    case "Parallel":
    case "Any":
      return node.children;
    case "Timer":
      return [node.child];
    default:
      return [];
  }
};

export const questNodesDepthFirst = (root: QuestNode): QuestNode[] => [
  root,
  ...questNodeChildren(root).flatMap(questNodesDepthFirst),
];

export const collectDuplicateQuestNodeIds = (root: QuestNode): number[] => {
  const seen = new Set<number>();
  const duplicates = new Set<number>();
  for (const node of questNodesDepthFirst(root)) {
    if (seen.has(node.id)) duplicates.add(node.id);
    seen.add(node.id);
  }
  return [...duplicates];
};

export const nextQuestNodeId = (root: QuestNode): number => {
  const used = new Set(questNodesDepthFirst(root).map((node) => node.id));
  let id = 0;
  while (used.has(id)) id++;
  return id;
};
