import { describe, it, expect } from "vitest";
import type { StatAffix } from "@models/affix.types";
import { StatType } from "@models/stat.types";

describe("affix.types", () => {
  describe("StatAffix type", () => {
    it("should accept valid StatAffix objects", () => {
      const validAffix: StatAffix = {
        stat: StatType.Health,
        value: { min: 10, max: 20 },
      };

      expect(validAffix.stat).toBe(StatType.Health);
      expect(validAffix.value.min).toBe(10);
      expect(validAffix.value.max).toBe(20);
    });

    it("should work with different stat types", () => {
      const healthAffix: StatAffix = {
        stat: StatType.Health,
        value: { min: 100, max: 200 },
      };

      const armorAffix: StatAffix = {
        stat: StatType.Armor,
        value: { min: 50, max: 100 },
      };

      expect(healthAffix.stat).toBe(StatType.Health);
      expect(armorAffix.stat).toBe(StatType.Armor);
    });

    it("should work with zero and negative values", () => {
      const zeroAffix: StatAffix = {
        stat: StatType.CriticalChance,
        value: { min: 0, max: 0 },
      };

      const negativeAffix: StatAffix = {
        stat: StatType.MovementSpeed,
        value: { min: -10, max: -5 },
      };

      expect(zeroAffix.value.min).toBe(0);
      expect(zeroAffix.value.max).toBe(0);
      expect(negativeAffix.value.min).toBe(-10);
      expect(negativeAffix.value.max).toBe(-5);
    });

    it("should work with decimal values", () => {
      const decimalAffix: StatAffix = {
        stat: StatType.CriticalChance,
        value: { min: 0.5, max: 1.5 },
      };

      expect(decimalAffix.value.min).toBe(0.5);
      expect(decimalAffix.value.max).toBe(1.5);
    });

    it("should allow equal min and max values", () => {
      const fixedAffix: StatAffix = {
        stat: StatType.Armor,
        value: { min: 25, max: 25 },
      };

      expect(fixedAffix.value.min).toBe(fixedAffix.value.max);
    });
  });
});
