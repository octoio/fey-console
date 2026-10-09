import { EntityReference, Metadata } from "./common.types";
import { QualityType } from "./quality.types";
import { SkillCategory } from "./skill.types";

// Skill stone entity (skill_stone.atd): an item rolled like any loot; using it offers a pick of
// three skills. `category` restricts the offer to skills tagged with it (absent = any);
// `quality` is the rarity: the stone offers skills up to that quality.
export interface SkillStone {
  metadata: Metadata;
  quality: QualityType;
  icon_reference: EntityReference;
  category?: SkillCategory;
}
