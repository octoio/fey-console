import { Metadata, Vector3 } from "./common.types";
import { HitEffect, StatusEffect } from "./effect.types";

export type ProjectileType = "Homing" | "Straight" | "Arc" | "Beam";

export const ALL_PROJECTILE_TYPES: ProjectileType[] = [
  "Homing",
  "Straight",
  "Arc",
  "Beam",
];

export type ProjectileModelType = "Pebble" | "Fireball";

export interface ProjectileModel {
  // Using Unity prefabs for now; will switch to Sandbox .glb models in the future
  type: ProjectileModelType;
  model_scale: Vector3;
}

export type ProjectileImpactType = "Hit" | "Status";

export interface ProjectileImpact {
  type: ProjectileImpactType;
}

export interface ProjectileImpactHit extends ProjectileImpact {
  type: "Hit";
  hit_effect: HitEffect;
}

export interface ProjectileImpactStatus extends ProjectileImpact {
  type: "Status";
  status_effect: StatusEffect;
}

export interface Projectile {
  metadata: Metadata;
  type: ProjectileType;
  model: ProjectileModel;
  lifetime: number;
  spawn_offset: Vector3;
  max_hit_count: number;
  on_impact: (ProjectileImpactHit | ProjectileImpactStatus)[];
  on_end: (ProjectileImpactHit | ProjectileImpactStatus)[];
}

export interface ProjectileHoming extends Projectile {
  type: "Homing";
  speed: number;
  rotation_speed: number;
}

/** A skillshot: flies the aimed line, hits the first `max_hit_count` bodies, ends at `max_range`. */
export interface ProjectileStraight extends Projectile {
  type: "Straight";
  speed: number;
  max_range: number;
  radius: number;
}

/** A lob: lands on the aimed ground point after `flight_time`, hitting everyone within `radius`. */
export interface ProjectileArc extends Projectile {
  type: "Arc";
  flight_time: number;
  max_range: number;
  radius: number;
  arc_height: number;
}

/** A channelled line: pulses every `tick_interval` while the caster holds still. */
export interface ProjectileBeam extends Projectile {
  type: "Beam";
  range: number;
  width: number;
  tick_interval: number;
  rotation_speed: number;
}

export type ProjectileEntity =
  | ProjectileHoming
  | ProjectileStraight
  | ProjectileArc
  | ProjectileBeam;

const baseProjectile = (): Omit<Projectile, "type"> => ({
  metadata: { title: "", description: "" },
  model: { type: "Fireball", model_scale: { x: 1, y: 1, z: 1 } },
  lifetime: 5,
  spawn_offset: { x: 0, y: 0, z: 0 },
  max_hit_count: 1,
  on_impact: [],
  on_end: [],
});

/** A valid starting point for each projectile kind (the validators of fey-data hold). */
export function createDefaultProjectile(type: ProjectileType): ProjectileEntity {
  const base = baseProjectile();
  switch (type) {
    case "Homing":
      return { ...base, type, speed: 10, rotation_speed: 180 };
    case "Straight":
      return { ...base, type, speed: 20, max_range: 15, radius: 0.3 };
    case "Arc":
      return {
        ...base,
        type,
        flight_time: 1,
        max_range: 12,
        radius: 2,
        arc_height: 3,
      };
    case "Beam":
      return {
        ...base,
        type,
        range: 10,
        width: 0.8,
        tick_interval: 0.5,
        rotation_speed: 90,
      };
  }
}
