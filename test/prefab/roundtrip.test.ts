import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { serializeDefinition } from "@components/stage-editor/stage-file-utils";
import { AnchorEntityDefinition } from "@models/anchor.types";
import { RoomPrefabEntityDefinition } from "@models/roomprefab.types";
import { StageEntityDefinition } from "@models/stage.types";
import { usePrefabStore } from "@store/prefab.store";
import { prefabProblems, specProblems } from "@utils/mapgen-check";

const inline = {
  owner: "Octoio",
  type: "RoomPrefab",
  key: "CryptTest",
  version: 1,
  id: "Octoio:RoomPrefab:CryptTest:1",
  entity: {
    metadata: { title: "Test", description: "A test room." },
    generator: "Crypt",
    prefab_id: "crypt.test",
    size: { x: 30, z: 20.5 },
    door_band: 2,
    obstacles: [
      { kind: "Pillar", x: 4, z: 4, shape: "Circle", radius: 1.2 },
      { kind: "Wall", x: -5, z: 6, shape: "Box", half_x: 2, half_z: 0.5, yaw: 45, blocks_sight: false },
    ],
    slots: [{ slot: "Shrine", x: 0, z: 0, area: 2 }],
  },
};

describe("RoomPrefab JSON", () => {
  it("round-trips an inline file through the store and the serializer", () => {
    usePrefabStore.getState().open(inline as RoomPrefabEntityDefinition);
    const text = serializeDefinition(usePrefabStore.getState().definition);
    expect(text).toBe(JSON.stringify(inline, null, 2));
  });

  it("keeps optional fields absent", () => {
    usePrefabStore.getState().create("Bare");
    const entity = JSON.parse(serializeDefinition(usePrefabStore.getState().definition)).entity;
    expect(Object.keys(entity).sort()).toEqual(
      ["door_band", "generator", "metadata", "prefab_id", "size", "slots"],
    );
  });
});

// Round trip against the shipped game data when the sibling repo is checked out
const JSON_DIR = join(__dirname, "../../../fey-rs/data/json");
const shipped = existsSync(JSON_DIR);

const files = (dir: string, suffix: string) =>
  shipped && existsSync(join(JSON_DIR, dir))
    ? readdirSync(join(JSON_DIR, dir)).filter((f) => f.endsWith(suffix))
    : [];

describe.skipIf(!shipped)("shipped mapgen data", () => {
  it("round-trips every roomprefab file semantically", () => {
    const names = files("roomprefab", ".roomprefab.json");
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      const original = JSON.parse(readFileSync(join(JSON_DIR, "roomprefab", name), "utf8"));
      usePrefabStore.getState().open(original as RoomPrefabEntityDefinition);
      const saved = JSON.parse(serializeDefinition(usePrefabStore.getState().definition));
      expect(saved).toEqual(original);
    }
  });

  it("round-trips every stage and anchor file (generator and binding included)", () => {
    for (const dir of ["stage", "anchor"]) {
      for (const name of files(dir, ".json")) {
        const text = readFileSync(join(JSON_DIR, dir, name), "utf8");
        const original = JSON.parse(text) as StageEntityDefinition | AnchorEntityDefinition;
        expect(JSON.parse(serializeDefinition(original))).toEqual(original);
      }
    }
  });

  it("finds no problems in the shipped prefabs", () => {
    for (const name of files("roomprefab", ".roomprefab.json")) {
      const d = JSON.parse(readFileSync(join(JSON_DIR, "roomprefab", name), "utf8"));
      expect(prefabProblems(d.entity), name).toEqual([]);
    }
  });

  it("finds no problems in the shipped specs", () => {
    const kinds = new Map<string, string>();
    for (const name of files("roomprefab", ".roomprefab.json")) {
      const d = JSON.parse(readFileSync(join(JSON_DIR, "roomprefab", name), "utf8"));
      kinds.set(d.key, d.entity.generator);
    }
    let generated = 0;
    for (const name of files("stage", ".stage.json")) {
      const d = JSON.parse(readFileSync(join(JSON_DIR, "stage", name), "utf8")) as StageEntityDefinition;
      if (!d.entity.generator) continue;
      generated++;
      expect(specProblems(d.entity.generator, (r) => kinds.get(r.key) as never)).toEqual([]);
    }
    expect(generated).toBeGreaterThan(0);
  });
});
