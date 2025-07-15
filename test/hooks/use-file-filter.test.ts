import { describe, it, expect } from "vitest";
import { useFileFilter } from "@hooks/use-file-filter";
import { renderHook } from "@testing-library/react";
import { FileInfo } from "@utils/entity-scanner";

describe("useFileFilter Hook", () => {
  // Test data factory
  const createMockFile = (
    name: string,
    path: string,
    isEntity: boolean,
    entityType?: string,
  ): FileInfo => ({
    name,
    path,
    isEntity,
    entityType,
  });

  const mockFiles: FileInfo[] = [
    createMockFile(
      "fire-sword.json",
      "/weapons/fire-sword.json",
      true,
      "Weapon",
    ),
    createMockFile(
      "heal-potion.json",
      "/items/heal-potion.json",
      true,
      "Equipment",
    ),
    createMockFile("fireball.json", "/skills/fireball.json", true, "Skill"),
    createMockFile(
      "character-stats.json",
      "/stats/character-stats.json",
      true,
      "Stat",
    ),
    createMockFile("config.json", "/config/config.json", false),
    createMockFile("readme.txt", "/docs/readme.txt", false),
    createMockFile("ice-spell.json", "/skills/ice-spell.json", true, "Skill"),
    createMockFile(
      "dragon-sword.json",
      "/weapons/dragon-sword.json",
      true,
      "Weapon",
    ),
    createMockFile("script.js", "/scripts/script.js", false),
    createMockFile("styles.css", "/styles/styles.css", false),
    createMockFile("data.XML", "/data/data.XML", false), // Test case sensitivity
    createMockFile("noextension", "/files/noextension", false), // No extension
  ];

  describe("Basic Functionality", () => {
    it("should return all files when no filters applied", () => {
      const { result } = renderHook(() =>
        useFileFilter({
          files: mockFiles,
          searchText: "",
          fileTypeFilter: null,
        }),
      );

      expect(result.current.filteredFiles).toHaveLength(mockFiles.length);
      expect(result.current.filteredFiles).toEqual(mockFiles);
    });

    it("should return empty array when no files provided", () => {
      const { result } = renderHook(() =>
        useFileFilter({
          files: [],
          searchText: "",
          fileTypeFilter: null,
        }),
      );

      expect(result.current.filteredFiles).toHaveLength(0);
      expect(result.current.fileTypes).toHaveLength(0);
      expect(result.current.entityTypes).toEqual({});
    });

    it("should calculate file types correctly", () => {
      const { result } = renderHook(() =>
        useFileFilter({
          files: mockFiles,
          searchText: "",
          fileTypeFilter: null,
        }),
      );

      const expectedFileTypes = ["CSS", "JS", "JSON", "TXT", "UNKNOWN", "XML"];
      expect(result.current.fileTypes).toEqual(expectedFileTypes);
    });

    it("should calculate entity types correctly", () => {
      const { result } = renderHook(() =>
        useFileFilter({
          files: mockFiles,
          searchText: "",
          fileTypeFilter: null,
        }),
      );

      const expectedEntityTypes = {
        Weapon: 2,
        Equipment: 1,
        Skill: 2,
        Stat: 1,
      };
      expect(result.current.entityTypes).toEqual(expectedEntityTypes);
    });
  });

  describe("Search Text Filtering", () => {
    it("should filter by file name", () => {
      const { result } = renderHook(() =>
        useFileFilter({
          files: mockFiles,
          searchText: "fire",
          fileTypeFilter: null,
        }),
      );

      expect(result.current.filteredFiles).toHaveLength(2);
      expect(result.current.filteredFiles.map((f) => f.name)).toEqual([
        "fire-sword.json",
        "fireball.json",
      ]);
    });

    it("should filter by file path", () => {
      const { result } = renderHook(() =>
        useFileFilter({
          files: mockFiles,
          searchText: "/weapons",
          fileTypeFilter: null,
        }),
      );

      expect(result.current.filteredFiles).toHaveLength(2);
      expect(result.current.filteredFiles.map((f) => f.name)).toEqual([
        "fire-sword.json",
        "dragon-sword.json",
      ]);
    });

    it("should filter by entity type", () => {
      const { result } = renderHook(() =>
        useFileFilter({
          files: mockFiles,
          searchText: "Skill",
          fileTypeFilter: null,
        }),
      );

      expect(result.current.filteredFiles).toHaveLength(2);
      expect(result.current.filteredFiles.map((f) => f.name)).toEqual([
        "fireball.json",
        "ice-spell.json",
      ]);
    });

    it("should be case insensitive", () => {
      const { result } = renderHook(() =>
        useFileFilter({
          files: mockFiles,
          searchText: "FIRE",
          fileTypeFilter: null,
        }),
      );

      expect(result.current.filteredFiles).toHaveLength(2);
      expect(result.current.filteredFiles.map((f) => f.name)).toEqual([
        "fire-sword.json",
        "fireball.json",
      ]);
    });

    it("should handle partial matches", () => {
      const { result } = renderHook(() =>
        useFileFilter({
          files: mockFiles,
          searchText: "sword",
          fileTypeFilter: null,
        }),
      );

      expect(result.current.filteredFiles).toHaveLength(2);
      expect(result.current.filteredFiles.map((f) => f.name)).toEqual([
        "fire-sword.json",
        "dragon-sword.json",
      ]);
    });

    it("should handle search in nested paths", () => {
      const { result } = renderHook(() =>
        useFileFilter({
          files: mockFiles,
          searchText: "skills",
          fileTypeFilter: null,
        }),
      );

      expect(result.current.filteredFiles).toHaveLength(2);
      expect(result.current.filteredFiles.map((f) => f.name)).toEqual([
        "fireball.json",
        "ice-spell.json",
      ]);
    });

    it("should return empty array for non-matching search", () => {
      const { result } = renderHook(() =>
        useFileFilter({
          files: mockFiles,
          searchText: "nonexistent",
          fileTypeFilter: null,
        }),
      );

      expect(result.current.filteredFiles).toHaveLength(0);
    });

    it("should handle empty search text", () => {
      const { result } = renderHook(() =>
        useFileFilter({
          files: mockFiles,
          searchText: "",
          fileTypeFilter: null,
        }),
      );

      expect(result.current.filteredFiles).toHaveLength(mockFiles.length);
    });

    it("should handle whitespace-only search text", () => {
      const { result } = renderHook(() =>
        useFileFilter({
          files: mockFiles,
          searchText: "   ",
          fileTypeFilter: null,
        }),
      );

      // Whitespace should be treated as a search term
      expect(result.current.filteredFiles).toHaveLength(0);
    });
  });

  describe("File Type Filtering", () => {
    it("should filter by JSON file type", () => {
      const { result } = renderHook(() =>
        useFileFilter({
          files: mockFiles,
          searchText: "",
          fileTypeFilter: "JSON",
        }),
      );

      expect(result.current.filteredFiles).toHaveLength(7);
      expect(
        result.current.filteredFiles.every((f) => f.name.endsWith(".json")),
      ).toBe(true);
    });

    it("should filter by TXT file type", () => {
      const { result } = renderHook(() =>
        useFileFilter({
          files: mockFiles,
          searchText: "",
          fileTypeFilter: "TXT",
        }),
      );

      expect(result.current.filteredFiles).toHaveLength(1);
      expect(result.current.filteredFiles[0].name).toBe("readme.txt");
    });

    it("should filter by JS file type", () => {
      const { result } = renderHook(() =>
        useFileFilter({
          files: mockFiles,
          searchText: "",
          fileTypeFilter: "JS",
        }),
      );

      expect(result.current.filteredFiles).toHaveLength(1);
      expect(result.current.filteredFiles[0].name).toBe("script.js");
    });

    it("should filter by CSS file type", () => {
      const { result } = renderHook(() =>
        useFileFilter({
          files: mockFiles,
          searchText: "",
          fileTypeFilter: "CSS",
        }),
      );

      expect(result.current.filteredFiles).toHaveLength(1);
      expect(result.current.filteredFiles[0].name).toBe("styles.css");
    });

    it("should filter by XML file type (case insensitive extension)", () => {
      const { result } = renderHook(() =>
        useFileFilter({
          files: mockFiles,
          searchText: "",
          fileTypeFilter: "XML",
        }),
      );

      expect(result.current.filteredFiles).toHaveLength(1);
      expect(result.current.filteredFiles[0].name).toBe("data.XML");
    });

    it("should filter by UNKNOWN file type (no extension)", () => {
      const { result } = renderHook(() =>
        useFileFilter({
          files: mockFiles,
          searchText: "",
          fileTypeFilter: "UNKNOWN",
        }),
      );

      expect(result.current.filteredFiles).toHaveLength(1);
      expect(result.current.filteredFiles[0].name).toBe("noextension");
    });

    it("should return empty array for non-existing file type", () => {
      const { result } = renderHook(() =>
        useFileFilter({
          files: mockFiles,
          searchText: "",
          fileTypeFilter: "PDF",
        }),
      );

      expect(result.current.filteredFiles).toHaveLength(0);
    });

    it("should handle null file type filter", () => {
      const { result } = renderHook(() =>
        useFileFilter({
          files: mockFiles,
          searchText: "",
          fileTypeFilter: null,
        }),
      );

      expect(result.current.filteredFiles).toHaveLength(mockFiles.length);
    });
  });

  describe("Combined Filtering", () => {
    it("should apply both search text and file type filters", () => {
      const { result } = renderHook(() =>
        useFileFilter({
          files: mockFiles,
          searchText: "sword",
          fileTypeFilter: "JSON",
        }),
      );

      expect(result.current.filteredFiles).toHaveLength(2);
      expect(result.current.filteredFiles.map((f) => f.name)).toEqual([
        "fire-sword.json",
        "dragon-sword.json",
      ]);
    });

    it("should return empty array when filters don't match", () => {
      const { result } = renderHook(() =>
        useFileFilter({
          files: mockFiles,
          searchText: "readme",
          fileTypeFilter: "JSON",
        }),
      );

      expect(result.current.filteredFiles).toHaveLength(0);
    });

    it("should handle complex combined filtering", () => {
      const { result } = renderHook(() =>
        useFileFilter({
          files: mockFiles,
          searchText: "/skills",
          fileTypeFilter: "JSON",
        }),
      );

      expect(result.current.filteredFiles).toHaveLength(2);
      expect(result.current.filteredFiles.map((f) => f.name)).toEqual([
        "fireball.json",
        "ice-spell.json",
      ]);
    });
  });

  describe("Edge Cases", () => {
    it("should handle files with no entity type", () => {
      const filesWithoutEntityType = [
        createMockFile("test1.json", "/test1.json", true, undefined),
        createMockFile("test2.json", "/test2.json", true, ""),
        createMockFile("test3.json", "/test3.json", false),
      ];

      const { result } = renderHook(() =>
        useFileFilter({
          files: filesWithoutEntityType,
          searchText: "",
          fileTypeFilter: null,
        }),
      );

      expect(result.current.entityTypes).toEqual({});
      expect(result.current.filteredFiles).toHaveLength(3);
    });

    it("should handle files with complex extensions", () => {
      const complexFiles = [
        createMockFile("file.min.js", "/file.min.js", false),
        createMockFile("data.backup.json", "/data.backup.json", false),
        createMockFile("test.spec.ts", "/test.spec.ts", false),
        createMockFile("config.d.ts", "/config.d.ts", false),
      ];

      const { result } = renderHook(() =>
        useFileFilter({
          files: complexFiles,
          searchText: "",
          fileTypeFilter: null,
        }),
      );

      expect(result.current.fileTypes).toEqual(["JS", "JSON", "TS"]);
    });

    it("should handle special characters in search", () => {
      const specialFiles = [
        createMockFile(
          "file-with-dash.json",
          "/path/file-with-dash.json",
          false,
        ),
        createMockFile(
          "file_with_underscore.json",
          "/path/file_with_underscore.json",
          false,
        ),
        createMockFile(
          "file.with.dots.json",
          "/path/file.with.dots.json",
          false,
        ),
        createMockFile(
          "file with spaces.json",
          "/path/file with spaces.json",
          false,
        ),
      ];

      const { result } = renderHook(() =>
        useFileFilter({
          files: specialFiles,
          searchText: "with",
          fileTypeFilter: null,
        }),
      );

      expect(result.current.filteredFiles).toHaveLength(4);
    });

    it("should handle empty file names", () => {
      const edgeCaseFiles = [
        createMockFile("", "/empty", false),
        createMockFile(".hidden", "/.hidden", false),
        createMockFile("..parent", "/..parent", false),
      ];

      const { result } = renderHook(() =>
        useFileFilter({
          files: edgeCaseFiles,
          searchText: "",
          fileTypeFilter: null,
        }),
      );

      expect(result.current.fileTypes).toEqual(["UNKNOWN"]);
      expect(result.current.filteredFiles).toHaveLength(3);
    });

    it("should handle very long search terms", () => {
      const longSearchTerm = "a".repeat(1000);

      const { result } = renderHook(() =>
        useFileFilter({
          files: mockFiles,
          searchText: longSearchTerm,
          fileTypeFilter: null,
        }),
      );

      expect(result.current.filteredFiles).toHaveLength(0);
    });

    it("should handle large number of files efficiently", () => {
      const largeFileList = Array.from({ length: 1000 }, (_, i) =>
        createMockFile(
          `file-${i}.json`,
          `/files/file-${i}.json`,
          true,
          "TestEntity",
        ),
      );

      const { result } = renderHook(() =>
        useFileFilter({
          files: largeFileList,
          searchText: "file-1",
          fileTypeFilter: "JSON",
        }),
      );

      // Should find files that contain "file-1" (file-1.json, file-10.json, file-11.json, etc.)
      expect(result.current.filteredFiles.length).toBeGreaterThan(0);
      expect(result.current.entityTypes.TestEntity).toBe(1000);
    });
  });
});
