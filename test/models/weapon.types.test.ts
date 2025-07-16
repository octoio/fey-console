import { describe, it, expect } from "vitest";
import {
  WeaponCategory,
  WeaponEquipIndex,
  WeaponSheatheLocation,
  ALL_WEAPON_CATEGORIES,
  ALL_WEAPON_EQUIP_INDICES,
  ALL_WEAPON_SHEATHE_LOCATIONS,
} from "@models/weapon.types";

describe("Weapon Types", () => {
  describe("WeaponCategory", () => {
    it("should contain all expected weapon categories", () => {
      const expectedCategories = [
        "None",
        "OneHandMace",
        "TwoHandMace",
        "OneHandAxe",
        "TwoHandAxe",
        "OneHandSword",
        "TwoHandSword",
        "Dagger",
        "Fist",
        "Bow",
        "Staff",
        "Wand",
        "Shield",
      ];

      expectedCategories.forEach((category) => {
        expect(Object.values(WeaponCategory)).toContain(category);
      });
    });

    it("should have specific weapon categories available", () => {
      expect(WeaponCategory.None).toBe("None");
      expect(WeaponCategory.OneHandSword).toBe("OneHandSword");
      expect(WeaponCategory.TwoHandSword).toBe("TwoHandSword");
      expect(WeaponCategory.Bow).toBe("Bow");
      expect(WeaponCategory.Shield).toBe("Shield");
    });

    it("should export sorted array of all categories", () => {
      expect(ALL_WEAPON_CATEGORIES).toBeDefined();
      expect(Array.isArray(ALL_WEAPON_CATEGORIES)).toBe(true);
      expect(ALL_WEAPON_CATEGORIES.length).toBeGreaterThan(0);

      // Check if sorted
      const sorted = [...ALL_WEAPON_CATEGORIES].sort();
      expect(ALL_WEAPON_CATEGORIES).toEqual(sorted);
    });
  });

  describe("WeaponEquipIndex", () => {
    it("should contain all expected equip indices", () => {
      const expectedIndices = ["MainHand", "OffHand", "TwoHand"];

      expectedIndices.forEach((index) => {
        expect(Object.values(WeaponEquipIndex)).toContain(index);
      });
    });

    it("should have specific equip indices available", () => {
      expect(WeaponEquipIndex.MainHand).toBe("MainHand");
      expect(WeaponEquipIndex.OffHand).toBe("OffHand");
      expect(WeaponEquipIndex.TwoHand).toBe("TwoHand");
    });

    it("should export sorted array of all equip indices", () => {
      expect(ALL_WEAPON_EQUIP_INDICES).toBeDefined();
      expect(Array.isArray(ALL_WEAPON_EQUIP_INDICES)).toBe(true);
      expect(ALL_WEAPON_EQUIP_INDICES.length).toBe(3);

      // Check if sorted
      const sorted = [...ALL_WEAPON_EQUIP_INDICES].sort();
      expect(ALL_WEAPON_EQUIP_INDICES).toEqual(sorted);
    });
  });

  describe("WeaponSheatheLocation", () => {
    it("should contain all expected sheathe locations", () => {
      const expectedLocations = ["Hips", "Back"];

      expectedLocations.forEach((location) => {
        expect(Object.values(WeaponSheatheLocation)).toContain(location);
      });
    });

    it("should have specific sheathe locations available", () => {
      expect(WeaponSheatheLocation.Hips).toBe("Hips");
      expect(WeaponSheatheLocation.Back).toBe("Back");
    });

    it("should export sorted array of all sheathe locations", () => {
      expect(ALL_WEAPON_SHEATHE_LOCATIONS).toBeDefined();
      expect(Array.isArray(ALL_WEAPON_SHEATHE_LOCATIONS)).toBe(true);
      expect(ALL_WEAPON_SHEATHE_LOCATIONS.length).toBe(2);

      // Check if sorted
      const sorted = [...ALL_WEAPON_SHEATHE_LOCATIONS].sort();
      expect(ALL_WEAPON_SHEATHE_LOCATIONS).toEqual(sorted);
    });
  });

  describe("Enum Consistency", () => {
    it("should have consistent enum values and keys", () => {
      Object.entries(WeaponCategory).forEach(([key, value]) => {
        expect(key).toBe(value);
      });
    });

    it("should have unique enum values", () => {
      const categories = Object.values(WeaponCategory);
      const uniqueCategories = new Set(categories);
      expect(categories.length).toBe(uniqueCategories.size);
    });

    it("should have string enum values", () => {
      Object.values(WeaponCategory).forEach((value) => {
        expect(typeof value).toBe("string");
      });
    });
  });

  describe("Type Coverage", () => {
    it("should include one-handed weapons", () => {
      const oneHandedWeapons = [
        WeaponCategory.OneHandMace,
        WeaponCategory.OneHandAxe,
        WeaponCategory.OneHandSword,
        WeaponCategory.Dagger,
        WeaponCategory.Fist,
        WeaponCategory.Wand,
        WeaponCategory.Shield,
      ];

      oneHandedWeapons.forEach((weapon) => {
        expect(ALL_WEAPON_CATEGORIES).toContain(weapon);
      });
    });

    it("should include two-handed weapons", () => {
      const twoHandedWeapons = [
        WeaponCategory.TwoHandMace,
        WeaponCategory.TwoHandAxe,
        WeaponCategory.TwoHandSword,
        WeaponCategory.Bow,
        WeaponCategory.Staff,
      ];

      twoHandedWeapons.forEach((weapon) => {
        expect(ALL_WEAPON_CATEGORIES).toContain(weapon);
      });
    });

    it("should include ranged weapons", () => {
      const rangedWeapons = [WeaponCategory.Bow, WeaponCategory.Wand];

      rangedWeapons.forEach((weapon) => {
        expect(ALL_WEAPON_CATEGORIES).toContain(weapon);
      });
    });

    it("should include magical weapons", () => {
      const magicalWeapons = [WeaponCategory.Staff, WeaponCategory.Wand];

      magicalWeapons.forEach((weapon) => {
        expect(ALL_WEAPON_CATEGORIES).toContain(weapon);
      });
    });
  });
});
