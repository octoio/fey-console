import { describe, it, expect, beforeEach } from "vitest";
import { GeneratorKind } from "@models/generator.types";
import { ObstacleShape } from "@models/stage.types";
import { usePrefabStore } from "@store/prefab.store";

const state = () => usePrefabStore.getState();

describe("prefab editor store", () => {
  beforeEach(() => state().close());

  it("creates a prefab with the Octoio identity", () => {
    state().create("CryptTest", GeneratorKind.Crypt);
    expect(state().definition).toMatchObject({
      owner: "Octoio",
      type: "RoomPrefab",
      key: "CryptTest",
      version: 1,
      id: "Octoio:RoomPrefab:CryptTest:1",
    });
    expect(state().definition?.entity.generator).toBe("Crypt");
    expect(state().dirty).toBe(true);
  });

  it("adds, moves and removes obstacles; empty list drops the field", () => {
    state().create("T");
    state().addObstacle(ObstacleShape.Box);
    expect(state().definition?.entity.obstacles).toHaveLength(1);
    expect(state().selection).toEqual({ kind: "obstacle", index: 0 });
    state().moveTo({ kind: "obstacle", index: 0 }, 3.456, -2);
    expect(state().definition?.entity.obstacles?.[0]).toMatchObject({ x: 3.46, z: -2 });
    state().removeObstacle(0);
    expect(state().definition?.entity.obstacles).toBeUndefined();
    expect(JSON.parse(JSON.stringify(state().definition?.entity))).not.toHaveProperty("obstacles");
  });

  it("adds, edits and removes slots", () => {
    state().create("T");
    state().addSlot();
    state().updateSlot(0, { slot: "Shrine" as never, x: 1, z: 2, area: 3 });
    expect(state().definition?.entity.slots[0]).toEqual({ slot: "Shrine", x: 1, z: 2, area: 3 });
    state().moveTo({ kind: "slot", index: 0 }, 4, 5);
    expect(state().definition?.entity.slots[0]).toMatchObject({ x: 4, z: 5 });
    state().removeSlot(0);
    expect(state().definition?.entity.slots).toEqual([]);
    expect(state().selection).toBeNull();
  });

  it("tracks dirty state across open and save", () => {
    state().create("T");
    state().markSaved();
    expect(state().dirty).toBe(false);
    state().updatePrefab({ door_band: 3 });
    expect(state().dirty).toBe(true);
  });
});
