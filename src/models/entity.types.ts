import { EntityType } from "./common.types";

// Re-export EntityType for convenience
export { EntityType };

// Entity type display names for UI
export const ENTITY_TYPE_DISPLAY_NAMES: Record<EntityType, string> = {
  [EntityType.Skill]: "Skill",
  [EntityType.Weapon]: "Weapon",
  [EntityType.Equipment]: "Equipment",
  [EntityType.Character]: "Character",
  [EntityType.Model]: "3D Model",
  [EntityType.Image]: "Image",
  [EntityType.Status]: "Status Effect",
  [EntityType.DropTable]: "Drop Table",
  [EntityType.Sound]: "Sound",
  [EntityType.AudioClip]: "Audio Clip",
  [EntityType.SoundBank]: "Sound Bank",
  [EntityType.Animation]: "Animation",
  [EntityType.AnimationSource]: "Animation Source",
  [EntityType.Cursor]: "Cursor",
  [EntityType.Stat]: "Stat",
  [EntityType.Quality]: "Quality",
};

// Entity type descriptions for UI
export const ENTITY_TYPE_DESCRIPTIONS: Record<EntityType, string> = {
  [EntityType.Skill]:
    "Interactive skills with execution trees and visual effects",
  [EntityType.Weapon]:
    "Combat weapons with damage, enchantments, and properties",
  [EntityType.Equipment]:
    "Wearable items that modify character stats and abilities",
  [EntityType.Character]: "Game characters with stats, skills, and AI behavior",
  [EntityType.Model]: "3D models for characters, objects, and environments",
  [EntityType.Image]: "UI icons, textures, and visual assets",
  [EntityType.Status]: "Temporary effects that modify character behavior",
  [EntityType.DropTable]: "Probability tables for item drops and rewards",
  [EntityType.Sound]: "Individual sound effects and audio clips",
  [EntityType.AudioClip]: "Audio clips for music, dialogue, and effects",
  [EntityType.SoundBank]: "Collections of related audio clips",
  [EntityType.Animation]: "Character and object animations",
  [EntityType.AnimationSource]: "Animation data sources and references",
  [EntityType.Cursor]: "Custom cursor definitions and behaviors",
  [EntityType.Stat]: "Character statistics and attribute definitions",
  [EntityType.Quality]: "Item quality levels and rarity definitions",
};

// Simple entity interface for basic entity data
export interface SimpleEntity {
  id?: string;
  type: EntityType;
  key: string;
  owner: string;
  data: any;
  createdAt: Date;
  modifiedAt: Date;
  metadata?: {
    title: string;
    description: string;
  };
  // Additional properties can be added by specific entity types
  [key: string]: any;
}

// Generic entity definition structure
export interface EntityDefinition<T extends SimpleEntity = SimpleEntity> {
  id: string;
  owner: string;
  type: EntityType;
  key: string;
  version: number;
  entity: T;
}

// Utility function to get entity display name
export function getEntityDisplayName(entityType: EntityType): string {
  return ENTITY_TYPE_DISPLAY_NAMES[entityType] || entityType;
}

// Utility function to get entity description
export function getEntityDescription(entityType: EntityType): string {
  return ENTITY_TYPE_DESCRIPTIONS[entityType] || "No description available";
}

// Utility function to create empty entity
export function createEmptyEntity(
  type: EntityType,
  owner: string = "player",
  key: string = "new_entity",
): SimpleEntity {
  const displayName = getEntityDisplayName(type);
  const description = getEntityDescription(type);

  return {
    type,
    key,
    owner,
    data: {},
    createdAt: new Date(),
    modifiedAt: new Date(),
    metadata: {
      title: `New ${displayName}`,
      description: description,
    },
  };
}

// Utility function to validate entity structure
export function validateEntityStructure(entity: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!entity) {
    errors.push("Entity is null or undefined");
    return { isValid: false, errors };
  }

  if (typeof entity.type !== "string")
    errors.push("Entity type must be a string");

  if (typeof entity.key !== "string")
    errors.push("Entity key must be a string");

  if (typeof entity.owner !== "string")
    errors.push("Entity owner must be a string");

  if (!entity.createdAt || !(entity.createdAt instanceof Date))
    errors.push("Entity createdAt must be a Date");

  if (!entity.modifiedAt || !(entity.modifiedAt instanceof Date))
    errors.push("Entity modifiedAt must be a Date");

  if (entity.data === undefined || entity.data === null)
    errors.push("Entity data cannot be null or undefined");

  return { isValid: errors.length === 0, errors };
}

// Utility function to get entity type from entity
export function getEntityType(entity: SimpleEntity): EntityType {
  return entity.type;
}

// Utility function to get entity display title
export function getEntityDisplayTitle(entity: SimpleEntity): string {
  return (
    entity.metadata?.title ||
    `${getEntityDisplayName(entity.type)} ${entity.key}`
  );
}

// Utility function to clone entity
export function cloneEntity<T extends SimpleEntity>(entity: T): T {
  const cloned = JSON.parse(JSON.stringify(entity));

  // Restore Date objects
  if (entity.createdAt instanceof Date)
    cloned.createdAt = new Date(entity.createdAt);

  if (entity.modifiedAt instanceof Date)
    cloned.modifiedAt = new Date(entity.modifiedAt);

  return cloned;
}

// Utility function to update entity metadata
export function updateEntityMetadata<T extends SimpleEntity>(
  entity: T,
  title?: string,
  description?: string,
): T {
  const updatedEntity = cloneEntity(entity);
  // Ensure modifiedAt is different from the original
  updatedEntity.modifiedAt = new Date(Date.now() + 1);

  if (!updatedEntity.metadata) {
    updatedEntity.metadata = {
      title: title || `New ${getEntityDisplayName(entity.type)}`,
      description: description || getEntityDescription(entity.type),
    };
  } else {
    if (title !== undefined) updatedEntity.metadata.title = title;

    if (description !== undefined)
      updatedEntity.metadata.description = description;
  }

  return updatedEntity;
}

// Utility function to generate new entity ID
export function generateEntityId(
  owner: string,
  type: EntityType,
  key: string,
  version: number,
): string {
  return `${owner}:${type}:${key}:${version}`;
}
