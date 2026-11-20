import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { QuestAction, QuestActionStartDrains } from "@models/quest.types";
import { SkillActionNodeType } from "@models/skill.types";
import { useSkillStore } from "@store/skill.store";
import { SHIPPED_JSON_DIR, hasShippedData, shippedTitle } from "@test-utils/shipped-data";

// The Rat Warrens of the game data (fey-rs #412) through the editor: its quest carries the drains
// and its skills the call, and both survive the editor's own load and save.
const read = (path: string) =>
  readFileSync(join(SHIPPED_JSON_DIR ?? "", path), "utf8");

describe.skipIf(!hasShippedData)(shippedTitle("the Rat Warrens"), () => {
  it("has a quest that starts drains with a call-only anchor", () => {
    const quest = JSON.parse(read("quest/ratwarrensquest.quest.json"));
    const actions: QuestAction[] = quest.entity.root.children
      .filter((n: { type: string }) => n.type === "Action")
      .map((n: { action: QuestAction }) => n.action);
    const drains = actions.find(
      (a): a is QuestActionStartDrains => a.type === "StartDrains",
    );
    expect(drains?.call_anchor?.key).toBe("TheWarrensCallDrain");
    expect(drains?.batch).toEqual({ min: 8, max: 12 });
  });

  it("stops its drains after the kill objective and before the message", () => {
    const quest = JSON.parse(read("quest/ratwarrensquest.quest.json"));
    const steps: string[] = quest.entity.root.children.map(
      (n: { type: string; action?: QuestAction }) => n.action?.type ?? n.type,
    );
    const kill = steps.indexOf("Objective");
    expect(steps.indexOf("StopDrains")).toBeGreaterThan(kill);
    expect(steps.indexOf("StopDrains")).toBeLessThan(steps.indexOf("Message"));
  });

  it.each(["screech", "swarm-call"])(
    "opens and saves the %s skill with its CallDrain nodes",
    (file) => {
      const text = read(`skill/${file}.skill.json`);
      useSkillStore.getState().importFromJson(text);
      const calls = useSkillStore
        .getState()
        .nodes.filter((n) => n.type === SkillActionNodeType.CallDrain);
      expect(calls.length).toBeGreaterThan(0);
      const saved = JSON.parse(useSkillStore.getState().exportToJson());
      expect(JSON.stringify(saved)).toContain("\"type\":\"CallDrain\"");
    },
  );
});
