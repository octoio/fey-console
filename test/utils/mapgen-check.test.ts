import { describe, it, expect } from "vitest";
import { EntityReference, EntityType } from "@models/common.types";
import {
  createDefaultGeneratorSpec,
  createDefaultRequirement,
  Facing,
  GeneratorKind,
  GeneratorSpec,
  PathRule,
  RoomRole,
  SeedPolicy,
} from "@models/generator.types";
import { createDefaultRoomPrefab } from "@models/roomprefab.types";
import { ObstacleKind, ObstacleShape } from "@models/stage.types";
import {
  bindingProblems,
  hintsFor,
  prefabProblems,
  prefabWarnings,
  specProblems,
} from "@utils/mapgen-check";

const ref = (key: string): EntityReference => ({
  owner: "Octoio",
  type: EntityType.RoomPrefab,
  key,
  version: 1,
  id: `Octoio:RoomPrefab:${key}:1`,
});

const spec = (patch: Partial<GeneratorSpec> = {}): GeneratorSpec => ({
  ...createDefaultGeneratorSpec(),
  ...patch,
});

describe("specProblems", () => {
  it("accepts the default spec", () => {
    expect(specProblems(spec())).toEqual([]);
  });

  it("flags a main path under 2 rooms and min above max", () => {
    const s = spec();
    s.connections.main_path = { min: 1, max: 1 };
    expect(specProblems(s)).toContain(
      "main path [1, 1] must be at least 2 rooms with min <= max",
    );
  });

  it("flags inverted loops and branch length", () => {
    const s = spec();
    s.connections.loops = { min: 3, max: 1 };
    s.connections.branch_len = { min: 2, max: 1 };
    const p = specProblems(s);
    expect(p).toContain("loops [3, 1]: min > max");
    expect(p).toContain("branch length [2, 1]: min > max");
  });

  it("flags min above max and a bad depth range", () => {
    const r = { ...createDefaultRequirement(RoomRole.Combat), min: 3, max: 1, placement: { min_depth: 4, max_depth: 2 } };
    const p = specProblems(spec({ requirements: [...spec().requirements, r] }));
    expect(p).toContain("combat: min 3 > max 1");
    expect(p).toContain("combat: max depth below min depth");
  });

  it("checks the farthest room rules", () => {
    const s = spec();
    s.requirements.push({
      ...createDefaultRequirement(RoomRole.Treasure),
      min: 1,
      max: 2,
      path: PathRule.Branch,
      placement: { farthest: true, min_depth: 20 },
    });
    const p = specProblems(s);
    expect(p).toContain("more than one requirement claims the farthest room");
    expect(p).toContain("treasure: the farthest room is one room (min/max must be 1)");
    expect(p).toContain("treasure: the farthest room is on the main path, not a branch");
    expect(p.some((m) => m.startsWith("treasure must be at depth >= 20"))).toBe(true);
  });

  it("flags a chokepoint off the main path and a second entrance", () => {
    const s = spec();
    s.requirements.push({
      ...createDefaultRequirement(RoomRole.Ambush),
      placement: { chokepoint: true },
    });
    s.requirements[0].max = 2;
    const p = specProblems(s);
    expect(p).toContain("ambush: a chokepoint must be on the main path");
    expect(p).toContain("entrance: exactly one");
  });

  it("checks required main path rooms against the main path length", () => {
    const s = spec();
    s.connections.main_path = { min: 4, max: 4 };
    s.requirements.push({
      ...createDefaultRequirement(RoomRole.Rest),
      min: 3,
      max: 3,
      path: PathRule.MainPath,
    });
    expect(specProblems(s)).toContain(
      "the main path needs 3 required rooms between the entrance and the end, but has at most 2",
    );
  });

  it("checks spacing against the main path", () => {
    const s = spec();
    s.connections.main_path = { min: 7, max: 7 };
    s.requirements.push({
      ...createDefaultRequirement(RoomRole.Ambush),
      min: 3,
      max: 3,
      path: PathRule.MainPath,
      min_spacing: 3,
    });
    expect(
      specProblems(s).some((m) => m.startsWith("ambush: 3 rooms 3 apart")),
    ).toBe(true);
  });

  it("resolves prefab references: unknown and wrong generator", () => {
    const s = spec();
    s.requirements[1].prefab = ref("Missing");
    s.requirements.push({ ...createDefaultRequirement(RoomRole.Rest), prefab: ref("ForestGlade") });
    const lookup = (r: EntityReference) =>
      r.key === "ForestGlade" ? GeneratorKind.Forest : undefined;
    const p = specProblems(s, lookup);
    expect(p).toContain("boss: unknown prefab Missing");
    expect(p).toContain("rest: prefab ForestGlade is not a Crypt prefab");
    expect(specProblems(s, lookup, { checkPrefabExistence: false })).not.toContain(
      "boss: unknown prefab Missing",
    );
  });

  it("checks pinned prefabs: role, position count", () => {
    const s = spec({
      pinned: [
        { prefab: ref("A"), role: RoomRole.Treasure, at: { x: 0, z: 0 }, facing: Facing.PosX },
        { prefab: ref("B"), role: RoomRole.Boss, at: { x: 5, z: 5 } },
      ],
    });
    const p = specProblems(s, () => GeneratorKind.Crypt);
    expect(p).toContain("pinned prefab A needs a treasure room but no requirement makes one");
    expect(p).toContain("only one pinned prefab may have a fixed position");
  });

  it("checks seed policy and par", () => {
    expect(specProblems(spec({ seed_policy: SeedPolicy.Fixed }))).toContain(
      "seed policy Fixed needs fixed_seed",
    );
    expect(specProblems(spec({ fixed_seed: 3 }))).toContain(
      "fixed_seed is only used by seed policy Fixed",
    );
    expect(
      specProblems(spec({ par: { boss_path: { min: 200, max: 150 } } })),
    ).toContain("par boss_path [200, 150]: needs 0 <= min <= max");
  });

  it("applies the schema minimums", () => {
    const p = specProblems(spec({ version: 0, requirements: [], party_size: 0 }));
    expect(p).toContain("version must be at least 1");
    expect(p).toContain("at least one requirement");
    expect(p).toContain("party size 0");
  });
});

