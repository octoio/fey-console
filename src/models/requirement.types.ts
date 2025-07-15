import { CharacterType } from "./character.types";
import { WeaponCategory as WeaponCategoryType } from "./weapon.types";

export enum RequirementType {
  Character = "Character",
  WeaponCategory = "WeaponCategory",
}

export const ALL_REQUIREMENT_TYPES: RequirementType[] =
  Object.values(RequirementType).sort();

export type Requirement = {
  type: RequirementType;
};

export type CharacterRequirement = Requirement & {
  type: RequirementType.Character;
  character: CharacterType;
};

export type WeaponCategoryRequirement = Requirement & {
  type: RequirementType.WeaponCategory;
  weapon_category: WeaponCategoryType;
};

export enum RequirementOperator {
  All = "All",
  Any = "Any",
}

export const ALL_REQUIREMENT_OPERATORS: RequirementOperator[] =
  Object.values(RequirementOperator).sort();

export type RequirementEvaluation = {
  operator: RequirementOperator;
  requirements: Requirement[];
};
