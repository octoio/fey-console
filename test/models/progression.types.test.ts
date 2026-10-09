import { describe, expect, it } from "vitest";
import {
  damageLevelFactor,
  levelGrowthAt,
  skillCooldownFactorAt,
  skillPowerAt,
  xpLevelFactor,
  xpRequired,
} from "@models/progression.types";
import type { Character } from "@models/character.types";
import type { Skill } from "@models/skill.types";

const adventurerChart = { base: 250, increment: 125, growth: 1.3 };
const adventurerGrowth = {
  max_level: 10,
  vit: 0.15,
  str: 0.15,
  int: 0.2,
  dex: 0.2,
  health: 2,
  mana: 2,
};

describe("progression.types", () => {
  it("computes the XP curve like the Rust chart", () => {
    expect([1, 2, 3, 4, 5].map((l) => xpRequired(adventurerChart, l))).toEqual([
      250, 375, 537, 748, 1022,
    ]);
    expect(
      [1, 2, 3, 4].map((l) =>
        xpRequired({ base: 100, increment: 50, growth: 1.25 }, l),
      ),
    ).toEqual([100, 150, 212, 290]);
  });

  it("grows stats per level and stops at the cap", () => {
    expect(levelGrowthAt(adventurerGrowth, 1)).toMatchObject({ health: 0 });
    const l5 = levelGrowthAt(adventurerGrowth, 5);
    expect(l5.health).toBe(8);
    expect(l5.vit).toBeCloseTo(0.6);
    expect(l5).not.toHaveProperty("max_level");
    expect(levelGrowthAt(adventurerGrowth, 99)).toEqual(
      levelGrowthAt(adventurerGrowth, 10),
    );
  });

  it("scales a skill by its level up to ten levels above one", () => {
    const exp = { xp_per_use: 10, chart: adventurerChart };
    expect(skillPowerAt(exp, 1)).toBe(1);
    expect(skillPowerAt(exp, 3)).toBeCloseTo(1.1);
    expect(skillPowerAt(exp, 50)).toBeCloseTo(1.5);
    expect(skillCooldownFactorAt(exp, 11)).toBeCloseTo(0.9);
    const custom = { ...exp, power_per_level: 0.1, cooldown_per_level: 0.5 };
    expect(skillPowerAt(custom, 2)).toBeCloseTo(1.1);
    expect(skillCooldownFactorAt(custom, 2)).toBeCloseTo(0.9); // capped at 0.1 per level
  });

  it("applies the level-difference rules", () => {
    expect(xpLevelFactor(1, 5)).toBe(1);
    expect(xpLevelFactor(5, 1)).toBeCloseTo(0.6);
    expect(xpLevelFactor(40, 1)).toBeCloseTo(0.1);
    expect(damageLevelFactor(1, 5)).toBeCloseTo(0.88);
    expect(damageLevelFactor(5, 1)).toBeCloseTo(1.12);
    expect(damageLevelFactor(100, 1)).toBeCloseTo(1.3);
    expect(damageLevelFactor(1, 100)).toBeCloseTo(0.7);
  });

  it("types the new character and skill fields", () => {
    const partial: Pick<Character, "xp_chart" | "level_growth"> = {
      xp_chart: adventurerChart,
      level_growth: adventurerGrowth,
    };
    const skill: Pick<Skill, "experience"> = {
      experience: {
        xp_per_use: 1,
        chart: adventurerChart,
        power_per_level: 0.05,
      },
    };
    expect(partial.level_growth?.max_level).toBe(10);
    expect(skill.experience?.xp_per_use).toBe(1);
  });
});
