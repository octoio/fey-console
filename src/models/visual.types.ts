import { EntityReference } from "./common.types";
import { ModelAnchorPosition } from "./model.types";

// Presentation layer of a weapon, equipment item or monster (visual.atd).
export interface VisualLayer {
  layer: string;
  socket?: ModelAnchorPosition;
  sort: number;
  only_for_classes?: EntityReference[];
}
