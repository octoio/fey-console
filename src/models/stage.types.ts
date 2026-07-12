import { Color, EntityReference, Metadata } from "./common.types";

// Stage entity (stage.atd): an art scene plus the anchors (gameplay markers) it owns.
export interface Stage {
  metadata: Metadata;
  scene_name: string;
  theme_color: Color;
  thumbnail_reference?: EntityReference; // Image
  anchors: EntityReference[]; // Anchor
  quest?: EntityReference; // Quest
}

export type StageEntityDefinition = {
  id: string;
  owner: string;
  type: string;
  key: string;
  version: number;
  entity: Stage;
};

export const createDefaultStage = (): Stage => ({
  metadata: { title: "", description: "" },
  scene_name: "",
  theme_color: { r: 1, g: 1, b: 1, a: 1 },
  anchors: [],
});
