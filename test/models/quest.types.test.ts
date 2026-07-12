import { describe, expect, it } from "vitest";
import {
  collectDuplicateQuestNodeIds,
  nextQuestNodeId,
  QuestNode,
  questNodeChildren,
  questNodesDepthFirst,
} from "@models/quest.types";

const objective = (id: number, name = `objective-${id}`): QuestNode => ({
  type: "Objective",
  id,
  name,
  metadata: { title: name, description: "" },
  is_optional: false,
  condition: { type: "Teleport" },
});

const action = (id: number): QuestNode => ({
  type: "Action",
  id,
  name: `action-${id}`,
  action: { type: "Message", message: "hello" },
});

const sampleTree = (): QuestNode => ({
  type: "Sequence",
  id: 0,
  name: "root",
  children: [
    objective(1),
    {
      type: "Any",
      id: 2,
      name: "race",
      children: [
        objective(3),
        {
          type: "Timer",
          id: 4,
          name: "clock",
          duration: 30,
          on_timeout: "Fail",
          child: objective(5),
        },
      ],
    },
    action(6),
  ],
});

describe("questNodeChildren", () => {
  it("returns children of control nodes", () => {
    const root = sampleTree();
    expect(questNodeChildren(root).map((node) => node.id)).toEqual([1, 2, 6]);
  });

  it("returns the single child of a timer node", () => {
    const timer: QuestNode = {
      type: "Timer",
      id: 9,
      name: "clock",
      duration: 5,
      on_timeout: "Complete",
      child: objective(10),
    };
    expect(questNodeChildren(timer).map((node) => node.id)).toEqual([10]);
  });

  it("returns nothing for leaf nodes", () => {
    expect(questNodeChildren(objective(1))).toEqual([]);
    expect(questNodeChildren(action(2))).toEqual([]);
  });
});

describe("questNodesDepthFirst", () => {
  it("visits every node in pre-order", () => {
    expect(questNodesDepthFirst(sampleTree()).map((node) => node.id)).toEqual([
      0, 1, 2, 3, 4, 5, 6,
    ]);
  });

  it("yields only the leaf for a leaf root", () => {
    const leaf = objective(7);
    expect(questNodesDepthFirst(leaf)).toEqual([leaf]);
  });
});

describe("collectDuplicateQuestNodeIds", () => {
  it("finds no duplicates in a valid tree", () => {
    expect(collectDuplicateQuestNodeIds(sampleTree())).toEqual([]);
  });

  it("reports duplicated ids once", () => {
    const tree: QuestNode = {
      type: "Parallel",
      id: 1,
      name: "root",
      children: [objective(1), objective(1), objective(2)],
    };
    expect(collectDuplicateQuestNodeIds(tree)).toEqual([1]);
  });
});

describe("nextQuestNodeId", () => {
  it("returns the smallest unused id", () => {
    expect(nextQuestNodeId(sampleTree())).toBe(7);
  });

  it("fills gaps in the id sequence", () => {
    const tree: QuestNode = {
      type: "Sequence",
      id: 0,
      name: "root",
      children: [objective(2)],
    };
    expect(nextQuestNodeId(tree)).toBe(1);
  });
});
