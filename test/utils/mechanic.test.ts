import { describe, it, expect } from "vitest";
import {
  EffectTargetMechanicType,
  CharacterTeam,
  EffectTarget,
} from "@models/effect.types";
import {
  mapTargetMechanicChange,
  getDefaultTargetForMechanic,
  createDefaultTargeting,
} from "@utils/mechanic";

describe("mechanic", () => {
  describe("mapTargetMechanicChange", () => {
    it("should create Self mechanic", () => {
      const result = mapTargetMechanicChange(
        EffectTargetMechanicType.Self,
      );
      expect(result).toEqual({
        type: EffectTargetMechanicType.Self,
      });
    });

    it("should create Team mechanic", () => {
      const result = mapTargetMechanicChange(
        EffectTargetMechanicType.Team,
      );
      expect(result).toEqual({
        type: EffectTargetMechanicType.Team,
        team: CharacterTeam.Ally,
      });
    });

    it("should create Selected mechanic", () => {
      const result = mapTargetMechanicChange(
        EffectTargetMechanicType.Selected,
      );
      expect(result).toEqual({
        type: EffectTargetMechanicType.Selected,
      });
    });

    it("should create Circle mechanic", () => {
      const result = mapTargetMechanicChange(
        EffectTargetMechanicType.Circle,
      );
      expect(result).toEqual({
        type: EffectTargetMechanicType.Circle,
        hit_count: 1,
        radius: 5,
      });
    });

    it("should create Rectangle mechanic", () => {
      const result = mapTargetMechanicChange(
        EffectTargetMechanicType.Rectangle,
      );
      expect(result).toEqual({
        type: EffectTargetMechanicType.Rectangle,
        hit_count: 1,
        width: 5,
        height: 5,
      });
    });

    it("should default to Self mechanic for unknown types", () => {
      const result = mapTargetMechanicChange(
        "UnknownType" as EffectTargetMechanicType,
      );
      expect(result).toEqual({
        type: EffectTargetMechanicType.Self,
      });
    });

    it("should handle null/undefined input", () => {
      const result = mapTargetMechanicChange(null as any);
      expect(result).toEqual({
        type: EffectTargetMechanicType.Self,
      });
    });
  });

  describe("getDefaultTargetForMechanic", () => {
    it("should return Ally for Team mechanic", () => {
      const result = getDefaultTargetForMechanic(
        EffectTargetMechanicType.Team,
      );
      expect(result).toBe(EffectTarget.Ally);
    });

    it("should return Enemy for Circle mechanic", () => {
      const result = getDefaultTargetForMechanic(
        EffectTargetMechanicType.Circle,
      );
      expect(result).toBe(EffectTarget.Enemy);
    });

    it("should return Enemy for Rectangle mechanic", () => {
      const result = getDefaultTargetForMechanic(
        EffectTargetMechanicType.Rectangle,
      );
      expect(result).toBe(EffectTarget.Enemy);
    });

    it("should return Any for Selected mechanic", () => {
      const result = getDefaultTargetForMechanic(
        EffectTargetMechanicType.Selected,
      );
      expect(result).toBe(EffectTarget.Any);
    });

    it("should return Enemy for Self mechanic", () => {
      const result = getDefaultTargetForMechanic(
        EffectTargetMechanicType.Self,
      );
      expect(result).toBe(EffectTarget.Enemy);
    });

    it("should return Enemy for unknown mechanic types", () => {
      const result = getDefaultTargetForMechanic(
        "UnknownType" as EffectTargetMechanicType,
      );
      expect(result).toBe(EffectTarget.Enemy);
    });

    it("should handle null/undefined input", () => {
      const result = getDefaultTargetForMechanic(null as any);
      expect(result).toBe(EffectTarget.Enemy);
    });
  });

  describe("createDefaultTargeting", () => {
    it("should create default targeting with Self mechanic", () => {
      const result = createDefaultTargeting();
      expect(result).toEqual({
        target: EffectTarget.Enemy,
        target_mechanic: {
          type: EffectTargetMechanicType.Self,
        },
      });
    });

    it("should create default targeting with Team mechanic", () => {
      const result = createDefaultTargeting(EffectTargetMechanicType.Team);
      expect(result).toEqual({
        target: EffectTarget.Ally,
        target_mechanic: {
          type: EffectTargetMechanicType.Team,
          team: CharacterTeam.Ally,
        },
      });
    });

    it("should create default targeting with Circle mechanic", () => {
      const result = createDefaultTargeting(
        EffectTargetMechanicType.Circle,
      );
      expect(result).toEqual({
        target: EffectTarget.Enemy,
        target_mechanic: {
          type: EffectTargetMechanicType.Circle,
          hit_count: 1,
          radius: 5,
        },
      });
    });

    it("should create default targeting with Rectangle mechanic", () => {
      const result = createDefaultTargeting(
        EffectTargetMechanicType.Rectangle,
      );
      expect(result).toEqual({
        target: EffectTarget.Enemy,
        target_mechanic: {
          type: EffectTargetMechanicType.Rectangle,
          hit_count: 1,
          width: 5,
          height: 5,
        },
      });
    });

    it("should create default targeting with Selected mechanic", () => {
      const result = createDefaultTargeting(
        EffectTargetMechanicType.Selected,
      );
      expect(result).toEqual({
        target: EffectTarget.Any,
        target_mechanic: {
          type: EffectTargetMechanicType.Selected,
        },
      });
    });

    it("should handle all mechanic types consistently", () => {
      const mechanicTypes = [
        EffectTargetMechanicType.Self,
        EffectTargetMechanicType.Team,
        EffectTargetMechanicType.Selected,
        EffectTargetMechanicType.Circle,
        EffectTargetMechanicType.Rectangle,
      ];

      mechanicTypes.forEach((mechanicType) => {
        const result = createDefaultTargeting(mechanicType);
        expect(result).toHaveProperty("target");
        expect(result).toHaveProperty("target_mechanic");
        expect(result.target_mechanic.type).toBe(mechanicType);
      });
    });

    it("should create valid targeting configurations", () => {
      const result = createDefaultTargeting(
        EffectTargetMechanicType.Circle,
      );

      // Validate structure
      expect(typeof result.target).toBe("string");
      expect(typeof result.target_mechanic).toBe("object");
      expect(result.target_mechanic).not.toBeNull();

      // Validate Circle-specific fields
      expect(result.target_mechanic.type).toBe(
        EffectTargetMechanicType.Circle,
      );
      expect((result.target_mechanic as any).hit_count).toBe(1);
      expect((result.target_mechanic as any).radius).toBe(5);
    });

    it("should maintain type safety", () => {
      const result = createDefaultTargeting(EffectTargetMechanicType.Team);

      // Should have correct types without TypeScript errors
      expect(result.target).toMatch(/^(ally|enemy|any)$/i);
      expect(result.target_mechanic.type).toBe(
        EffectTargetMechanicType.Team,
      );
    });
  });
});
