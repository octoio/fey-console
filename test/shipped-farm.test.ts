import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import {
  questNodesDepthFirst,
  type Quest,
  type QuestNode,
} from "@models/quest.types";
import {
  SHIPPED_JSON_DIR,
  hasShippedData,
  shippedTitle,
} from "@test-utils/shipped-data";

// The farm of the game data (fey-rs #408): the barn doors and the quest that protects them.
const read = (path: string) =>
  JSON.parse(readFileSync(join(SHIPPED_JSON_DIR ?? "", path), "utf8"));

describe.skipIf(!hasShippedData)(shippedTitle("the farm"), () => {
  it("has the barn doors as a structure of the Folk", () => {
    const doors = read("character/barndoors.character.json").entity;
    expect(doors.structure).toBe(true);
    expect(doors.faction).toBe("Folk");
  });

  it("protects the doors through calls, waits and assaulting waves", () => {
    const quest: Quest = read("quest/thefarmquest.quest.json").entity;
    const nodes: QuestNode[] = questNodesDepthFirst(quest.root);
    const protect = nodes.find((n) => n.type === "Protect");
    expect(protect?.type === "Protect" && protect.character.key).toBe(
      "BarnDoors",
    );
    expect(nodes.filter((n) => n.type === "Wait").length).toBeGreaterThan(0);
    const actions = nodes.flatMap((n) =>
      n.type === "Action" ? [n.action] : [],
    );
    expect(actions.filter((a) => a.type === "Call")).toHaveLength(5);
    const assaults = actions.filter(
      (a) => a.type === "Spawn" && a.spawn.assault,
    );
    expect(assaults.length).toBeGreaterThan(0);
  });
});
