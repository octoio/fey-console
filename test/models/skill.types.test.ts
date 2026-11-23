import { describe, expect, it } from "vitest";
import {
  ALL_SKILL_ACTION_NODE_TYPES,
  ALL_SKILL_CATEGORIES,
  ALL_SKILL_MOVE_MODES,
  SkillActionNodeType,
  SkillCategory,
  type Skill,
  SkillMoveMode,
} from "@models/skill.types";

describe("skill.types movement skills", () => {
  it("has the Mobility category and the Move node type", () => {
    expect(SkillCategory.Mobility).toBe("Mobility");
    expect(ALL_SKILL_CATEGORIES).toContain(SkillCategory.Mobility);
    expect(SkillActionNodeType.Move).toBe("Move");
    expect(ALL_SKILL_ACTION_NODE_TYPES).toContain(SkillActionNodeType.Move);
  });

  it("lists the four move modes as the ATD names them", () => {
    expect(ALL_SKILL_MOVE_MODES).toEqual(
      [
        SkillMoveMode.Blink,
        SkillMoveMode.Dash,
        SkillMoveMode.ShadowStep,
        SkillMoveMode.Swap,
      ].sort(),
    );
    expect(SkillMoveMode.ShadowStep).toBe("ShadowStep");
  });
});

describe("skill.types channelled skills", () => {
  it("holds the three numbers of a channel as the ATD names them", () => {
    const channel: NonNullable<Skill["channel"]> = {
      pulse_interval: 0.5,
      pulse_cost: 1,
      turn_rate: 120,
    };
    const skill: Pick<Skill, "channel" | "target_type"> = {
      target_type: "None" as Skill["target_type"],
      channel,
    };
    expect(JSON.parse(JSON.stringify(skill)).channel).toEqual(channel);
  });
});
