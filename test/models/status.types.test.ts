import { describe, it, expect } from "vitest";
import {
  StatusDurationType,
  StatusEffectMechanicType,
  StatusStackScalingStrategy,
  ALL_STATUS_DURATION_TYPES,
  ALL_STATUS_EFFECT_MECHANIC_TYPES,
  ALL_STATUS_STACK_SCALING_STRATEGIES,
} from "@models/status.types";

describe("Status Types", () => {
  describe("StatusDurationType", () => {
    it("should contain all expected duration types", () => {
      const expectedTypes = ["Chrono", "Logical", "Room", "Dungeon"];

      expectedTypes.forEach((type) => {
        expect(Object.values(StatusDurationType)).toContain(type);
      });
    });

    it("should have specific duration types available", () => {
      expect(StatusDurationType.Chrono).toBe("Chrono");
      expect(StatusDurationType.Logical).toBe("Logical");
      expect(StatusDurationType.Room).toBe("Room");
      expect(StatusDurationType.Dungeon).toBe("Dungeon");
    });

    it("should export sorted array of all duration types", () => {
      expect(ALL_STATUS_DURATION_TYPES).toBeDefined();
      expect(Array.isArray(ALL_STATUS_DURATION_TYPES)).toBe(true);
      expect(ALL_STATUS_DURATION_TYPES.length).toBe(4);

      // Check if sorted
      const sorted = [...ALL_STATUS_DURATION_TYPES].sort();
      expect(ALL_STATUS_DURATION_TYPES).toEqual(sorted);
    });
  });

  describe("StatusEffectMechanicType", () => {
    it("should contain all expected mechanic types", () => {
      const expectedTypes = ["StatChange", "HitOverTime"];

      expectedTypes.forEach((type) => {
        expect(Object.values(StatusEffectMechanicType)).toContain(type);
      });
    });

    it("should have specific mechanic types available", () => {
      expect(StatusEffectMechanicType.StatChange).toBe("StatChange");
      expect(StatusEffectMechanicType.HitOverTime).toBe("HitOverTime");
    });

    it("should export sorted array of all mechanic types", () => {
      expect(ALL_STATUS_EFFECT_MECHANIC_TYPES).toBeDefined();
      expect(Array.isArray(ALL_STATUS_EFFECT_MECHANIC_TYPES)).toBe(true);
      expect(ALL_STATUS_EFFECT_MECHANIC_TYPES.length).toBe(2);

      // Check if sorted
      const sorted = [...ALL_STATUS_EFFECT_MECHANIC_TYPES].sort();
      expect(ALL_STATUS_EFFECT_MECHANIC_TYPES).toEqual(sorted);
    });
  });

  describe("StatusStackScalingStrategy", () => {
    it("should contain all expected scaling strategies", () => {
      const expectedStrategies = ["Additive", "Multiplicative"];

      expectedStrategies.forEach((strategy) => {
        expect(Object.values(StatusStackScalingStrategy)).toContain(strategy);
      });
    });

    it("should have specific scaling strategies available", () => {
      expect(StatusStackScalingStrategy.Additive).toBe("Additive");
      expect(StatusStackScalingStrategy.Multiplicative).toBe("Multiplicative");
    });

    it("should export sorted array of all scaling strategies", () => {
      expect(ALL_STATUS_STACK_SCALING_STRATEGIES).toBeDefined();
      expect(Array.isArray(ALL_STATUS_STACK_SCALING_STRATEGIES)).toBe(true);
      expect(ALL_STATUS_STACK_SCALING_STRATEGIES.length).toBe(2);

      // Check if sorted
      const sorted = [...ALL_STATUS_STACK_SCALING_STRATEGIES].sort();
      expect(ALL_STATUS_STACK_SCALING_STRATEGIES).toEqual(sorted);
    });
  });

  describe("Enum Consistency", () => {
    it("should have consistent duration type enum values and keys", () => {
      Object.entries(StatusDurationType).forEach(([key, value]) => {
        expect(key).toBe(value);
      });
    });

    it("should have consistent mechanic type enum values and keys", () => {
      Object.entries(StatusEffectMechanicType).forEach(([key, value]) => {
        expect(key).toBe(value);
      });
    });

    it("should have consistent scaling strategy enum values and keys", () => {
      Object.entries(StatusStackScalingStrategy).forEach(([key, value]) => {
        expect(key).toBe(value);
      });
    });

    it("should have string enum values", () => {
      Object.values(StatusDurationType).forEach((value) => {
        expect(typeof value).toBe("string");
      });

      Object.values(StatusEffectMechanicType).forEach((value) => {
        expect(typeof value).toBe("string");
      });

      Object.values(StatusStackScalingStrategy).forEach((value) => {
        expect(typeof value).toBe("string");
      });
    });
  });

  describe("Type Coverage", () => {
    it("should cover time-based duration types", () => {
      const timeBasedTypes = [
        StatusDurationType.Chrono,
        StatusDurationType.Logical,
      ];

      timeBasedTypes.forEach((type) => {
        expect(ALL_STATUS_DURATION_TYPES).toContain(type);
      });
    });

    it("should cover location-based duration types", () => {
      const locationBasedTypes = [
        StatusDurationType.Room,
        StatusDurationType.Dungeon,
      ];

      locationBasedTypes.forEach((type) => {
        expect(ALL_STATUS_DURATION_TYPES).toContain(type);
      });
    });

    it("should cover different effect mechanics", () => {
      const mechanics = [
        StatusEffectMechanicType.StatChange,
        StatusEffectMechanicType.HitOverTime,
      ];

      mechanics.forEach((mechanic) => {
        expect(ALL_STATUS_EFFECT_MECHANIC_TYPES).toContain(mechanic);
      });
    });

    it("should cover mathematical scaling strategies", () => {
      const strategies = [
        StatusStackScalingStrategy.Additive,
        StatusStackScalingStrategy.Multiplicative,
      ];

      strategies.forEach((strategy) => {
        expect(ALL_STATUS_STACK_SCALING_STRATEGIES).toContain(strategy);
      });
    });
  });

  describe("Logical Grouping", () => {
    it("should properly categorize duration types by scope", () => {
      // Time-based durations
      expect([StatusDurationType.Chrono, StatusDurationType.Logical]).toEqual(
        expect.arrayContaining([expect.stringMatching(/Chrono|Logical/)]),
      );

      // Space-based durations
      expect([StatusDurationType.Room, StatusDurationType.Dungeon]).toEqual(
        expect.arrayContaining([expect.stringMatching(/Room|Dungeon/)]),
      );
    });

    it("should properly categorize effect types by application", () => {
      // Immediate vs ongoing effects
      expect(StatusEffectMechanicType.StatChange).toBe("StatChange");
      expect(StatusEffectMechanicType.HitOverTime).toBe("HitOverTime");
    });

    it("should properly categorize scaling by mathematical operation", () => {
      // Mathematical operations
      expect(StatusStackScalingStrategy.Additive).toBe("Additive");
      expect(StatusStackScalingStrategy.Multiplicative).toBe("Multiplicative");
    });
  });
});
