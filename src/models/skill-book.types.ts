import { EntityReference, Metadata } from "./common.types";
import { QualityType } from "./quality.types";
import { SkillCategory } from "./skill.types";

// Skill book entity (skill_book.atd): an item rolled like any loot; using it offers a pick of
// three skills. `category` restricts the offer to skills tagged with it (absent = any);
// `quality` is the rarity: the book offers skills up to that quality.
export interface SkillBook {
  metadata: Metadata;
  quality: QualityType;
  icon_reference: EntityReference;
  category?: SkillCategory;
}
