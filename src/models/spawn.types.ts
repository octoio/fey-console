import { EntityReference } from "./common.types";

// Spawn types (spawn.atd)
export interface Spawn {
  spawn_count: number; // min 1
  character: EntityReference; // Character
  anchor: EntityReference; // Anchor
  target_adventurer_on_spawn: boolean;
  /** The spawned monsters go for the nearest living character of this definition (not with target_adventurer_on_spawn). */
  assault?: EntityReference; // Character
}

export interface SpawnSequenceStep {
  timing: number; // 0..1 fraction of the sequence duration
  spawns: Spawn[]; // min 1
}

export interface SpawnSequence {
  duration: number; // 1..300 seconds
  steps: SpawnSequenceStep[];
}
