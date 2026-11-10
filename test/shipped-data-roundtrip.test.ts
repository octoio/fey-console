import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { serializeDefinition } from "@components/stage-editor/stage-file-utils";
import { EntityType } from "@models/common.types";
import { RoomPrefabEntityDefinition } from "@models/roomprefab.types";
import { usePrefabStore } from "@store/prefab.store";
import { useSkillStore } from "@store/skill.store";

// Every entity file of the game data checkout goes through the code the editor loads and saves with.
// A field the editor does not carry would vanish from the file at the next save: that is the damage
// this test counts. Skipped when the sibling fey-rs checkout is absent.
const JSON_DIR = join(__dirname, "../../fey-rs/data/json");
const shipped = existsSync(JSON_DIR);

// -0 and 0 are the same number in the data; the editor writes 0
const noNegativeZero = (_key: string, value: unknown) =>
  Object.is(value, -0) ? 0 : value;

const entityFiles = (): { path: string; text: string }[] =>
  readdirSync(JSON_DIR, { recursive: true, encoding: "utf8" })
    .filter((p) => p.endsWith(".json"))
    .sort()
    .map((p) => ({ path: p, text: readFileSync(join(JSON_DIR, p), "utf8") }));

describe.skipIf(!shipped)("shipped data through the editor", () => {
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

// The editor that owns the type loads it into its store and saves from there; a type no editor
// rewrites is written as read
function saveThroughEditor(original: { type: string }): string {
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
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, sortKeys(v)]),
    );
  }
  return value;
}
