import { describe, it, expect, beforeEach } from "vitest";
import { EntityType, SimpleEntity } from "@models/entity.types";
import {
  useEntityStore,
  useEntityActions,
  useSelectedEntity,
  useEntityStoreState,
} from "@store/entity.store";
import { renderHook } from "@testing-library/react";

describe("Entity Store", () => {
  beforeEach(() => {
    // Reset the store completely before each test
    useEntityStore.setState({
      entities: new Map(),
      selectedEntityId: null,
      selectedEntityType: null,
      isLoading: false,
      error: null,
      actions: useEntityStore.getState().actions, // Keep the actions reference
    });
  });

  describe("Basic Entity Operations", () => {
    it("should create a new entity", () => {
      const { actions } = useEntityStore.getState();
      const entityId = actions.createEntity(
        EntityType.Weapon,
        "player",
        "test_weapon",
      );

      const entity = actions.getEntity(entityId);
      expect(entity).toBeDefined();
      expect(entity?.type).toBe(EntityType.Weapon);
      expect(entity?.key).toBe("test_weapon");
      expect(entity?.owner).toBe("player");
      expect(entity?.id).toBe(entityId);
    });

    it("should update an existing entity", () => {
      const { actions } = useEntityStore.getState();
      const entityId = actions.createEntity(
        EntityType.Weapon,
        "player",
        "test_weapon",
      );

      actions.updateEntity(entityId, { key: "updated_weapon", owner: "npc" });

      const entity = actions.getEntity(entityId);
      expect(entity?.key).toBe("updated_weapon");
      expect(entity?.owner).toBe("npc");
      expect(entity?.modifiedAt).toBeDefined();
    });

    it("should delete an entity", () => {
      const { actions } = useEntityStore.getState();
      const entityId = actions.createEntity(
        EntityType.Weapon,
        "player",
        "test_weapon",
      );

      actions.deleteEntity(entityId);

      const entity = actions.getEntity(entityId);
      expect(entity).toBeUndefined();
    });

    it("should clone an entity", () => {
      const { actions } = useEntityStore.getState();
      const entityId = actions.createEntity(
        EntityType.Weapon,
        "player",
        "test_weapon",
      );

      const clonedId = actions.cloneEntity(entityId, "cloned_weapon");

      const originalEntity = actions.getEntity(entityId);
      const clonedEntity = actions.getEntity(clonedId);

      expect(clonedEntity).toBeDefined();
      expect(clonedEntity?.key).toBe("cloned_weapon");
      expect(clonedEntity?.type).toBe(originalEntity?.type);
      expect(clonedEntity?.owner).toBe(originalEntity?.owner);
      expect(clonedEntity?.id).not.toBe(originalEntity?.id);
    });

    it("should return undefined for non-existent entity", () => {
      const { actions } = useEntityStore.getState();
      const entity = actions.getEntity("non-existent-id");
      expect(entity).toBeUndefined();
    });
  });

  describe("Entity Selection", () => {
    it("should set selected entity", () => {
      const { actions } = useEntityStore.getState();
      const entityId = actions.createEntity(
        EntityType.Weapon,
        "player",
        "test_weapon",
      );

      actions.setSelectedEntity(entityId, EntityType.Weapon);

      const state = useEntityStore.getState();
      expect(state.selectedEntityId).toBe(entityId);
      expect(state.selectedEntityType).toBe(EntityType.Weapon);
    });

    it("should clear selected entity", () => {
      const { actions } = useEntityStore.getState();
      const entityId = actions.createEntity(
        EntityType.Weapon,
        "player",
        "test_weapon",
      );

      actions.setSelectedEntity(entityId, EntityType.Weapon);
      actions.setSelectedEntity(null, null);

      const state = useEntityStore.getState();
      expect(state.selectedEntityId).toBeNull();
      expect(state.selectedEntityType).toBeNull();
    });

    it("should clear selection when deleting selected entity", () => {
      const { actions } = useEntityStore.getState();
      const entityId = actions.createEntity(
        EntityType.Weapon,
        "player",
        "test_weapon",
      );

      actions.setSelectedEntity(entityId, EntityType.Weapon);
      actions.deleteEntity(entityId);

      const state = useEntityStore.getState();
      expect(state.selectedEntityId).toBeNull();
      expect(state.selectedEntityType).toBeNull();
    });
  });

  describe("Entity Filtering and Searching", () => {
    beforeEach(() => {
      const { actions } = useEntityStore.getState();
      actions.createEntity(EntityType.Weapon, "player", "sword");
      actions.createEntity(EntityType.Weapon, "npc", "axe");
      actions.createEntity(EntityType.Character, "player", "hero");
      actions.createEntity(EntityType.Skill, "player", "fireball");
    });

    it("should get entities by type", () => {
      const { actions } = useEntityStore.getState();
      const weapons = actions.getEntitiesByType(EntityType.Weapon);
      const characters = actions.getEntitiesByType(EntityType.Character);

      expect(weapons).toHaveLength(2);
      expect(characters).toHaveLength(1);
      expect(weapons.every((e) => e.type === EntityType.Weapon)).toBe(true);
      expect(characters.every((e) => e.type === EntityType.Character)).toBe(
        true,
      );
    });

    it("should get all entities", () => {
      const { actions } = useEntityStore.getState();
      const allEntities = actions.getAllEntities();

      expect(allEntities).toHaveLength(4);
    });

    it("should search entities by key", () => {
      const { actions } = useEntityStore.getState();
      const results = actions.searchEntities("sword");

      expect(results).toHaveLength(1);
      expect(results[0].key).toBe("sword");
    });

    it("should search entities by type", () => {
      const { actions } = useEntityStore.getState();
      const results = actions.searchEntities("weapon");

      expect(results).toHaveLength(2);
      expect(results.every((e) => e.type === EntityType.Weapon)).toBe(true);
    });

    it("should search entities by owner", () => {
      const { actions } = useEntityStore.getState();
      const results = actions.searchEntities("npc");

      expect(results).toHaveLength(1);
      expect(results[0].owner).toBe("npc");
    });

    it("should search entities with type filter", () => {
      const { actions } = useEntityStore.getState();
      const results = actions.searchEntities("player", EntityType.Weapon);

      expect(results).toHaveLength(1);
      expect(results[0].type).toBe(EntityType.Weapon);
      expect(results[0].owner).toBe("player");
    });

    it("should return empty array for no matches", () => {
      const { actions } = useEntityStore.getState();
      const results = actions.searchEntities("nonexistent");

      expect(results).toHaveLength(0);
    });
  });

  describe("Entity Counting", () => {
    beforeEach(() => {
      const { actions } = useEntityStore.getState();
      actions.createEntity(EntityType.Weapon, "player", "sword");
      actions.createEntity(EntityType.Weapon, "npc", "axe");
      actions.createEntity(EntityType.Character, "player", "hero");
    });

    it("should count all entities", () => {
      const { actions } = useEntityStore.getState();
      const count = actions.getEntityCount();

      expect(count).toBe(3);
    });

    it("should count entities by type", () => {
      const { actions } = useEntityStore.getState();
      const weaponCount = actions.getEntityCount(EntityType.Weapon);
      const characterCount = actions.getEntityCount(EntityType.Character);
      const skillCount = actions.getEntityCount(EntityType.Skill);

      expect(weaponCount).toBe(2);
      expect(characterCount).toBe(1);
      expect(skillCount).toBe(0);
    });
  });

  describe("Import/Export Operations", () => {
    it("should import entities", () => {
      const { actions } = useEntityStore.getState();
      const entitiesToImport: SimpleEntity[] = [
        {
          id: "imported_1",
          type: EntityType.Weapon,
          key: "imported_sword",
          owner: "player",
          data: {},
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
        {
          id: "imported_2",
          type: EntityType.Character,
          key: "imported_hero",
          owner: "player",
          data: {},
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
      ];

      actions.importEntities(entitiesToImport);

      const importedWeapon = actions.getEntity("imported_1");
      const importedCharacter = actions.getEntity("imported_2");

      expect(importedWeapon).toBeDefined();
      expect(importedCharacter).toBeDefined();
      expect(importedWeapon?.key).toBe("imported_sword");
      expect(importedCharacter?.key).toBe("imported_hero");
    });

    it("should export all entities", () => {
      const { actions } = useEntityStore.getState();
      actions.createEntity(EntityType.Weapon, "player", "sword");
      actions.createEntity(EntityType.Character, "player", "hero");

      const exported = actions.exportEntities();

      expect(exported).toHaveLength(2);
    });

    it("should export entities by type", () => {
      const { actions } = useEntityStore.getState();
      actions.createEntity(EntityType.Weapon, "player", "sword");
      actions.createEntity(EntityType.Character, "player", "hero");

      const exportedWeapons = actions.exportEntities(EntityType.Weapon);
      const exportedCharacters = actions.exportEntities(EntityType.Character);

      expect(exportedWeapons).toHaveLength(1);
      expect(exportedCharacters).toHaveLength(1);
      expect(exportedWeapons[0].type).toBe(EntityType.Weapon);
      expect(exportedCharacters[0].type).toBe(EntityType.Character);
    });

    it("should skip invalid entities during import", () => {
      const { actions } = useEntityStore.getState();
      const entitiesToImport = [
        {
          id: "valid_1",
          type: EntityType.Weapon,
          key: "valid_sword",
          owner: "player",
          data: {},
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
        {
          id: "invalid_1",
          type: "invalid_type" as EntityType,
          key: "invalid_entity",
          owner: "player",
          data: {},
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
      ];

      actions.importEntities(entitiesToImport);

      const validEntity = actions.getEntity("valid_1");
      const invalidEntity = actions.getEntity("invalid_1");

      expect(validEntity).toBeDefined();
      expect(invalidEntity).toBeUndefined();
    });
  });

  describe("Entity Validation", () => {
    it("should validate valid entity", () => {
      const { actions } = useEntityStore.getState();
      const entityId = actions.createEntity(
        EntityType.Weapon,
        "player",
        "test_weapon",
      );

      const validation = actions.validateEntity(entityId);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should return error for non-existent entity", () => {
      const { actions } = useEntityStore.getState();
      const validation = actions.validateEntity("non-existent-id");

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Entity not found");
    });
  });

  describe("State Management", () => {
    it("should set loading state", () => {
      const { actions } = useEntityStore.getState();

      actions.setLoading(true);
      expect(useEntityStore.getState().isLoading).toBe(true);

      actions.setLoading(false);
      expect(useEntityStore.getState().isLoading).toBe(false);
    });

    it("should set error state", () => {
      const { actions } = useEntityStore.getState();

      actions.setError("Test error");
      expect(useEntityStore.getState().error).toBe("Test error");

      actions.setError(null);
      expect(useEntityStore.getState().error).toBeNull();
    });

    it("should clear all entities", () => {
      const { actions } = useEntityStore.getState();
      actions.createEntity(EntityType.Weapon, "player", "sword");
      actions.createEntity(EntityType.Character, "player", "hero");

      actions.clearEntities();

      const allEntities = actions.getAllEntities();
      expect(allEntities).toHaveLength(0);
      expect(useEntityStore.getState().selectedEntityId).toBeNull();
      expect(useEntityStore.getState().selectedEntityType).toBeNull();
    });
  });

  describe("Store Hooks", () => {
    it("should provide entity actions hook", () => {
      const { result } = renderHook(() => useEntityActions());

      expect(result.current).toBeDefined();
      expect(typeof result.current.createEntity).toBe("function");
      expect(typeof result.current.updateEntity).toBe("function");
      expect(typeof result.current.deleteEntity).toBe("function");
    });

    it("should provide selected entity hook", () => {
      const { actions } = useEntityStore.getState();
      const entityId = actions.createEntity(
        EntityType.Weapon,
        "player",
        "test_weapon",
      );
      actions.setSelectedEntity(entityId, EntityType.Weapon);

      const { result } = renderHook(() => useSelectedEntity());

      expect(result.current.selectedEntityId).toBe(entityId);
      expect(result.current.selectedEntityType).toBe(EntityType.Weapon);
      expect(result.current.entity).toBeDefined();
    });

    it("should provide store state hook", () => {
      const { actions } = useEntityStore.getState();
      actions.setLoading(true);
      actions.setError("Test error");
      actions.createEntity(EntityType.Weapon, "player", "test_weapon");

      const { result } = renderHook(() => useEntityStoreState());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBe("Test error");
      expect(result.current.entityCount).toBe(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle cloning non-existent entity", () => {
      const { actions } = useEntityStore.getState();
      const clonedId = actions.cloneEntity("non-existent-id", "cloned_entity");

      expect(clonedId).toBe("");
    });

    it("should handle updating non-existent entity", () => {
      const { actions } = useEntityStore.getState();
      const initialCount = actions.getEntityCount();

      actions.updateEntity("non-existent-id", { key: "updated_key" });

      const finalCount = actions.getEntityCount();
      expect(finalCount).toBe(initialCount);
    });

    it("should handle deleting non-existent entity", () => {
      const { actions } = useEntityStore.getState();
      const initialCount = actions.getEntityCount();

      actions.deleteEntity("non-existent-id");

      const finalCount = actions.getEntityCount();
      expect(finalCount).toBe(initialCount);
    });

    it("should handle empty search query", () => {
      const { actions } = useEntityStore.getState();
      actions.createEntity(EntityType.Weapon, "player", "sword");

      const results = actions.searchEntities("");

      expect(results).toHaveLength(1);
    });

    it("should handle empty entity import", () => {
      const { actions } = useEntityStore.getState();
      const initialCount = actions.getEntityCount();

      actions.importEntities([]);

      const finalCount = actions.getEntityCount();
      expect(finalCount).toBe(initialCount);
    });
  });
});
