import { describe, expect, it } from "vitest";
import {
  ALL_ANCHOR_TYPES,
  AnchorType,
  createDefaultAnchor,
  ZoneDetectionType,
} from "@models/anchor.types";

describe("createDefaultAnchor", () => {
  it("creates a zone anchor with zone-specific defaults", () => {
    const anchor = createDefaultAnchor(AnchorType.Zone);
    expect(anchor.type).toBe(AnchorType.Zone);
    if (anchor.type !== AnchorType.Zone) return;
    expect(anchor.detection).toBe(ZoneDetectionType.Trigger);
    expect(anchor.radius).toBeGreaterThanOrEqual(0.1);
    expect(anchor.show_vfx).toBe(false);
    expect(anchor.color).toEqual({ r: 1, g: 1, b: 1, a: 1 });
  });

  it.each(ALL_ANCHOR_TYPES)(
    "creates a %s anchor with identity transform",
    (type) => {
      const anchor = createDefaultAnchor(type);
      expect(anchor.type).toBe(type);
      expect(anchor.transform.position).toEqual({ x: 0, y: 0, z: 0 });
      expect(anchor.transform.rotation).toEqual({ x: 0, y: 0, z: 0 });
      expect(anchor.transform.scale).toEqual({ x: 1, y: 1, z: 1 });
      expect(anchor.metadata).toEqual({ title: "", description: "" });
    },
  );

  it("creates independent instances", () => {
    const first = createDefaultAnchor(AnchorType.SpawnPoint);
    const second = createDefaultAnchor(AnchorType.SpawnPoint);
    first.transform.position.x = 5;
    expect(second.transform.position.x).toBe(0);
  });
});
