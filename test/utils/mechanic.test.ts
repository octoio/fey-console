import { describe, it, expect } from "vitest";
import {
  SkillEffectTargetMechanicType,
  CharacterTeam,
  SkillEffectTarget,
} from "@models/skill.types";
import {
  mapTargetMechanicChange,
  getDefaultTargetForMechanic,
  createDefaultTargeting,
} from "@utils/mechanic";

describe("mechanic", () => {
  describe("mapTargetMechanicChange", () => {
    it("should create Self mechanic", () => {
      const result = mapTargetMechanicChange(
        SkillEffectTargetMechanicType.Self,
      );
      expect(result).toEqual({
        type: SkillEffectTargetMechanicType.Self,
      });
    });

    it("should create Team mechanic", () => {
      const result = mapTargetMechanicChange(
        SkillEffectTargetMechanicType.Team,
      );
      expect(result).toEqual({
        type: SkillEffectTargetMechanicType.Team,
        team: CharacterTeam.Ally,
      });
    });

    it("should create Selected mechanic", () => {
      const result = mapTargetMechanicChange(
        SkillEffectTargetMechanicType.Selected,
      );
      expect(result).toEqual({
        type: SkillEffectTargetMechanicType.Selected,
      });
    });

    it("should create Circle mechanic", () => {
      const result = mapTargetMechanicChange(
        SkillEffectTargetMechanicType.Circle,
      );
      expect(result).toEqual({
        type: SkillEffectTargetMechanicType.Circle,
        hit_count: 1,
        radius: 5,
      });
    });

    it("should create Rectangle mechanic", () => {
      const result = mapTargetMechanicChange(
        SkillEffectTargetMechanicType.Rectangle,
      );
      expect(result).toEqual({
        type: SkillEffectTargetMechanicType.Rectangle,
        hit_count: 1,
        width: 5,
        height: 5,
      });
    });

    it("should default to Self mechanic for unknown types", () => {
      const result = mapTargetMechanicChange(
        "UnknownType" as SkillEffectTargetMechanicType,
      );
      expect(result).toEqual({
        type: SkillEffectTargetMechanicType.Self,
      });
    });

    it("should handle null/undefined input", () => {
      const result = mapTargetMechanicChange(null as any);
      expect(result).toEqual({
        type: SkillEffectTargetMechanicType.Self,
      });
    });
  });

  describe("getDefaultTargetForMechanic", () => {
    it("should return Ally for Team mechanic", () => {
      const result = getDefaultTargetForMechanic(
        SkillEffectTargetMechanicType.Team,
      );
      expect(result).toBe(SkillEffectTarget.Ally);
    });

    it("should return Enemy for Circle mechanic", () => {
      const result = getDefaultTargetForMechanic(
        SkillEffectTargetMechanicType.Circle,
      );
      expect(result).toBe(SkillEffectTarget.Enemy);
    });

    it("should return Enemy for Rectangle mechanic", () => {
      const result = getDefaultTargetForMechanic(
        SkillEffectTargetMechanicType.Rectangle,
      );
      expect(result).toBe(SkillEffectTarget.Enemy);
    });

    it("should return Any for Selected mechanic", () => {
      const result = getDefaultTargetForMechanic(
        SkillEffectTargetMechanicType.Selected,
      );
      expect(result).toBe(SkillEffectTarget.Any);
    });

    it("should return Enemy for Self mechanic", () => {
      const result = getDefaultTargetForMechanic(
        SkillEffectTargetMechanicType.Self,
      );
      expect(result).toBe(SkillEffectTarget.Enemy);
    });

    it("should return Enemy for unknown mechanic types", () => {
      const result = getDefaultTargetForMechanic(
        "UnknownType" as SkillEffectTargetMechanicType,
      );
      expect(result).toBe(SkillEffectTarget.Enemy);
    });

    it("should handle null/undefined input", () => {
      const result = getDefaultTargetForMechanic(null as any);
      expect(result).toBe(SkillEffectTarget.Enemy);
    });
  });

  describe("createDefaultTargeting", () => {
    it("should create default targeting with Self mechanic", () => {
      const result = createDefaultTargeting();
      expect(result).toEqual({
        target: SkillEffectTarget.Enemy,
        target_mechanic: {
          type: SkillEffectTargetMechanicType.Self,
        },
      });
    });

    it("should create default targeting with Team mechanic", () => {
      const result = createDefaultTargeting(SkillEffectTargetMechanicType.Team);
      expect(result).toEqual({
        target: SkillEffectTarget.Ally,
        target_mechanic: {
          type: SkillEffectTargetMechanicType.Team,
          team: CharacterTeam.Ally,
        },
      });
    });

    it("should create default targeting with Circle mechanic", () => {
      const result = createDefaultTargeting(
        SkillEffectTargetMechanicType.Circle,
      );
      expect(result).toEqual({
        target: SkillEffectTarget.Enemy,
        target_mechanic: {
          type: SkillEffectTargetMechanicType.Circle,
          hit_count: 1,
          radius: 5,
        },
      });
    });

    it("should create default targeting with Rectangle mechanic", () => {
      const result = createDefaultTargeting(
        SkillEffectTargetMechanicType.Rectangle,
      );
      expect(result).toEqual({
        target: SkillEffectTarget.Enemy,
        target_mechanic: {
          type: SkillEffectTargetMechanicType.Rectangle,
          hit_count: 1,
          width: 5,
          height: 5,
        },
      });
    });

    it("should create default targeting with Selected mechanic", () => {
      const result = createDefaultTargeting(
        SkillEffectTargetMechanicType.Selected,
      );
      expect(result).toEqual({
        target: SkillEffectTarget.Any,
        target_mechanic: {
          type: SkillEffectTargetMechanicType.Selected,
        },
      });
    });

    it("should handle all mechanic types consistently", () => {
      const mechanicTypes = [
        SkillEffectTargetMechanicType.Self,
        SkillEffectTargetMechanicType.Team,
        SkillEffectTargetMechanicType.Selected,
        SkillEffectTargetMechanicType.Circle,
        SkillEffectTargetMechanicType.Rectangle,
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
        SkillEffectTargetMechanicType.Circle,
      );

      // Validate structure
      expect(typeof result.target).toBe("string");
      expect(typeof result.target_mechanic).toBe("object");
      expect(result.target_mechanic).not.toBeNull();

      // Validate Circle-specific fields
      expect(result.target_mechanic.type).toBe(
        SkillEffectTargetMechanicType.Circle,
      );
      expect((result.target_mechanic as any).hit_count).toBe(1);
      expect((result.target_mechanic as any).radius).toBe(5);
    });

    it("should maintain type safety", () => {
      const result = createDefaultTargeting(SkillEffectTargetMechanicType.Team);

      // Should have correct types without TypeScript errors
      expect(result.target).toMatch(/^(ally|enemy|any)$/i);
      expect(result.target_mechanic.type).toBe(
        SkillEffectTargetMechanicType.Team,
      );
    });
  });
});
