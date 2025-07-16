import { SimpleEntity } from "@models/entity.types";
import { fileUtils } from "./file-utils";

/**
 * Utility class for handling entity file operations (save, delete, clone)
 * Manages the persistence of entities to the mounted folder
 */
export class EntityFileOperations {
  private directoryHandle: FileSystemDirectoryHandle | null;

  constructor(directoryHandle: FileSystemDirectoryHandle | null) {
    this.directoryHandle = directoryHandle;
  }

  /**
   * Generate the file path for an entity based on the naming convention: <name>.<type>.json
   */
  private generateFilePath(entity: SimpleEntity): string {
    const entityTypeLower = entity.type.toLowerCase();
    return `${entity.key}.${entityTypeLower}.json`;
  }

  /**
   * Convert a SimpleEntity to JSON format for saving to disk
   */
  private entityToJson(entity: SimpleEntity): string {
    const jsonData = {
      id: entity.id,
      type: entity.type,
      key: entity.key,
      owner: entity.owner,
      version: "1.0.0", // Default version if not specified
      createdAt: entity.createdAt.toISOString(),
      modifiedAt: entity.modifiedAt.toISOString(),
      metadata: entity.metadata,
      ...entity.data, // Spread the entity data at the root level
    };

    return JSON.stringify(jsonData, null, 2);
  }

  /**
   * Save an entity to disk
   */
  async saveEntity(entity: SimpleEntity): Promise<void> {
    if (!this.directoryHandle) {
      throw new Error(
        "No directory handle available. Please select a folder first.",
      );
    }

    if (!entity.id || !entity.key)
      throw new Error("Entity must have both id and key to be saved.");

    const filePath = this.generateFilePath(entity);
    const jsonContent = this.entityToJson(entity);

    try {
      await fileUtils.writeFile(this.directoryHandle, filePath, jsonContent);
      console.log(`Entity saved to file: ${filePath}`);
    } catch (error) {
      console.error(`Failed to save entity to file: ${filePath}`, error);
      throw new Error(
        `Failed to save entity to file: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Delete an entity file from disk
   */
  async deleteEntity(entity: SimpleEntity): Promise<void> {
    if (!this.directoryHandle) {
      throw new Error(
        "No directory handle available. Please select a folder first.",
      );
    }

    if (!entity.key) throw new Error("Entity must have a key to be deleted.");

    const filePath = this.generateFilePath(entity);

    try {
      // Check if file exists before trying to delete
      const exists = await fileUtils.fileExists(this.directoryHandle, filePath);
      if (!exists) {
        console.warn(`File does not exist: ${filePath}`);
        return; // Don't throw error if file doesn't exist
      }

      await fileUtils.deleteFile(this.directoryHandle, filePath);
      console.log(`Entity file deleted: ${filePath}`);
    } catch (error) {
      console.error(`Failed to delete entity file: ${filePath}`, error);
      throw new Error(
        `Failed to delete entity file: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Clone an entity by saving it with a new key
   */
  async cloneEntity(
    originalEntity: SimpleEntity,
    newKey: string,
  ): Promise<void> {
    if (!this.directoryHandle) {
      throw new Error(
        "No directory handle available. Please select a folder first.",
      );
    }

    // Create a new entity with the same data but different key and ID
    const clonedEntity: SimpleEntity = {
      ...originalEntity,
      key: newKey,
      createdAt: new Date(),
      modifiedAt: new Date(),
      metadata: {
        ...originalEntity.metadata,
        title: originalEntity.metadata?.title
          ? `${originalEntity.metadata.title} (Copy)`
          : `${newKey} (Copy)`,
        description:
          originalEntity.metadata?.description ||
          `Cloned ${originalEntity.type} entity`,
      },
    };

    await this.saveEntity(clonedEntity);
    console.log(`Entity cloned from ${originalEntity.key} to ${newKey}`);
  }

  /**
   * Update the directory handle (when user switches folders)
   */
  updateDirectoryHandle(
    directoryHandle: FileSystemDirectoryHandle | null,
  ): void {
    this.directoryHandle = directoryHandle;
  }

  /**
   * Check if file operations are available (directory is mounted)
   */
  isAvailable(): boolean {
    return this.directoryHandle !== null;
  }

  /**
   * Get the current directory handle
   */
  getDirectoryHandle(): FileSystemDirectoryHandle | null {
    return this.directoryHandle;
  }
}

/**
 * Singleton instance for entity file operations
 * Will be initialized with the directory handle from the app
 */
export const entityFileOps = new EntityFileOperations(null);
