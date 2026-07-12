import { Color, Metadata, Transform } from "./common.types";

// Anchor entity (anchor.atd): gameplay markers owned by a stage.
// Transforms are relative to the stage's StageOrigin.
export enum AnchorType {
  Zone = "Zone",
  SpawnPoint = "SpawnPoint",
  Portal = "Portal",
  QuestBoard = "QuestBoard",
}

export enum ZoneDetectionType {
  Overlap = "Overlap",
  Trigger = "Trigger",
}

export interface AnchorBase {
  type: AnchorType;
  metadata: Metadata;
  transform: Transform;
}

export interface AnchorZone extends AnchorBase {
  type: AnchorType.Zone;
  detection: ZoneDetectionType;
  radius: number; // min 0.1
  color: Color;
  show_vfx: boolean;
}

export interface AnchorSpawnPoint extends AnchorBase {
  type: AnchorType.SpawnPoint;
}

export interface AnchorPortal extends AnchorBase {
  type: AnchorType.Portal;
}

export interface AnchorQuestBoard extends AnchorBase {
  type: AnchorType.QuestBoard;
}

export type Anchor =
  | AnchorZone
  | AnchorSpawnPoint
  | AnchorPortal
  | AnchorQuestBoard;

export type AnchorEntityDefinition = {
  id: string;
  owner: string;
  type: string;
  key: string;
  version: number;
  entity: Anchor;
};

export const ALL_ANCHOR_TYPES: AnchorType[] = Object.values(AnchorType);
export const ALL_ZONE_DETECTION_TYPES: ZoneDetectionType[] =
  Object.values(ZoneDetectionType);

const defaultTransform = (): Transform => ({
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
});

export const createDefaultAnchor = (type: AnchorType): Anchor => {
  const base = {
    metadata: { title: "", description: "" },
    transform: defaultTransform(),
  };
  switch (type) {
    case AnchorType.Zone:
      return {
        ...base,
        type: AnchorType.Zone,
        detection: ZoneDetectionType.Trigger,
        radius: 1,
        color: { r: 1, g: 1, b: 1, a: 1 },
        show_vfx: false,
      };
    case AnchorType.SpawnPoint:
      return { ...base, type: AnchorType.SpawnPoint };
    case AnchorType.Portal:
      return { ...base, type: AnchorType.Portal };
    case AnchorType.QuestBoard:
      return { ...base, type: AnchorType.QuestBoard };
  }
};
