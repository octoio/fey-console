import { describe, expect, it } from "vitest";
import { HitType } from "@/models/common.types";
import { ALL_SKILL_TARGET_TYPES, SkillTargetType } from "@/models/skill.types";

describe("the Resurrection schema additions", () => {
  it("Revive is a hit type that serializes as its ATD tag", () => {
    expect(HitType.Revive).toBe("Revive");
    expect(Object.values(HitType)).toContain("Revive");
  });

  it("DeadAlly is a skill target type offered by the editor", () => {
    expect(SkillTargetType.DeadAlly).toBe("DeadAlly");
    expect(ALL_SKILL_TARGET_TYPES).toContain(SkillTargetType.DeadAlly);
  });
});
