import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  EntityType,
  SimpleEntity,
  createEmptyEntity,
  validateEntityStructure,
  cloneEntity,
} from "@models/entity.types";
import { entityFileOps } from "@utils/entity-file-operations";

interface EntityStoreState {
  entities: Map<string, SimpleEntity>;
  selectedEntityId: string | null;
  selectedEntityType: EntityType | null;
  isLoading: boolean;
  error: string | null;

  actions: {
    setSelectedEntity: (
      entityId: string | null,
      entityType: EntityType | null,
    ) => void;
    createEntity: (type: EntityType, owner?: string, key?: string) => string;
    updateEntity: (entityId: string, updates: Partial<SimpleEntity>) => void;
    deleteEntity: (entityId: string) => void;
    cloneEntity: (entityId: string, newKey?: string) => string;
    getEntity: (entityId: string) => SimpleEntity | undefined;
    getEntitiesByType: (type: EntityType) => SimpleEntity[];
    getAllEntities: () => SimpleEntity[];
    clearEntities: () => void;
    importEntities: (entities: SimpleEntity[]) => void;
    exportEntities: (entityType?: EntityType) => SimpleEntity[];
    validateEntity: (entityId: string) => {
      isValid: boolean;
      errors: string[];
    };
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    searchEntities: (query: string, type?: EntityType) => SimpleEntity[];
    getEntityCount: (type?: EntityType) => number;
    hasUnsavedChanges: () => boolean;
  };
}

const generateEntityId = (type: EntityType, key: string): string => {
  const timestamp = Date.now();
  return `${type}_${key}_${timestamp}`;
};

