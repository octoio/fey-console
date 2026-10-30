import { describe, expect, it } from "vitest";
import { EntityType, type EntityReference } from "@/models/common.types";
import type {
  QuestCondition,
  QuestTimerTimeoutType,
} from "@/models/quest.types";
import {
  Weapon,
  WeaponCategory,
  WeaponSheatheLocation,
} from "@/models/weapon.types";

const ref = (type: EntityType, key: string): EntityReference => ({
  owner: "Octoio",
  type,
  key,
  version: 1,
  id: `Octoio:${type}:${key}:1`,
});

describe("quest conditions of the content update", () => {
  it("Channel with seconds 0 names its zone anchors", () => {
    const c: QuestCondition = {
      type: "Channel",
      anchors: [ref(EntityType.Anchor, "TheClearingShrine")],
      amount: 1,
      seconds: 0,
      spawns: [],
      raises_stone: false,
    };
    expect(c.type).toBe("Channel");
    expect(JSON.parse(JSON.stringify(c)).anchors[0].key).toBe(
      "TheClearingShrine",
    );
  });

  it("Teleport and PickQuest take an optional entity filter", () => {
    const any: QuestCondition[] = [{ type: "Teleport" }, { type: "PickQuest" }];
    const filtered: QuestCondition[] = [
      { type: "Teleport", stage: ref(EntityType.Stage, "TheForest") },
      { type: "PickQuest", quest: ref(EntityType.Quest, "TheForestQuest") },
    ];
    expect(any).toHaveLength(2);
    expect(filtered.map((c) => c.type)).toEqual(["Teleport", "PickQuest"]);
  });

  it("a timer can restart on timeout", () => {
    const kinds: QuestTimerTimeoutType[] = ["Fail", "Complete", "Restart"];
    expect(kinds).toContain("Restart");
  });
});

describe("weapon level requirement", () => {
  it("min_level is optional", () => {
    const w: Pick<Weapon, "category" | "sheathe_location" | "min_level"> = {
      category: WeaponCategory.Wand,
      sheathe_location: WeaponSheatheLocation.Hips,
      min_level: 4,
    };
    expect(w.min_level).toBe(4);
  });
});
