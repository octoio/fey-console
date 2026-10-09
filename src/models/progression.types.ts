/** An experience curve: leaving level n costs base + sum_{k=0}^{n-2} floor(increment * growth^k). */
export type XpChart = {
  base: number;
  increment: number;
  growth: number;
};

/** What each level above 1 adds to a character; absent fields add nothing. */
export type LevelGrowth = {
  /** Level cap: XP stops accruing there. */
  max_level?: number;
  vit?: number;
  str?: number;
  int?: number;
  dex?: number;
  health?: number;
  mana?: number;
  armor?: number;
  magic_resist?: number;
};

/** A skill earns xp_per_use each time a cast completes; its level scales it. */
export type SkillExperience = {
  xp_per_use: number;
  chart: XpChart;
  max_level?: number;
  /** Damage, heal and status power per level above 1 (default 0.05). */
  power_per_level?: number;
  /** Cooldown reduction per level above 1 (default 0.01, at most 0.1). */
  cooldown_per_level?: number;
};

/** Levels above 1 that scale a skill (fey_core::progression::SKILL_SCALING_LEVELS). */
export const SKILL_SCALING_LEVELS = 10;
export const DEFAULT_POWER_PER_LEVEL = 0.05;
export const DEFAULT_COOLDOWN_PER_LEVEL = 0.01;

/** XP needed to go from `level` to `level + 1` (mirrors the Rust XpChart::required). */
export const xpRequired = (chart: XpChart, level: number): number => {
  let required = Math.max(1, chart.base);
  for (let k = 0; k < Math.max(0, level - 1); k++) {
    required += Math.max(0, Math.floor(chart.increment * chart.growth ** k));
  }
  return required;
};

/** Stats a character of `level` has gained from its growth (level counts up to max_level). */
export const levelGrowthAt = (
  growth: LevelGrowth,
  level: number,
): Record<string, number> => {
  const capped =
    growth.max_level === undefined ? level : Math.min(level, growth.max_level);
  const n = Math.max(1, capped) - 1;
  const out: Record<string, number> = {};
  for (const [stat, per] of Object.entries(growth)) {
    if (stat !== "max_level" && typeof per === "number") {
      out[stat] = Math.max(0, per) * n;
    }
  }
  return out;
};

const countedSkillLevels = (level: number): number =>
  Math.min(Math.max(1, level) - 1, SKILL_SCALING_LEVELS);

/** Factor on a skill's damage, heals and status magnitudes at `level`. */
export const skillPowerAt = (exp: SkillExperience, level: number): number =>
  1 +
  Math.max(0, exp.power_per_level ?? DEFAULT_POWER_PER_LEVEL) *
    countedSkillLevels(level);

/** Factor on a skill's cooldown at `level`. */
export const skillCooldownFactorAt = (
  exp: SkillExperience,
  level: number,
): number =>
  1 -
  Math.min(
    0.1,
    Math.max(0, exp.cooldown_per_level ?? DEFAULT_COOLDOWN_PER_LEVEL),
  ) *
    countedSkillLevels(level);

/** Factor on a kill's XP for a killer above the victim (floor 0.1). */
export const xpLevelFactor = (killer: number, victim: number): number =>
  Math.max(0.1, 1 - 0.1 * Math.max(0, killer - victim));

/** Factor on skill damage against an enemy of another level (0.7 to 1.3). */
export const damageLevelFactor = (attacker: number, target: number): number =>
  Math.min(1.3, Math.max(0.7, 1 + 0.03 * (attacker - target)));