export const useEntityStore = create<EntityStoreState>()(
  devtools(
    (set, get) => ({
      entities: new Map(),
      selectedEntityId: null,
      selectedEntityType: null,
      isLoading: false,
      error: null,

      actions: {
        setSelectedEntity: (entityId, entityType) => {
          set({ selectedEntityId: entityId, selectedEntityType: entityType });
        },

        createEntity: (type, owner = "player", key = "new_entity") => {
          const entity = createEmptyEntity(type, owner, key);
          const entityId = generateEntityId(type, key);
          const entityWithId = { ...entity, id: entityId };

          // Update in-memory store first
          set((state) => {
            const newEntities = new Map(state.entities);
            newEntities.set(entityId, entityWithId);
            return { entities: newEntities };
          });

          // Save to disk asynchronously if file operations are available
          if (entityFileOps.isAvailable()) {
            entityFileOps
              .saveEntity(entityWithId)
              .then(() =>
                console.log(
                  `New entity ${entityWithId.key} created and saved to disk`,
                ),
              )
              .catch((error) =>
                console.error(
                  `Failed to save new entity ${entityWithId.key} to disk:`,
                  error,
                ),
              );
          }

          return entityId;
        },

        updateEntity: (entityId, updates) => {
          const state = get();
          const entity = state.entities.get(entityId);
          if (!entity) return;

          const updatedEntity = {
            ...entity,
            ...updates,
            modifiedAt: new Date(),
          };

          // Update in-memory store first
          set((state) => {
            const newEntities = new Map(state.entities);
            newEntities.set(entityId, updatedEntity);
            return { entities: newEntities };
          });

          // Save to disk asynchronously if file operations are available
          if (entityFileOps.isAvailable()) {
            entityFileOps
              .saveEntity(updatedEntity)
              .then(() =>
                console.log(`Entity ${updatedEntity.key} saved to disk`),
              )
              .catch((error) =>
                console.error(
                  `Failed to save entity ${updatedEntity.key} to disk:`,
                  error,
                ),
              );
          }
        },

        deleteEntity: (entityId) => {
          const state = get();
          const entity = state.entities.get(entityId);

          // Update in-memory store first
          set((state) => {
            const newEntities = new Map(state.entities);
            newEntities.delete(entityId);

            const newSelectedId =
              state.selectedEntityId === entityId
                ? null
                : state.selectedEntityId;
            const newSelectedType =
              state.selectedEntityId === entityId
                ? null
                : state.selectedEntityType;

            return {
              entities: newEntities,
              selectedEntityId: newSelectedId,
              selectedEntityType: newSelectedType,
            };
          });

          // Delete from disk asynchronously if file operations are available
          if (entity && entityFileOps.isAvailable()) {
            entityFileOps
              .deleteEntity(entity)
              .then(() => console.log(`Entity ${entity.key} deleted from disk`))
              .catch((error) =>
                console.error(
                  `Failed to delete entity ${entity.key} from disk:`,
                  error,
                ),
              );
          }
        },

        cloneEntity: (entityId, newKey = "cloned_entity") => {
          const entity = get().entities.get(entityId);
          if (!entity) return "";

          const clonedEntity = cloneEntity(entity);
          clonedEntity.key = newKey;

          const newEntityId = generateEntityId(entity.type, newKey);
          clonedEntity.id = newEntityId;

          // Update in-memory store first
          set((state) => {
            const newEntities = new Map(state.entities);
            newEntities.set(newEntityId, clonedEntity);
            return { entities: newEntities };
          });

          // Save to disk asynchronously if file operations are available
          if (entityFileOps.isAvailable()) {
            entityFileOps
              .saveEntity(clonedEntity)
              .then(() =>
                console.log(
                  `Entity ${clonedEntity.key} cloned and saved to disk`,
                ),
              )
              .catch((error) =>
                console.error(
                  `Failed to save cloned entity ${clonedEntity.key} to disk:`,
                  error,
                ),
              );
          }

          return newEntityId;
        },

        getEntity: (entityId) => {
          return get().entities.get(entityId);
        },

        getEntitiesByType: (type) => {
          const entities = get().entities;
          return Array.from(entities.values()).filter(
            (entity) => entity.type === type,
          );
        },

        getAllEntities: () => {
          return Array.from(get().entities.values());
        },

        clearEntities: () => {
          set({
            entities: new Map(),
            selectedEntityId: null,
            selectedEntityType: null,
          });
        },

        importEntities: (entities) => {
          set((state) => {
            const newEntities = new Map(state.entities);

            entities.forEach((entity) => {
              const validation = validateEntityStructure(entity);
              // Also check if the entity type is valid
              const isValidEntityType = Object.values(EntityType).includes(
                entity.type as EntityType,
              );

              if (validation.isValid && isValidEntityType) {
                const entityId =
                  entity.id || generateEntityId(entity.type, entity.key);
                newEntities.set(entityId, { ...entity, id: entityId });
              }
            });

            return { entities: newEntities };
          });
        },

        exportEntities: (entityType) => {
          const entities = get().entities;
          const allEntities = Array.from(entities.values());

          if (entityType)
            return allEntities.filter((entity) => entity.type === entityType);

          return allEntities;
        },

        validateEntity: (entityId) => {
          const entity = get().entities.get(entityId);
          if (!entity) return { isValid: false, errors: ["Entity not found"] };

          return validateEntityStructure(entity);
        },

        setLoading: (loading) => {
          set({ isLoading: loading });
        },

        setError: (error) => {
          set({ error });
        },

        searchEntities: (query, type) => {
          const entities = get().entities;
          const allEntities = Array.from(entities.values());

          let filteredEntities = allEntities;

          if (type) {
            filteredEntities = filteredEntities.filter(
              (entity) => entity.type === type,
            );
          }

          if (query.trim()) {
            const lowercaseQuery = query.toLowerCase();
            filteredEntities = filteredEntities.filter(
              (entity) =>
                entity.key?.toLowerCase().includes(lowercaseQuery) ||
                entity.type?.toLowerCase().includes(lowercaseQuery) ||
                entity.owner?.toLowerCase().includes(lowercaseQuery),
            );
          }

          return filteredEntities;
        },

        getEntityCount: (type) => {
          const entities = get().entities;
          const allEntities = Array.from(entities.values());

          if (type)
            return allEntities.filter((entity) => entity.type === type).length;

          return allEntities.length;
        },

        hasUnsavedChanges: () => {
          return false;
        },
      },
    }),
    { name: "entity-store" },
  ),
);

export const useEntityActions = () => useEntityStore((state) => state.actions);
export const useSelectedEntity = () =>
  useEntityStore((state) => ({
    selectedEntityId: state.selectedEntityId,
    selectedEntityType: state.selectedEntityType,
    entity: state.selectedEntityId
      ? state.entities.get(state.selectedEntityId)
      : undefined,
  }));
export const useEntityStoreState = () =>
  useEntityStore((state) => ({
    isLoading: state.isLoading,
    error: state.error,
    entityCount: state.entities.size,
  }));
