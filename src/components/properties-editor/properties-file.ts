import { CharacterEntityDefinition } from "@models/character.types";
import { EntityType } from "@models/common.types";
import { QuestDifficultyEntityDefinition, QuestEntityDefinition } from "@models/quest.types";

export type PropertiesDefinition =
  | QuestDifficultyEntityDefinition
  | QuestEntityDefinition
  | CharacterEntityDefinition;

/** The entity types the Properties editor opens: their fields are plain values. */
export const PROPERTIES_TYPES: string[] = [
  EntityType.QuestDifficulty,
  EntityType.Quest,
  EntityType.Character,
];

/** Parses a file of one of the Properties types; fields the forms do not show stay as read. */
export const parsePropertiesFile = (text: string): PropertiesDefinition => {
  const definition = JSON.parse(text);
  if (!PROPERTIES_TYPES.includes(definition.type))
    throw new Error(`Not a Properties entity: ${definition.type}`);
  return definition;
};
