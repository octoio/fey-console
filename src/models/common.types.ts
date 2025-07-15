export type Vector2 = {
  x: number;
  y: number;
};

export type Vector3 = {
  x: number;
  y: number;
  z: number;
};

export type FloatRange = {
  min: number;
  max: number;
};

export type IntRange = {
  min: number;
  max: number;
};

export type Metadata = {
  title: string;
  description: string;
};

export type Size = {
  width: number;
  height: number;
};

export type Color = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export type Transform = {
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
};

// Convert EntityType from a type to an enum for runtime availability
export enum EntityType {
  Model = "Model",
  Skill = "Skill",
  Weapon = "Weapon",
  Equipment = "Equipment",
  Image = "Image",
  Status = "Status",
  Cursor = "Cursor",
  Stat = "Stat",
  Quality = "Quality",
  AudioClip = "AudioClip",
  Sound = "Sound",
  SoundBank = "SoundBank",
  DropTable = "DropTable",
  Character = "Character",
  AnimationSource = "AnimationSource",
  Animation = "Animation",
}

// Update EntityReference to use the enum
export type EntityReference = {
  owner: string;
  type: EntityType;
  key: string;
  version: number;
  id: string;
};

export enum HitType {
  Damage = "Damage",
  Heal = "Heal",
  Threat = "Threat",
  Mana = "Mana",
}

export enum HighlightType {
  MouseOver = "MouseOver",
  Selected = "Selected",
}

export enum TargetType {
  Character = "Character",
  Drop = "Drop",
  DeadCharacter = "DeadCharacter",
  QuestBoard = "QuestBoard",
  Portal = "Portal",
}

// Constants for all enum values
export const ALL_ENTITY_TYPES: EntityType[] = Object.values(EntityType);
export const ALL_HIT_TYPES: HitType[] = Object.values(HitType);
export const ALL_HIGHLIGHT_TYPES: HighlightType[] =
  Object.values(HighlightType);
export const ALL_TARGET_TYPES: TargetType[] = Object.values(TargetType);

export type EntityReferences = Record<EntityType, EntityReference[]>;

export const getDefaultEntityReferences = (): EntityReferences =>
  Object.fromEntries(
    Object.values(EntityType).map((type) => [type, []]),
  ) as unknown as EntityReferences;
