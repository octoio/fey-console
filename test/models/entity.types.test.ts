import { describe, it, expect } from "vitest";
import { EntityType } from "../../src/models/common.types";
import {
  ENTITY_TYPE_DISPLAY_NAMES,
  ENTITY_TYPE_DESCRIPTIONS,
  getEntityDisplayName,
  getEntityDescription,
  createEmptyEntity,
  validateEntityStructure,
  getEntityType,
  getEntityDisplayTitle,
  cloneEntity,
  updateEntityMetadata,
} from "../../src/models/entity.types";

describe("Entity Types Utilities", () => {
  describe("ENTITY_TYPE_DISPLAY_NAMES", () => {
    it("should have display names for all entity types", () => {
      const allEntityTypes = Object.values(EntityType);
      allEntityTypes.forEach((entityType) => {
        expect(ENTITY_TYPE_DISPLAY_NAMES[entityType]).toBeDefined();
        expect(ENTITY_TYPE_DISPLAY_NAMES[entityType]).toEqual(
          expect.any(String),
        );
      });
    });

    it("should have correct display names for specific entity types", () => {
      expect(ENTITY_TYPE_DISPLAY_NAMES[EntityType.Skill]).toBe("Skill");
      expect(ENTITY_TYPE_DISPLAY_NAMES[EntityType.Weapon]).toBe("Weapon");
      expect(ENTITY_TYPE_DISPLAY_NAMES[EntityType.Model]).toBe("3D Model");
      expect(ENTITY_TYPE_DISPLAY_NAMES[EntityType.AudioClip]).toBe(
        "Audio Clip",
      );
      expect(ENTITY_TYPE_DISPLAY_NAMES[EntityType.SoundBank]).toBe(
        "Sound Bank",
      );
      expect(ENTITY_TYPE_DISPLAY_NAMES[EntityType.DropTable]).toBe(
        "Drop Table",
      );
      expect(ENTITY_TYPE_DISPLAY_NAMES[EntityType.Status]).toBe(
        "Status Effect",
      );
      expect(ENTITY_TYPE_DISPLAY_NAMES[EntityType.AnimationSource]).toBe(
        "Animation Source",
      );
    });

    it("should not have duplicate display names", () => {
      const displayNames = Object.values(ENTITY_TYPE_DISPLAY_NAMES);
      const uniqueNames = [...new Set(displayNames)];
      expect(displayNames.length).toBe(uniqueNames.length);
    });

    it("should have user-friendly display names", () => {
      Object.values(ENTITY_TYPE_DISPLAY_NAMES).forEach((displayName) => {
        expect(displayName).not.toMatch(/^[a-z]/); // Should start with capital letter
        expect(displayName.length).toBeGreaterThan(0);
        expect(displayName.length).toBeLessThan(20); // Reasonable length
      });
    });
  });

  describe("ENTITY_TYPE_DESCRIPTIONS", () => {
    it("should have descriptions for all entity types", () => {
      const allEntityTypes = Object.values(EntityType);
      allEntityTypes.forEach((entityType) => {
        expect(ENTITY_TYPE_DESCRIPTIONS[entityType]).toBeDefined();
        expect(ENTITY_TYPE_DESCRIPTIONS[entityType]).toEqual(
          expect.any(String),
        );
      });
    });

    it("should have meaningful descriptions", () => {
      Object.values(ENTITY_TYPE_DESCRIPTIONS).forEach((description) => {
        expect(description.length).toBeGreaterThan(10);
        expect(description.length).toBeLessThan(200);
      });
    });

    it("should have descriptions starting with capital letter or digit", () => {
      Object.values(ENTITY_TYPE_DESCRIPTIONS).forEach((description) => {
        expect(description).toMatch(/^[A-Z0-9]/); // Should start with capital letter or digit
      });
    });
  });

  describe("Entity Display Functions", () => {
    it("should return correct display name for entity type", () => {
      expect(getEntityDisplayName(EntityType.Skill)).toBe("Skill");
      expect(getEntityDisplayName(EntityType.Weapon)).toBe("Weapon");
      expect(getEntityDisplayName(EntityType.Model)).toBe("3D Model");
    });

    it("should return fallback for unknown entity type", () => {
      const unknownType = "UnknownType" as EntityType;
      expect(getEntityDisplayName(unknownType)).toBe(unknownType);
    });

    it("should return correct description for entity type", () => {
      expect(getEntityDescription(EntityType.Skill)).toBe(
        "Interactive skills with execution trees and visual effects",
      );
      expect(getEntityDescription(EntityType.Weapon)).toBe(
        "Combat weapons with damage, enchantments, and properties",
      );
    });

    it("should return fallback for unknown entity type description", () => {
      const unknownType = "UnknownType" as EntityType;
      expect(getEntityDescription(unknownType)).toBe(
        "No description available",
      );
    });
  });

  describe("createEmptyEntity", () => {
    it("should create entity with default parameters", () => {
      const entity = createEmptyEntity(EntityType.Weapon);

      expect(entity.owner).toBe("player");
      expect(entity.type).toBe(EntityType.Weapon);
      expect(entity.key).toBe("new_entity");
      expect(entity.data).toEqual({});
      expect(entity.createdAt).toBeInstanceOf(Date);
      expect(entity.modifiedAt).toBeInstanceOf(Date);
      expect(entity.metadata?.title).toBe("New Weapon");
      expect(entity.metadata?.description).toBe(
        "Combat weapons with damage, enchantments, and properties",
      );
    });

    it("should create entity with custom owner", () => {
      const entity = createEmptyEntity(EntityType.Skill, "admin");

      expect(entity.owner).toBe("admin");
      expect(entity.type).toBe(EntityType.Skill);
      expect(entity.key).toBe("new_entity");
      expect(entity.metadata?.title).toBe("New Skill");
    });

    it("should create entity with custom key", () => {
      const entity = createEmptyEntity(EntityType.Character, "player", "hero");

      expect(entity.owner).toBe("player");
      expect(entity.type).toBe(EntityType.Character);
      expect(entity.key).toBe("hero");
      expect(entity.metadata?.title).toBe("New Character");
    });

    it("should create entity with all custom parameters", () => {
      const entity = createEmptyEntity(
        EntityType.Equipment,
        "admin",
        "legendary_sword",
      );

      expect(entity.owner).toBe("admin");
      expect(entity.type).toBe(EntityType.Equipment);
      expect(entity.key).toBe("legendary_sword");
      expect(entity.metadata?.title).toBe("New Equipment");
    });

    it("should create entities for all entity types", () => {
      const entityTypes = Object.values(EntityType);

      entityTypes.forEach((entityType) => {
        const entity = createEmptyEntity(entityType);

        expect(entity.type).toBe(entityType);
        expect(entity.metadata?.title).toContain(
          getEntityDisplayName(entityType),
        );
        expect(entity.metadata?.description).toBe(
          getEntityDescription(entityType),
        );
      });
    });

    it("should handle special characters in parameters", () => {
      const entity = createEmptyEntity(
        EntityType.Image,
        "user_123",
        "my-image_01",
      );

      expect(entity.owner).toBe("user_123");
      expect(entity.key).toBe("my-image_01");
      expect(entity.type).toBe(EntityType.Image);
    });
  });

  describe("validateEntityStructure", () => {
    it("should validate correct entity structure", () => {
      const entity = createEmptyEntity(EntityType.Sound);
      const result = validateEntityStructure(entity);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject null entity", () => {
      const result = validateEntityStructure(null);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Entity is null or undefined");
    });

    it("should reject undefined entity", () => {
      const result = validateEntityStructure(undefined);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Entity is null or undefined");
    });

    it("should reject entity with missing type", () => {
      const entity = createEmptyEntity(EntityType.Animation);
      delete (entity as any).type;

      const result = validateEntityStructure(entity);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Entity type must be a string");
    });

    it("should reject entity with missing key", () => {
      const entity = createEmptyEntity(EntityType.Cursor);
      delete (entity as any).key;

      const result = validateEntityStructure(entity);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Entity key must be a string");
    });

    it("should reject entity with missing owner", () => {
      const entity = createEmptyEntity(EntityType.Status);
      delete (entity as any).owner;

      const result = validateEntityStructure(entity);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Entity owner must be a string");
    });

    it("should reject entity with missing dates", () => {
      const entity = createEmptyEntity(EntityType.Stat);
      delete (entity as any).createdAt;
      delete (entity as any).modifiedAt;

      const result = validateEntityStructure(entity);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Entity createdAt must be a Date");
      expect(result.errors).toContain("Entity modifiedAt must be a Date");
    });

    it("should reject entity with null data", () => {
      const entity = createEmptyEntity(EntityType.Quality);
      (entity as any).data = null;

      const result = validateEntityStructure(entity);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Entity data cannot be null or undefined",
      );
    });

    it("should accept entity with valid structure and extra fields", () => {
      const entity = createEmptyEntity(EntityType.SoundBank);
      (entity as any).extraField = "some value";

      const result = validateEntityStructure(entity);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("getEntityType", () => {
    it("should return correct entity type", () => {
      const entity = createEmptyEntity(EntityType.AnimationSource);
      expect(getEntityType(entity)).toBe(EntityType.AnimationSource);
    });

    it("should work with all entity types", () => {
      const entityTypes = Object.values(EntityType);

      entityTypes.forEach((entityType) => {
        const entity = createEmptyEntity(entityType);
        expect(getEntityType(entity)).toBe(entityType);
      });
    });
  });

  describe("getEntityDisplayTitle", () => {
    it("should return title from metadata", () => {
      const entity = createEmptyEntity(EntityType.Sound);
      expect(getEntityDisplayTitle(entity)).toBe("New Sound");
    });

    it("should return fallback title when metadata is missing", () => {
      const entity = createEmptyEntity(EntityType.Sound);
      entity.metadata = undefined;

      expect(getEntityDisplayTitle(entity)).toBe("Sound new_entity");
    });

    it("should return fallback title when metadata title is missing", () => {
      const entity = createEmptyEntity(EntityType.DropTable);
      entity.metadata = { title: "", description: "test" };

      expect(getEntityDisplayTitle(entity)).toBe("Drop Table new_entity");
    });
  });

  describe("cloneEntity", () => {
    it("should create deep clone of entity", () => {
      const original = createEmptyEntity(EntityType.DropTable);
      const clone = cloneEntity(original);

      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone.metadata).not.toBe(original.metadata);
    });

    it("should handle nested properties correctly", () => {
      const original = createEmptyEntity(EntityType.Status);
      original.data = { nested: { value: "test" } };

      const clone = cloneEntity(original);

      expect(clone.data.nested.value).toBe("test");
      expect(clone.data.nested).not.toBe(original.data.nested);
    });
  });

  describe("updateEntityMetadata", () => {
    it("should update title and description", () => {
      const entity = createEmptyEntity(EntityType.Image);
      const updated = updateEntityMetadata(
        entity,
        "New Title",
        "New Description",
      );

      expect(updated.metadata?.title).toBe("New Title");
      expect(updated.metadata?.description).toBe("New Description");
      expect(updated).not.toBe(entity); // Should be a new instance
      expect(updated.modifiedAt).not.toEqual(entity.modifiedAt); // Should update modifiedAt
    });

    it("should update only title when description is not provided", () => {
      const entity = createEmptyEntity(EntityType.Cursor);
      const originalDescription = entity.metadata?.description;
      const updated = updateEntityMetadata(entity, "Updated Title");

      expect(updated.metadata?.title).toBe("Updated Title");
      expect(updated.metadata?.description).toBe(originalDescription);
    });

    it("should update only description when title is not provided", () => {
      const entity = createEmptyEntity(EntityType.Stat);
      const originalTitle = entity.metadata?.title;
      const updated = updateEntityMetadata(
        entity,
        undefined,
        "Updated Description",
      );

      expect(updated.metadata?.title).toBe(originalTitle);
      expect(updated.metadata?.description).toBe("Updated Description");
    });

    it("should create metadata if it does not exist", () => {
      const entity = createEmptyEntity(EntityType.Quality);
      entity.metadata = undefined;

      const updated = updateEntityMetadata(
        entity,
        "New Title",
        "New Description",
      );

      expect(updated.metadata?.title).toBe("New Title");
      expect(updated.metadata?.description).toBe("New Description");
    });

    it("should create metadata with defaults if no parameters provided", () => {
      const entity = createEmptyEntity(EntityType.AudioClip);
      entity.metadata = undefined;

      const updated = updateEntityMetadata(entity);

      expect(updated.metadata?.title).toBe("New Audio Clip");
      expect(updated.metadata?.description).toBe(
        getEntityDescription(EntityType.AudioClip),
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string parameters", () => {
      const entity = createEmptyEntity(EntityType.Model, "", "");

      expect(entity.owner).toBe("");
      expect(entity.key).toBe("");
      expect(entity.type).toBe(EntityType.Model);
    });

    it("should handle unicode characters", () => {
      const entity = createEmptyEntity(EntityType.Character, "юзер", "герой");

      expect(entity.owner).toBe("юзер");
      expect(entity.key).toBe("герой");
      expect(entity.type).toBe(EntityType.Character);
    });

    it("should handle very long strings", () => {
      const longString = "a".repeat(1000);
      const entity = createEmptyEntity(
        EntityType.Equipment,
        longString,
        longString,
      );

      expect(entity.owner).toBe(longString);
      expect(entity.key).toBe(longString);
    });

    it("should preserve Date objects through cloning", () => {
      const entity = createEmptyEntity(EntityType.Weapon);
      const originalDate = entity.createdAt;

      const clone = cloneEntity(entity);

      expect(clone.createdAt).toEqual(originalDate);
      expect(clone.createdAt).not.toBe(originalDate);
    });
  });
});
