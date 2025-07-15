/* eslint-disable @typescript-eslint/no-empty-function */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { scanFolderForEntities } from "@utils/entity-scanner";

// Mock console methods to avoid cluttering test output
const consoleSpy = {
  log: vi.spyOn(console, "log").mockImplementation(() => {}),
  error: vi.spyOn(console, "error").mockImplementation(() => {}),
  warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
};

// Mock File System Access API
const createMockFileSystemHandle = (
  files: Record<string, string> = {},
  directories: Record<string, any> = {},
) => {
  const values = async function* () {
    // Yield directories first
    for (const [name, content] of Object.entries(directories)) {
      yield {
        name,
        kind: "directory" as const,
        getDirectoryHandle: () => content,
      };
    }

    // Then yield files
    for (const [name] of Object.entries(files)) {
      yield {
        name,
        kind: "file" as const,
      };
    }
  };

  const getFileHandle = vi.fn((fileName: string) => {
    if (files[fileName] !== undefined) {
      return Promise.resolve({
        getFile: () =>
          Promise.resolve({
            text: () => Promise.resolve(files[fileName]),
          }),
      });
    }
    return Promise.reject(new Error(`File not found: ${fileName}`));
  });

  const getDirectoryHandle = vi.fn((dirName: string) => {
    if (directories[dirName]) return Promise.resolve(directories[dirName]);

    return Promise.reject(new Error(`Directory not found: ${dirName}`));
  });

  return {
    values,
    getFileHandle,
    getDirectoryHandle,
  };
};

