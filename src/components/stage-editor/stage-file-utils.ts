import { AnchorEntityDefinition } from "@models/anchor.types";
import { EntityReference, EntityType } from "@models/common.types";
import { StageEntityDefinition } from "@models/stage.types";
import { FileInfo } from "@utils/entity-scanner";

export const DEFAULT_OWNER = "Octoio";

export const entityId = (
  owner: string,
  type: EntityType,
  key: string,
  version: number,
): string => `${owner}:${type}:${key}:${version}`;

export const entityFileName = (type: EntityType, key: string): string =>
  `${key.toLowerCase()}.${type.toLowerCase()}.json`;

// Prefer the entity's existing file; otherwise place it next to its siblings,
// falling back to a directory named after the type (mirrors StreamingAssets/json)
export const entityFilePath = (
  files: FileInfo[],
  type: EntityType,
  key: string,
): string => {
  const fileName = entityFileName(type, key);
  const existing = files.find(
    (file) => file.entityType === type && file.name === fileName,
  );
  if (existing) return existing.path;

  const sibling = files.find((file) => file.entityType === type);
  const directory = sibling
    ? sibling.path.split("/").slice(0, -1).join("/")
    : type.toLowerCase();
  return directory ? `${directory}/${fileName}` : fileName;
};

export const referenceOf = (definition: {
  owner: string;
  key: string;
  version: number;
}, type: EntityType): EntityReference => ({
  owner: definition.owner,
  type,
  key: definition.key,
  version: definition.version,
  id: entityId(definition.owner, type, definition.key, definition.version),
});

export const createStageDefinition = (
  key: string,
  entity: StageEntityDefinition["entity"],
): StageEntityDefinition => ({
  owner: DEFAULT_OWNER,
  type: EntityType.Stage,
  key,
  version: 1,
  id: entityId(DEFAULT_OWNER, EntityType.Stage, key, 1),
  entity,
});

export const createAnchorDefinition = (
  key: string,
  entity: AnchorEntityDefinition["entity"],
): AnchorEntityDefinition => ({
  owner: DEFAULT_OWNER,
  type: EntityType.Anchor,
  key,
  version: 1,
  id: entityId(DEFAULT_OWNER, EntityType.Anchor, key, 1),
  entity,
});

export const serializeDefinition = (definition: unknown): string =>
  JSON.stringify(definition, null, 2);
