import { describe, expect, it } from "vitest";
import {
  ALL_PROJECTILE_TYPES,
  createDefaultProjectile,
} from "@models/projectile.types";

describe("createDefaultProjectile", () => {
  it.each(ALL_PROJECTILE_TYPES)("creates a %s projectile", (type) => {
    const projectile = createDefaultProjectile(type);
    expect(projectile.type).toBe(type);
    expect(projectile.lifetime).toBeGreaterThan(0);
    expect(projectile.max_hit_count).toBeGreaterThanOrEqual(1);
  });

  it("gives the skillshot a range that fits its lifetime", () => {
    const shot = createDefaultProjectile("Straight");
    if (shot.type !== "Straight") throw new Error("kind");
    expect(shot.max_range / shot.speed).toBeLessThanOrEqual(shot.lifetime);
  });

  it("gives the lob a flight shorter than its lifetime", () => {
    const lob = createDefaultProjectile("Arc");
    if (lob.type !== "Arc") throw new Error("kind");
    expect(lob.flight_time).toBeLessThanOrEqual(lob.lifetime);
  });

  it("gives the beam a pulse within its lifetime", () => {
    const beam = createDefaultProjectile("Beam");
    if (beam.type !== "Beam") throw new Error("kind");
    expect(beam.tick_interval).toBeLessThanOrEqual(beam.lifetime);
  });

  it("creates independent instances", () => {
    const a = createDefaultProjectile("Arc");
    const b = createDefaultProjectile("Arc");
    a.spawn_offset.x = 4;
    expect(b.spawn_offset.x).toBe(0);
  });
});
