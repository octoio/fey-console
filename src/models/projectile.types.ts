import { EntityReference, Metadata, Vector3 } from "./common.types";
import { HitEffect, StatusEffect } from "./effect.types";

export type ProjectileType = "Homing";

export interface ProjectileModel {
  reference: EntityReference;
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

export type ProjectileEntity = ProjectileHoming;
