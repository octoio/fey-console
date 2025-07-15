import { Metadata, Color } from "./common.types";

export enum QualityType {
  None = "None",
  Common = "Common",
  Uncommon = "Uncommon",
  Rare = "Rare",
  Epic = "Epic",
  Legendary = "Legendary",
}

export interface Quality {
  metadata: Metadata;
  type: QualityType;
  color: Color;
  text_color: Color;
  text_over_color: Color;
}

export const ALL_QUALITIES: QualityType[] = Object.values(QualityType);
