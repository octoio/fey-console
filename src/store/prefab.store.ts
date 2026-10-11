import { create } from "zustand";
import { EntityType } from "@models/common.types";
import { GeneratorKind } from "@models/generator.types";
import { AnchorSlot } from "@models/generator.types";
import {
  createDefaultRoomPrefab,
  PrefabSlot,
  RoomPrefab,
  RoomPrefabEntityDefinition,
} from "@models/roomprefab.types";
import {
  createDefaultObstacle,
  Obstacle,
  ObstacleShape,
} from "@models/stage.types";

export type PrefabSelection =
  | { kind: "obstacle"; index: number }
  | { kind: "slot"; index: number }
  | null;

interface PrefabEditorState {
  definition: RoomPrefabEntityDefinition | null;
  selection: PrefabSelection;
  dirty: boolean;
  open: (definition: RoomPrefabEntityDefinition) => void;
  create: (key: string, generator?: GeneratorKind) => void;
  close: () => void;
  updatePrefab: (patch: Partial<RoomPrefab>) => void;
  select: (selection: PrefabSelection) => void;
  addObstacle: (shape?: ObstacleShape) => void;
  updateObstacle: (index: number, obstacle: Obstacle) => void;
  removeObstacle: (index: number) => void;
  addSlot: (slot?: AnchorSlot) => void;
  updateSlot: (index: number, slot: PrefabSlot) => void;
  removeSlot: (index: number) => void;
  // Move the selected or given item to a room position (canvas drag)
  moveTo: (selection: NonNullable<PrefabSelection>, x: number, z: number) => void;
  markSaved: () => void;
}

const round = (v: number) => Math.round(v * 100) / 100;

export const usePrefabStore = create<PrefabEditorState>((set, get) => {
  const edit = (fn: (p: RoomPrefab) => RoomPrefab) => {
    const def = get().definition;
    if (!def) return;
    set({ definition: { ...def, entity: fn(def.entity) }, dirty: true });
  };
  return {
    definition: null,
    selection: null,
    dirty: false,
    open: (definition) => set({ definition, selection: null, dirty: false }),
    create: (key, generator = GeneratorKind.Crypt) =>
      set({
        definition: {
          owner: "Octoio",
          type: EntityType.RoomPrefab,
          key,
          version: 1,
          id: `Octoio:${EntityType.RoomPrefab}:${key}:1`,
          entity: createDefaultRoomPrefab(generator),
        },
        selection: null,
        dirty: true,
      }),
    close: () => set({ definition: null, selection: null, dirty: false }),
    updatePrefab: (patch) => edit((p) => ({ ...p, ...patch })),
    select: (selection) => set({ selection }),
    addObstacle: (shape = ObstacleShape.Circle) => {
      const index = get().definition?.entity.obstacles?.length ?? 0;
      edit((p) => ({
        ...p,
        obstacles: [...(p.obstacles ?? []), createDefaultObstacle(shape)],
      }));
      set({ selection: { kind: "obstacle", index } });
    },
    updateObstacle: (index, obstacle) =>
      edit((p) => ({
        ...p,
        obstacles: (p.obstacles ?? []).map((o, i) => (i === index ? obstacle : o)),
      })),
    removeObstacle: (index) => {
      edit((p) => {
        const next = (p.obstacles ?? []).filter((_, i) => i !== index);
        // An empty list is saved as no field at all (the ATD field is optional)
        return { ...p, obstacles: next.length > 0 ? next : undefined };
      });
      set({ selection: null });
    },
    addSlot: (slot = AnchorSlot.PackSpawn) => {
      const index = get().definition?.entity.slots.length ?? 0;
      edit((p) => ({ ...p, slots: [...p.slots, { slot, x: 0, z: 0 }] }));
      set({ selection: { kind: "slot", index } });
    },
    updateSlot: (index, slot) =>
      edit((p) => ({
        ...p,
        slots: p.slots.map((s, i) => (i === index ? slot : s)),
      })),
    removeSlot: (index) => {
      edit((p) => ({ ...p, slots: p.slots.filter((_, i) => i !== index) }));
      set({ selection: null });
    },
    moveTo: (selection, x, z) => {
      const def = get().definition;
      if (!def) return;
      const nx = round(x);
      const nz = round(z);
      if (selection.kind === "obstacle") {
        const o = def.entity.obstacles?.[selection.index];
        if (o) get().updateObstacle(selection.index, { ...o, x: nx, z: nz });
      } else {
        const s = def.entity.slots[selection.index];
        if (s) get().updateSlot(selection.index, { ...s, x: nx, z: nz });
      }
    },
    markSaved: () => set({ dirty: false }),
  };
});
