import { Color, Metadata, Transform } from "./common.types";
import { RarityWeights } from "./drop.types";
import { CharacterTeam } from "./effect.types";
import { AnchorBinding } from "./generator.types";

// Anchor entity (anchor.atd): gameplay markers owned by a stage.
// Transforms are relative to the stage's StageOrigin.
export enum AnchorType {
  Zone = "Zone",
  SpawnPoint = "SpawnPoint",
  Portal = "Portal",
  QuestBoard = "QuestBoard",
  LampPost = "LampPost",
  HealingShrine = "HealingShrine",
  Lever = "Lever",
  Merchant = "Merchant",
}

export enum ZoneDetectionType {
  Overlap = "Overlap",
  Trigger = "Trigger",
}

export interface AnchorBase {
  type: AnchorType;
  metadata: Metadata;
  transform: Transform;
  binding?: AnchorBinding; // on a generated stage: which generated slot this anchor is
}

export interface AnchorZone extends AnchorBase {
  type: AnchorType.Zone;
  detection: ZoneDetectionType;
  radius: number; // min 0.1
  color: Color;
  show_vfx: boolean;
  models?: string[]; // keys of the pack props the zone can stand as; absent = a bare disc
}

export interface AnchorSpawnPoint extends AnchorBase {
  type: AnchorType.SpawnPoint;
  team?: CharacterTeam; // Ally marks where the party appears on entering the stage
  radius?: number; // the monsters' area around the anchor (min 0.5); absent = a point
}

export interface AnchorPortal extends AnchorBase {
  type: AnchorType.Portal;
}

export interface AnchorQuestBoard extends AnchorBase {
  type: AnchorType.QuestBoard;
}

export interface AnchorLampPost extends AnchorBase {
  type: AnchorType.LampPost;
  model: string; // key of the pack prop that stands there (min length 1)
}

export interface AnchorHealingShrine extends AnchorBase {
  type: AnchorType.HealingShrine;
  model: string; // key of the pack prop that stands there (min length 1)
  price: number; // gold each living player of the party pays for one use (min 1); fixed, never grows with level or tier
}

export interface AnchorLever extends AnchorBase {
  type: AnchorType.Lever;
  model: string; // key of the pack prop that stands there (min length 1)
}

/** The gold the merchant asks for a piece of each rarity (a bare item counts as Common). */
export type RarityPrices = {
  common: number; // min 1
  uncommon: number;
  rare: number;
  epic: number;
  legendary: number;
};

/** Relative weights of equipment and weapons on her shelf (only the sum must be positive). */
export type MerchantKindWeights = {
  equipment: number; // min 0
  weapon: number; // min 0
};

export type MerchantStock = {
  size: number; // pieces rolled at the run start and at each return to the village (min 1)
  rarity: RarityWeights;
  kinds: MerchantKindWeights;
};

export type MerchantShowcase = {
  rarity: RarityWeights; // the one piece kept until it is bought
};

/** The village merchant: sells and buys equipment and weapons, takes commissions (fey-rs docs/systems/loot.md). */
export interface AnchorMerchant extends AnchorBase {
  type: AnchorType.Merchant;
  model: string; // key of the pack prop that stands there (min length 1)
  prices: RarityPrices;
  sell_fraction: number; // 0..1: the share of the price she pays for a piece
  commission_price: number; // gold for one random piece of a slot (min 1)
  stock: MerchantStock;
  showcase: MerchantShowcase;
}

export type Anchor =
  | AnchorZone
  | AnchorSpawnPoint
  | AnchorPortal
  | AnchorQuestBoard
  | AnchorLampPost
  | AnchorHealingShrine
  | AnchorLever
  | AnchorMerchant;

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
    case AnchorType.LampPost:
      return { ...base, type: AnchorType.LampPost, model: "" };
    case AnchorType.HealingShrine:
      return { ...base, type: AnchorType.HealingShrine, model: "", price: 1 };
    case AnchorType.Lever:
      return { ...base, type: AnchorType.Lever, model: "" };
    case AnchorType.Merchant:
      return {
        ...base,
        type: AnchorType.Merchant,
        model: "",
        prices: { common: 1, uncommon: 1, rare: 1, epic: 1, legendary: 1 },
        sell_fraction: 0.2,
        commission_price: 1,
        stock: {
          size: 1,
          rarity: { common: 1, uncommon: 0, rare: 0, epic: 0, legendary: 0 },
          kinds: { equipment: 1, weapon: 1 },
        },
        showcase: {
          rarity: { common: 1, uncommon: 0, rare: 0, epic: 0, legendary: 0 },
        },
      };
  }
};