describe("entity-scanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy.log.mockClear();
    consoleSpy.error.mockClear();
    consoleSpy.warn.mockClear();
  });

  describe("scanFolderForEntities", () => {
    it("should throw error when dirHandle is null", async () => {
      await expect(scanFolderForEntities("test", null)).rejects.toThrow(
        "Failed to scan folder: Directory handle is required for scanning",
      );
    });

    it("should scan directory and find JSON entities", async () => {
      const validEntity = JSON.stringify({
        type: "Weapon",
        owner: "test",
        key: "sword",
        id: 1,
        version: "1.0.0",
      });

      const invalidJson = "invalid json content";

      const mockHandle = createMockFileSystemHandle({
        "sword.json": validEntity,
        "invalid.json": invalidJson,
        "readme.txt": "This is a readme file",
      });

      const result = await scanFolderForEntities("test", mockHandle as any);

      expect(result.files).toHaveLength(3);
      expect(result.files[0]).toEqual({
        name: "sword.json",
        path: "sword.json",
        isEntity: true,
        entityType: "Weapon",
      });
      expect(result.files[1]).toEqual({
        name: "invalid.json",
        path: "invalid.json",
        isEntity: true,
        entityType: undefined,
      });
      expect(result.files[2]).toEqual({
        name: "readme.txt",
        path: "readme.txt",
        isEntity: false,
        entityType: undefined,
      });

      expect(result.entities.Weapon).toHaveLength(1);
      expect(result.entities.Weapon[0]).toEqual({
        id: 1,
        key: "sword",
        type: "Weapon",
        owner: "test",
        version: "1.0.0",
      });
    });

    it("should handle nested directories", async () => {
      const weaponEntity = JSON.stringify({
        type: "Weapon",
        owner: "test",
        key: "bow",
        id: 2,
        version: "1.0.0",
      });

      const itemEntity = JSON.stringify({
        type: "Equipment",
        owner: "test",
        key: "armor",
        id: 3,
        version: "1.0.0",
      });

      const weaponsDir = createMockFileSystemHandle({
        "bow.json": weaponEntity,
      });

      const itemsDir = createMockFileSystemHandle({
        "armor.json": itemEntity,
      });

      const rootHandle = createMockFileSystemHandle(
        {},
        {
          weapons: weaponsDir,
          items: itemsDir,
        },
      );

      const result = await scanFolderForEntities("test", rootHandle as any);

      expect(result.files).toHaveLength(2);
      expect(result.files.find((f) => f.name === "bow.json")).toEqual({
        name: "bow.json",
        path: "weapons/bow.json",
        isEntity: true,
        entityType: "Weapon",
      });
      expect(result.files.find((f) => f.name === "armor.json")).toEqual({
        name: "armor.json",
        path: "items/armor.json",
        isEntity: true,
        entityType: "Equipment",
      });

      expect(result.entities.Weapon).toHaveLength(1);
      expect(result.entities.Equipment).toHaveLength(1);
    });

    it("should handle directory access errors gracefully", async () => {
      const mockHandle = {
        values: async function* () {
          yield {
            name: "inaccessible-dir",
            kind: "directory" as const,
          };
          yield {
            name: "test.json",
            kind: "file" as const,
          };
        },
        getDirectoryHandle: vi
          .fn()
          .mockRejectedValue(new Error("Access denied")),
        getFileHandle: vi.fn().mockResolvedValue({
          getFile: () =>
            Promise.resolve({
              text: () =>
                Promise.resolve(
                  JSON.stringify({
                    type: "Weapon",
                    owner: "test",
                    key: "sword",
                    id: 1,
                  }),
                ),
            }),
        }),
      };

      const result = await scanFolderForEntities("test", mockHandle as any);

      expect(consoleSpy.warn).toHaveBeenCalledWith(
        "Could not access subdirectory: inaccessible-dir",
        expect.any(Error),
      );
      expect(result.files).toHaveLength(1);
      expect(result.entities.Weapon).toHaveLength(1);
    });

    it("should handle file processing errors gracefully", async () => {
      const mockHandle = {
        values: async function* () {
          yield {
            name: "error.json",
            kind: "file" as const,
          };
        },
        getFileHandle: vi
          .fn()
          .mockRejectedValue(new Error("File access error")),
      };

      const result = await scanFolderForEntities("test", mockHandle as any);

      expect(consoleSpy.warn).toHaveBeenCalledWith(
        "Error processing file error.json:",
        expect.any(Error),
      );
      expect(result.files).toHaveLength(1);
      expect(result.files[0].isEntity).toBe(true); // JSON file but not processed
      expect(result.files[0].entityType).toBeUndefined();
    });

    it("should handle JSON parsing errors", async () => {
      const mockHandle = createMockFileSystemHandle({
        "invalid.json": "{ invalid json content",
      });

      const result = await scanFolderForEntities("test", mockHandle as any);

      expect(consoleSpy.warn).toHaveBeenCalledWith(
        "Error parsing JSON in invalid.json: SyntaxError: Expected property name or '}' in JSON at position 2 (line 1 column 3)",
      );
      expect(result.files).toHaveLength(1);
      expect(result.files[0].entityType).toBeUndefined();
    });

    it("should skip files that don't have required entity fields", async () => {
      const incompleteEntity = JSON.stringify({
        type: "Weapon",
        // Missing owner, key, id
      });

      const mockHandle = createMockFileSystemHandle({
        "incomplete.json": incompleteEntity,
      });

      const result = await scanFolderForEntities("test", mockHandle as any);

      expect(result.files).toHaveLength(1);
      expect(result.files[0].entityType).toBeUndefined();
      expect(result.entities.Weapon).toHaveLength(0);
    });

    it("should provide mock data when no entities are found", async () => {
      const mockHandle = createMockFileSystemHandle({
        "empty.txt": "not an entity",
      });

      // Mock the mockScanDelay function to resolve immediately
      vi.doMock("@utils/entity-scanner", async () => {
        const actual = await vi.importActual("@utils/entity-scanner");
        return {
          ...actual,
          mockScanDelay: () => Promise.resolve(),
        };
      });

      const result = await scanFolderForEntities("test", mockHandle as any);

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "No entities found, providing mock data",
      );
      expect(result.files).toHaveLength(1);
      expect(
        Object.values(result.entities).every((arr) => arr.length === 0),
      ).toBe(true);
    });

    it("should handle different entity types", async () => {
      const entities = {
        "weapon.json": JSON.stringify({
          type: "Weapon",
          owner: "test",
          key: "sword",
          id: 1,
        }),
        "equipment.json": JSON.stringify({
          type: "Equipment",
          owner: "test",
          key: "armor",
          id: 2,
        }),
        "skill.json": JSON.stringify({
          type: "Skill",
          owner: "test",
          key: "fireball",
          id: 3,
        }),
        "stat.json": JSON.stringify({
          type: "Stat",
          owner: "test",
          key: "strength",
          id: 4,
        }),
      };

      const mockHandle = createMockFileSystemHandle(entities);

      const result = await scanFolderForEntities("test", mockHandle as any);

      expect(result.entities.Weapon).toHaveLength(1);
      expect(result.entities.Equipment).toHaveLength(1);
      expect(result.entities.Skill).toHaveLength(1);
      expect(result.entities.Stat).toHaveLength(1);

      expect(result.files).toHaveLength(4);
      result.files.forEach((file) => {
        expect(file.isEntity).toBe(true);
        expect(file.entityType).toBeDefined();
      });
    });

    it("should properly handle version field in entities", async () => {
      const entityWithVersion = JSON.stringify({
        type: "Weapon",
        owner: "test",
        key: "sword",
        id: 1,
        version: "2.1.0",
      });

      const mockHandle = createMockFileSystemHandle({
        "sword.json": entityWithVersion,
      });

      const result = await scanFolderForEntities("test", mockHandle as any);

      expect(result.entities.Weapon[0].version).toBe("2.1.0");
    });
  });
});
