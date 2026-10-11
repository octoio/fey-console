import { Metadata } from "./common.types";
import { AnchorSlot, GeneratorKind, PlanePoint } from "./generator.types";
import { Obstacle } from "./stage.types";

// RoomPrefab entity (room_prefab.atd): a hand-made room for the map generator.
// Obstacles and slots are in room coordinates, centre at 0, 0.
export interface PrefabSlot {
  slot: AnchorSlot;
  x: number;
  z: number;
  area?: number; // spawn area / zone radius, default 0
}

export interface RoomPrefab {
  metadata: Metadata;
  generator: GeneratorKind;
  prefab_id: string; // dotted lower case, e.g. crypt.hollow_nest
  size: PlanePoint; // interior between the wall centre lines
  door_band: number; // doors are cut within this band of the middle of a wall
  obstacles?: Obstacle[];
  slots: PrefabSlot[];
}

export type RoomPrefabEntityDefinition = {
  id: string;
  owner: string;
  type: string;
  key: string;
  version: number;
  entity: RoomPrefab;
};

export const createDefaultRoomPrefab = (
  generator: GeneratorKind = GeneratorKind.Crypt,
): RoomPrefab => ({
  metadata: { title: "", description: "" },
  generator,
  prefab_id: `${generator.toLowerCase()}.new_room`,
  size: { x: 20, z: 20 },
  door_band: 2,
  slots: [],
});
