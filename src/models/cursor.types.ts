import { EntityReference, Vector2 } from "./common.types";

export enum CursorType {
  General = "General",
  Target = "Target",
  Attack = "Attack",
  Loot = "Loot",
  QuestBoard = "QuestBoard",
  Interact = "Interact",
  Move = "Move",
  Invalid = "Invalid",
  Ally = "Ally",
}

export const ALL_CURSOR_TYPES: CursorType[] = Object.values(CursorType);

export type Cursor = {
  type: CursorType;
  icon_reference: EntityReference; // Image
  hot_spot: Vector2; // 0..64
};
