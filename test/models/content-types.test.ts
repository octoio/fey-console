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
  it("Interact names a zone anchor", () => {
    const c: QuestCondition = {
      type: "Interact",
      anchor: ref(EntityType.Anchor, "TheClearingShrine"),
    };
    expect(c.type).toBe("Interact");
    expect(JSON.parse(JSON.stringify(c)).anchor.key).toBe("TheClearingShrine");
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
