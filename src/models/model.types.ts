import { EntityReference, Transform } from "./common.types";

/**
 * Defines shadow casting modes for 3D models
 */
export enum ShadowCastingMode {
  Off = "Off",
  On = "On",
  TwoSided = "TwoSided",
  ShadowsOnly = "ShadowsOnly",
}

export const ALL_SHADOW_CASTING_MODES: ShadowCastingMode[] =
  Object.values(ShadowCastingMode);

/**
 * Represents a 3D model with its properties
 */
export type Model = {
  path: string;
  transform: Transform;
  shadow_casting_mode: ShadowCastingMode;
};

/**
 * Defines possible attachment points on a model
 */
export enum ModelAnchorPosition {
  None = "None",
  HeadAnchor = "HeadAnchor",
  EyesAnchor = "EyesAnchor",
  EaringsAnchor = "EaringsAnchor",
  FaceAccessoryAnchor = "FaceAccessoryAnchor",
  BackAnchor = "BackAnchor",
  NeckAnchor = "NeckAnchor",
  ShoulderLeftAnchor = "ShoulderLeftAnchor",
  ShoulderRightAnchor = "ShoulderRightAnchor",
  ForearmLeftAnchor = "ForearmLeftAnchor",
  ForearmRightAnchor = "ForearmRightAnchor",
  HandLeftAnchor = "HandLeftAnchor",
  HandRightAnchor = "HandRightAnchor",
  ChestAnchor = "ChestAnchor",
  WaistAnchor = "WaistAnchor",
  LegsAnchor = "LegsAnchor",
  FootLeftAnchor = "FootLeftAnchor",
  FootRightAnchor = "FootRightAnchor",
  MainHandAnchor = "MainHandAnchor",
  OffHandAnchor = "OffHandAnchor",
  TwoHandAnchor = "TwoHandAnchor",
  HipLeftAnchor = "HipLeftAnchor",
  HipRightAnchor = "HipRightAnchor",
}

export const ALL_MODEL_ANCHOR_POSITIONS: ModelAnchorPosition[] =
  Object.values(ModelAnchorPosition).sort();

/**
 * Defines model variants for different states
 */
export enum ModelVariant {
  Primary = "Primary",
  Sheathed = "Sheathed",
}

export const ALL_MODEL_VARIANTS: ModelVariant[] = Object.values(ModelVariant);

/**
 * Represents an attachment point on a model
 */
export type ModelAnchor = {
  position: ModelAnchorPosition;
  local_transform: Transform;
  variant: ModelVariant;
};

/**
 * Represents a collection of model anchors
 */
export type ModelAnchorSet = {
  model_reference: EntityReference;
  anchors: ModelAnchor[];
};

export type ModelEntityDefinition = {
  id: string;
  owner: string;
  type: string;
  key: string;
  version: number;
  entity: Model;
};
