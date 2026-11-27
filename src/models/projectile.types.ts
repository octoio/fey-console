import { Metadata, Vector3 } from "./common.types";
import { HitEffect, StatusEffect } from "./effect.types";
import { ProjectileVfx } from "./vfx.types";

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

/** What every kind has; the kinds that fly (all but the beam) add a `lifetime`. */
export interface ProjectileBase {
  metadata: Metadata;
  type: ProjectileType;
  model: ProjectileModel;
  spawn_offset: Vector3;
  max_hit_count: number;
  on_impact: (ProjectileImpactHit | ProjectileImpactStatus)[];
  on_end: (ProjectileImpactHit | ProjectileImpactStatus)[];
  /** body rides the projectile, trail streams behind it, impact plays where it lands; presentation only. */
  vfx?: ProjectileVfx;
}

export interface Projectile extends ProjectileBase {
  lifetime: number;
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

/** The line of a channelled skill: the skill's `channel` pulses, steers, pays for and ends it, so it has no lifetime. */
export interface ProjectileBeam extends ProjectileBase {
  type: "Beam";
  range: number;
  width: number;
}

export type ProjectileEntity =
  | ProjectileHoming
  | ProjectileStraight
  | ProjectileArc
  | ProjectileBeam;

const baseProjectile = (): Omit<ProjectileBase, "type"> => ({
  metadata: { title: "", description: "" },
  model: { type: "Fireball" },
  spawn_offset: { x: 0, y: 0, z: 0 },
  max_hit_count: 1,
  on_impact: [],
  on_end: [],
});

/** A valid starting point for each projectile kind (the validators of fey-data hold). */
export function createDefaultProjectile(
  type: ProjectileType,
): ProjectileEntity {
  const base = baseProjectile();
  switch (type) {
    case "Homing":
      return { ...base, type, lifetime: 5, speed: 10, rotation_speed: 180 };
    case "Straight":
      return {
        ...base,
        type,
        lifetime: 5,
        speed: 20,
        max_range: 15,
        radius: 0.3,
      };
    case "Arc":
      return {
        ...base,
        type,
        lifetime: 5,
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
      };
  }
}
