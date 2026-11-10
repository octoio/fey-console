import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect, vi } from "vitest";
import { serializeDefinition } from "@components/stage-editor/stage-file-utils";
import { EntityType } from "@models/common.types";
import { RoomPrefabEntityDefinition } from "@models/roomprefab.types";
import { usePrefabStore } from "@store/prefab.store";
import { useSkillStore } from "@store/skill.store";
import { SHIPPED_JSON_DIR, hasShippedData, shippedTitle } from "@test-utils/shipped-data";
import { scanFolderForEntities } from "@utils/entity-scanner";

// Every entity file of the game data checkout goes through the code the editor loads and saves with.
// A field the editor does not carry would vanish from the file at the next save: that is the damage
// this test counts. Skipped (and says so) when no game data is found, see utils/shipped-data.ts.
const JSON_DIR = SHIPPED_JSON_DIR ?? "";

// -0 and 0 are the same number in the data; the editor writes 0
const noNegativeZero = (_key: string, value: unknown) =>
  Object.is(value, -0) ? 0 : value;

const entityFiles = (): { path: string; text: string }[] =>
  readdirSync(JSON_DIR, { recursive: true, encoding: "utf8" })
    .filter((p) => p.endsWith(".json"))
    .sort()
    .map((p) => ({ path: p, text: readFileSync(join(JSON_DIR, p), "utf8") }));

// A File System Access directory handle over a real folder
const handleOf = (dir: string): FileSystemDirectoryHandle =>
  ({
    values: async function* () {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        yield {
          name: entry.name,
          kind: entry.isDirectory() ? "directory" : "file",
        };
      }
    },
    getDirectoryHandle: async (name: string) => handleOf(join(dir, name)),
    getFileHandle: async (name: string) => ({
      getFile: async () => ({
        text: async () => readFileSync(join(dir, name), "utf8"),
      }),
    }),
  }) as unknown as FileSystemDirectoryHandle;

const sortKeys = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, sortKeys(v)]),
    );
  }
  return value;
};

// The editor that owns the type loads it into its store and saves from there; a type no editor
// rewrites is written as read
const saveThroughEditor = (original: { type: string }): string => {
  if (original.type === EntityType.Skill) {
    useSkillStore.getState().importFromJson(JSON.stringify(original));
    return useSkillStore.getState().exportToJson();
  }
  if (original.type === EntityType.RoomPrefab) {
    usePrefabStore
      .getState()
      .open(original as unknown as RoomPrefabEntityDefinition);
    return serializeDefinition(usePrefabStore.getState().definition);
  }
  return serializeDefinition(original);
};

describe.skipIf(!hasShippedData)(shippedTitle("shipped data through the editor"), () => {
  it("indexes every entity file in the folder scan", async () => {
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { entities, files } = await scanFolderForEntities(
      "data/json",
      handleOf(JSON_DIR),
    );
    const indexed = Object.values(entities).reduce((n, r) => n + r.length, 0);
    expect(warn.mock.calls.map((c) => String(c[0]))).toEqual([]);
    expect(indexed).toBe(files.filter((f) => f.name.endsWith(".json")).length);
  });

  it("names only entity types the editor knows", () => {
    const known = new Set<string>(Object.values(EntityType));
    const unknown = entityFiles()
      .map((f) => JSON.parse(f.text).type as string)
      .filter((type) => !known.has(type));
    expect([...new Set(unknown)]).toEqual([]);
  });

  it("saves every file back as it was read", () => {
    const damaged: string[] = [];
    for (const { path, text } of entityFiles()) {
      const original = JSON.parse(text, noNegativeZero);
      const saved = JSON.parse(saveThroughEditor(original));
      if (
        JSON.stringify(sortKeys(saved)) !== JSON.stringify(sortKeys(original))
      )
        damaged.push(path);
    }
    expect(damaged).toEqual([]);
  });
});
