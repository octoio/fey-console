import { describe, expect, it } from "vitest";
import {
  AchievementConditionType,
  AchievementOp,
  AchievementScope,
  UnlockKind,
  type Achievement,
} from "@models/achievement.types";
import { AnchorType, createDefaultAnchor } from "@models/anchor.types";
import { AnimationCue } from "@models/animation.types";
import { CharacterType, type Character } from "@models/character.types";
import { EntityType, type EntityReference } from "@models/common.types";
import {
  EffectTarget,
  EffectTargetMechanicType,
  type EffectTargetMechanicCone,
  type HitEffect,
} from "@models/effect.types";
import { GENERATOR_VERSION } from "@models/generator.types";
import type { Quest, QuestAction } from "@models/quest.types";
import {
  SkillActionNodeType,
  type Skill,
  type SkillActionInterruptNode,
} from "@models/skill.types";
import {
  GateOpening,
  type Stage,
} from "@models/stage.types";
import {
  StatusEffectMechanicType,
  StatusStackScalingStrategy,
  type Status,
} from "@models/status.types";
import { VfxElement } from "@models/vfx.types";

const ref = (type: EntityType, key: string): EntityReference => ({
  owner: "Octoio",
  type,
  key,
  version: 1,
  id: `Octoio:${type}:${key}:1`,
});

describe("entity types", () => {
  it("lists Achievement", () => {
    expect(Object.values(EntityType)).toContain("Achievement");
  });

  it("types an achievement with a nested condition and a reward", () => {
    const achievement: Achievement = {
      metadata: { title: "Hunter", description: "Kill things." },
      hidden: false,
      condition: {
        type: AchievementConditionType.All,
        children: [
          {
            type: AchievementConditionType.Stat,
            key: "kills",
            subject: ref(EntityType.Character, "Slime"),
            op: AchievementOp.Ge,
            value: 10,
            scope: AchievementScope.Lifetime,
          },
        ],
      },
      rewards: [
        {
          kind: UnlockKind.Tier,
          target: ref(EntityType.QuestDifficulty, "Hard"),
        },
      ],
    };
    expect(JSON.parse(JSON.stringify(achievement))).toEqual(achievement);
  });
});

describe("quest additions", () => {
  it("carries ends_run and the new actions", () => {
    const actions: QuestAction[] = [
      {
        type: "StartEscalation",
        nest: ref(EntityType.Character, "Nest"),
        spawn: ref(EntityType.Character, "Spider"),
        interval: 10,
        cap: 3,
        rewards: false,
      },
      {
        type: "SpawnAtRemains",
        character: ref(EntityType.Character, "Spider"),
        remains_of: ref(EntityType.Character, "Mother"),
        target_adventurer_on_spawn: true,
      },
      { type: "OpenGate", gate: "north" },
    ];
    const endsRun: Pick<Quest, "ends_run"> = { ends_run: true };
    expect(actions.map((a) => a.type)).toEqual([
      "StartEscalation",
      "SpawnAtRemains",
      "OpenGate",
    ]);
    expect(endsRun.ends_run).toBe(true);
  });
});

describe("skill and effect additions", () => {
  it("has an Interrupt node and the walk_while_casting flag", () => {
    const node: SkillActionInterruptNode = {
      type: SkillActionNodeType.Interrupt,
      name: "Silence",
      target_mechanic: { type: EffectTargetMechanicType.Selected },
      target: EffectTarget.Enemy,
    };
    const flags: Pick<Skill, "walk_while_casting" | "needs_status" | "vfx"> = {
      walk_while_casting: true,
      needs_status: ref(EntityType.Status, "Dive"),
      vfx: { element: VfxElement.Fire, cast: "fire/gather" },
    };
    expect(node.type).toBe("Interrupt");
    expect(flags.walk_while_casting).toBe(true);
  });

  it("has the Cone mechanic and the hit modifiers", () => {
    const cone: EffectTargetMechanicCone = {
      type: EffectTargetMechanicType.Cone,
      hit_count: 5,
      radius: 6,
      angle: 90,
      behind: true,
    };
    const hit: Pick<
      HitEffect,
      "execute" | "knockback" | "pull" | "mana_on_hit"
    > = {
      execute: { below: 0.3, factor: 2 },
      knockback: 3,
      pull: 4,
      mana_on_hit: 5,
    };
    expect(cone.type).toBe("Cone");
    expect(hit.execute?.factor).toBe(2);
  });
});

describe("character and status additions", () => {
  it("has a nest, swims, lurks, death_sound and the Beast type", () => {
    const character: Pick<
      Character,
      "type" | "nest" | "swims" | "lurks" | "death_sound"
    > = {
      type: CharacterType.Beast,
      nest: {
        burst_at: 0.5,
        burst: ref(EntityType.Character, "Spider"),
        burst_count: 4,
      },
      swims: true,
      lurks: true,
      death_sound: ref(EntityType.Sound, "Splat"),
    };
    expect(character.nest?.burst_count).toBe(4);
  });

  it("has stack accumulation, decay, break_burst and the Submerge mechanic", () => {
    const status: Pick<Status, "break_burst" | "stack" | "mechanic"> = {
      break_burst: 0.2,
      stack: {
        size: 1,
        scaling_strategy: StatusStackScalingStrategy.Additive,
        accumulate: true,
        magnitudes: [0.2, 0.1],
        decay: true,
      },
      mechanic: { type: StatusEffectMechanicType.Submerge },
    };
    expect(status.stack.magnitudes).toEqual([0.2, 0.1]);
  });
});

describe("stage, anchor and animation additions", () => {
  it("has ground zones, gates and the Lever anchor", () => {
    const stage: Pick<Stage, "ground" | "gates"> = {
      ground: [
        {
          kind: "Water" as never,
          shape: "Circle" as never,
          x: 0,
          z: 0,
          radius: 4,
        },
      ],
      gates: [
        {
          id: "north",
          obstacle: {
            kind: "Wall" as never,
            shape: "Box" as never,
            x: 0,
            z: 0,
          },
          opening: GateOpening.Interact,
          lever: ref(EntityType.Anchor, "NorthLever"),
        },
      ],
    };
    expect(stage.gates?.[0].id).toBe("north");
    expect(createDefaultAnchor(AnchorType.Lever)).toMatchObject({
      type: "Lever",
      model: "",
    });
  });

  it("knows the cues of the idle, walk, run, hit, death and shoot slots", () => {
    for (const cue of ["AttackShoot", "Idle", "Walk", "Run", "Hit", "Death"])
      expect(Object.values(AnimationCue)).toContain(cue);
  });

  it("tracks the generator version of the data", () => {
    expect(GENERATOR_VERSION).toBe(13);
  });
});