describe("hintsFor", () => {
  it("hints at the M3 par rules", () => {
    const h = hintsFor(spec());
    expect(h.some((m) => m.startsWith("no par"))).toBe(true);
  });
  it("is quiet for a tuned spec", () => {
    const s = spec({ par: { boss_path: { min: 150, max: 200 } } });
    expect(hintsFor(s)).toEqual([]);
  });
  it("hints at ambush spacing and a stale version", () => {
    const s = spec({ version: 1, par: { boss_path: { min: 150, max: 200 } } });
    s.requirements.push({ ...createDefaultRequirement(RoomRole.Ambush), min: 2, max: 2 });
    const h = hintsFor(s);
    expect(h.some((m) => m.includes("min_spacing 2"))).toBe(true);
    expect(h.some((m) => m.includes("version 1"))).toBe(true);
  });
});

describe("prefabProblems", () => {
  it("accepts a default prefab", () => {
    expect(prefabProblems(createDefaultRoomPrefab())).toEqual([]);
  });
  it("checks the prefab id format", () => {
    const p = createDefaultRoomPrefab();
    p.prefab_id = "Crypt Room";
    expect(prefabProblems(p)[0]).toMatch(/prefab_id/);
    p.prefab_id = "crypt.hollow_nest";
    expect(prefabProblems(p)).toEqual([]);
  });
  it("checks obstacles and slots", () => {
    const p = createDefaultRoomPrefab();
    p.obstacles = [
      { kind: ObstacleKind.Pillar, shape: ObstacleShape.Circle, x: 5, z: 5 },
      { kind: ObstacleKind.Pillar, shape: ObstacleShape.Circle, x: 50, z: 5, radius: 1 },
      { kind: ObstacleKind.Pillar, shape: ObstacleShape.Circle, x: 1, z: 6, radius: 1 },
    ];
    p.slots = [{ slot: "Chest" as never, x: 99, z: 0 }];
    const m = prefabProblems(p);
    expect(m).toContain("obstacle 0: needs finite coordinates and positive extents");
    expect(m.some((x) => x.includes("centre is outside"))).toBe(false);
    const w = prefabWarnings(p);
    expect(w).toContain("obstacle 1: centre is outside the room");
    expect(w).toContain("obstacle 2: stands in a door band (keep it free of props)");
    expect(m).toContain("slot 0 (Chest): outside the room");
  });
});

describe("bindingProblems", () => {
  it("wants a binding on every anchor", () => {
    expect(bindingProblems([{ key: "A" }])).toEqual([
      "anchor A: no binding on a stage with a generator",
    ]);
  });
  it("flags duplicates and ordinal gaps", () => {
    const slot = "PackSpawn" as never;
    const p = bindingProblems([
      { key: "A", binding: { slot } },
      { key: "B", binding: { slot, ordinal: 0 } },
      { key: "C", binding: { slot, ordinal: 2 } },
    ]);
    expect(p).toContain("anchor B: same binding as A (PackSpawn#0)");
    expect(p.some((m) => m.includes("missing 1"))).toBe(true);
  });
  it("accepts 0..n-1", () => {
    const slot = "PackSpawn" as never;
    expect(
      bindingProblems([
        { key: "A", binding: { slot } },
        { key: "B", binding: { slot, ordinal: 1 } },
      ]),
    ).toEqual([]);
  });
});
