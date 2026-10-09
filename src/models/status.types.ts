import { HitType } from "./common.types";
import { Trigger } from "./trigger.types";

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
  Control = "Control",
  CrowdControl = "CrowdControl",
  Shield = "Shield",
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

/** How a Control status moves controllers while it lasts. */
export enum StatusControlMode {
  /** Controllers of the afflicted characters rotate among them. */
  Shuffle = "Shuffle",
  /** The caster and the first afflicted character exchange controllers. */
  SwapWithSource = "SwapWithSource",
  /** The caster takes control of the afflicted character. */
  Dominate = "Dominate",
}

export const ALL_STATUS_CONTROL_MODES: StatusControlMode[] =
  Object.values(StatusControlMode).sort();

export type StatusEffectMechanicControl = StatusEffectMechanic & {
  type: "Control";
  mode: StatusControlMode;
};

/** What a CrowdControl status takes away from the afflicted. A slow is a StatChange on MovementSpeedModifier. */
export enum CrowdControlEffect {
  /** Cannot move or cast; a running cast is interrupted. */
  Stun = "Stun",
  /** Cannot move; casting is unaffected. */
  Root = "Root",
  /** Cannot cast, a running cast is interrupted; movement is unaffected. */
  Silence = "Silence",
  /** The target attacks the status source (monsters only; blocks nothing). */
  Taunt = "Taunt",
}

export const ALL_CROWD_CONTROL_EFFECTS: CrowdControlEffect[] =
  Object.values(CrowdControlEffect).sort();

export type StatusEffectMechanicCrowdControl = StatusEffectMechanic & {
  type: "CrowdControl";
  effect: CrowdControlEffect;
};

/** A damage-absorbing pool sized by the status effect's scaler; soaked before health. */
export type StatusEffectMechanicShield = StatusEffectMechanic & {
  type: "Shield";
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
  /** Fire while the character has the status. */
  triggers?: Trigger[];
};
