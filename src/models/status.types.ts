import { HitType } from "./common.types";

export enum StatusDurationType {
  Chrono = "Chrono",
  Logical = "Logical",
  Room = "Room",
  Dungeon = "Dungeon",
}

export const ALL_STATUS_DURATION_TYPES: StatusDurationType[] =
  Object.values(StatusDurationType).sort();

export type StatusDuration = {
  type: StatusDurationType;
  value: number;
};

export enum StatusEffectMechanicType {
  StatChange = "StatChange",
  HitOverTime = "HitOverTime",
}

export const ALL_STATUS_EFFECT_MECHANIC_TYPES: StatusEffectMechanicType[] =
  Object.values(StatusEffectMechanicType).sort();

export type StatusEffectMechanic = {
  type: StatusEffectMechanicType;
};

export type StatusEffectMechanicStatChange = StatusEffectMechanic & {
  type: "StatChange";
  stat: string;
};

export type StatusEffectMechanicHitOverTime = StatusEffectMechanic & {
  type: "HitOverTime";
  hit: HitType;
  tick_rate: number;
};

export enum StatusStackScalingStrategy {
  Additive = "Additive",
  Multiplicative = "Multiplicative",
}

export const ALL_STATUS_STACK_SCALING_STRATEGIES: StatusStackScalingStrategy[] =
  Object.values(StatusStackScalingStrategy).sort();

export type StatusStack = {
  size: number;
  scaling_strategy: StatusStackScalingStrategy;
};

export type Status = {
  metadata: {
    title: string;
    description: string;
  };
  mechanic: StatusEffectMechanic;
  stack: StatusStack;
};
