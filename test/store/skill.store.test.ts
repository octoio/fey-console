import { describe, it, expect, beforeEach, vi } from "vitest";
import { EntityType } from "@models/common.types";
import { QualityType } from "@models/quality.types";
import { RequirementOperator } from "@models/requirement.types";
import {
  SkillActionNodeType,
  SkillTargetType,
  SkillIndicatorPosition,
  SkillActionNode,
  SkillEntityDefinition,
} from "@models/skill.types";
import { useSkillStore } from "@store/skill.store";
import { act, renderHook } from "@testing-library/react";

describe("useSkillStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useSkillStore());
    act(() => {
      result.current.setSkillData({
        id: "",
        owner: "Octoio",
        type: EntityType.Skill,
        key: "",
        version: 1,
        entity: {
          metadata: {
            title: "",
            description: "",
          },
          quality: QualityType.None,
          categories: [],
          cost: {
            mana: 0,
          },
          cooldown: 0,
          target_type: SkillTargetType.None,
          execution_root: {
            type: SkillActionNodeType.Sequence,
            name: "Root",
            loop: 1,
          } as SkillActionNode,
          icon_reference: {
            id: "Octoio:Image:DefaultIcon:1",
            type: EntityType.Image,
            owner: "Octoio",
            key: "DefaultIcon",
            version: 1,
          },
          indicators: [],
          cast_distance: {
            min: 1,
            max: 1,
          },
        },
      });
    });
  });

  describe("Initial State", () => {
    it("should have default skill data", () => {
      const { result } = renderHook(() => useSkillStore());

      expect(result.current.skillData).toBeDefined();
      expect(result.current.skillData?.entity.metadata.title).toBe("");
      expect(result.current.skillData?.entity.quality).toBe(QualityType.None);
      // The execution root gets converted from Parallel to Sequence due to our beforeEach setup
      expect(result.current.skillData?.entity.execution_root.type).toBe(
        SkillActionNodeType.Sequence,
      );
    });

    it("should have nodes and edges from skill conversion", () => {
      const { result } = renderHook(() => useSkillStore());

      // After setSkillData is called in beforeEach, nodes are automatically created
      expect(result.current.nodes.length).toBeGreaterThanOrEqual(1);
      expect(result.current.edges).toEqual([]);
    });
  });

  describe("Skill Data Management", () => {
    it("should update metadata correctly", () => {
      const { result } = renderHook(() => useSkillStore());
      const newTitle = "Test Skill";
      const newDescription = "A test skill description";

      act(() => {
        result.current.updateMetadata(newTitle, newDescription);
      });

      expect(result.current.skillData?.entity.metadata.title).toBe(newTitle);
      expect(result.current.skillData?.entity.metadata.description).toBe(
        newDescription,
      );
    });

    it("should update basic info correctly", () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.updateBasicInfo(
          QualityType.Epic,
          [],
          5,
          SkillTargetType.Enemy,
        );
      });

      expect(result.current.skillData?.entity.quality).toBe(QualityType.Epic);
      expect(result.current.skillData?.entity.cooldown).toBe(5);
      expect(result.current.skillData?.entity.target_type).toBe(
        SkillTargetType.Enemy,
      );
    });

    it("should update cost correctly", () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.updateCost(50);
      });

      expect(result.current.skillData?.entity.cost.mana).toBe(50);
    });

    it("should update cast distance correctly", () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.updateCastDistance(2, 10);
      });

      expect(result.current.skillData?.entity.cast_distance.min).toBe(2);
      expect(result.current.skillData?.entity.cast_distance.max).toBe(10);
    });
  });

  describe("Node Management", () => {
    it("should add a sequence node", () => {
      const { result } = renderHook(() => useSkillStore());
      const initialNodeCount = result.current.nodes.length;

      act(() => {
        result.current.addNode(SkillActionNodeType.Sequence, null);
      });

      expect(result.current.nodes).toHaveLength(initialNodeCount + 1);
      // Find the newly added sequence node (not the root)
      const newNode = result.current.nodes.find(
        (n) =>
          n.type === SkillActionNodeType.Sequence &&
          n.data.name === "New Sequence",
      );
      expect(newNode).toBeDefined();
      expect(newNode?.data.type).toBe(SkillActionNodeType.Sequence);
      expect(newNode?.data.name).toBe("New Sequence");
      expect(newNode?.data.children).toEqual([]);
      expect(newNode?.data.loop).toBe(1);
    });

    it("should add a parallel node", () => {
      const { result } = renderHook(() => useSkillStore());
      const initialNodeCount = result.current.nodes.length;

      act(() => {
        result.current.addNode(SkillActionNodeType.Parallel, null);
      });

      expect(result.current.nodes).toHaveLength(initialNodeCount + 1);
      const newNode = result.current.nodes.find(
        (n) =>
          n.type === SkillActionNodeType.Parallel &&
          n.data.name === "New Parallel",
      );
      expect(newNode).toBeDefined();
      expect(newNode?.data.children).toEqual([]);
      expect(newNode?.data.loop).toBe(1);
    });

    it("should add a delay node", () => {
      const { result } = renderHook(() => useSkillStore());
      const initialNodeCount = result.current.nodes.length;

      act(() => {
        result.current.addNode(SkillActionNodeType.Delay, null);
      });

      expect(result.current.nodes).toHaveLength(initialNodeCount + 1);
      const newNode = result.current.nodes.find(
        (n) =>
          n.type === SkillActionNodeType.Delay && n.data.name === "New Delay",
      );
      expect(newNode).toBeDefined();
      expect(newNode?.data.delay).toBe(1.0);
    });

    it("should add an animation node", () => {
      const { result } = renderHook(() => useSkillStore());
      const initialNodeCount = result.current.nodes.length;

      act(() => {
        result.current.addNode(SkillActionNodeType.Animation, null);
      });

      expect(result.current.nodes).toHaveLength(initialNodeCount + 1);
      const newNode = result.current.nodes.find(
        (n) =>
          n.type === SkillActionNodeType.Animation &&
          n.data.name === "New Animation",
      );
      expect(newNode).toBeDefined();
      expect(newNode?.data.duration).toBe(1.0);
      expect(newNode?.data.animations).toEqual([]);
    });

    it("should add a sound node", () => {
      const { result } = renderHook(() => useSkillStore());
      const initialNodeCount = result.current.nodes.length;

      act(() => {
        result.current.addNode(SkillActionNodeType.Sound, null);
      });

      expect(result.current.nodes).toHaveLength(initialNodeCount + 1);
      const newNode = result.current.nodes.find(
        (n) =>
          n.type === SkillActionNodeType.Sound && n.data.name === "New Sound",
      );
      expect(newNode).toBeDefined();
      expect(newNode?.data.sound).toEqual({
        id: "",
        owner: "Octoio",
        type: EntityType.Sound,
        key: "",
        version: 1,
      });
    });

    it("should add a hit effect node", () => {
      const { result } = renderHook(() => useSkillStore());
      const initialNodeCount = result.current.nodes.length;

      act(() => {
        result.current.addNode(SkillActionNodeType.Hit, null);
      });

      expect(result.current.nodes).toHaveLength(initialNodeCount + 1);
      const newNode = result.current.nodes.find(
        (n) => n.type === SkillActionNodeType.Hit && n.data.name === "New Hit",
      );
      expect(newNode).toBeDefined();
      expect(newNode?.data.hit_effect).toBeDefined();
      expect(newNode?.data.hit_effect.can_crit).toBe(true);
      expect(newNode?.data.hit_effect.can_miss).toBe(true);
    });

    it("should add a status effect node", () => {
      const { result } = renderHook(() => useSkillStore());
      const initialNodeCount = result.current.nodes.length;

      act(() => {
        result.current.addNode(SkillActionNodeType.Status, null);
      });

      expect(result.current.nodes).toHaveLength(initialNodeCount + 1);
      const newNode = result.current.nodes.find(
        (n) =>
          n.type === SkillActionNodeType.Status && n.data.name === "New Status",
      );
      expect(newNode).toBeDefined();
      expect(newNode?.data.status_effect).toBeDefined();
      expect(newNode?.data.status_effect.durations).toEqual([]);
      expect(newNode?.data.status_effect.scalers).toEqual([]);
    });

    it("should add a summon node", () => {
      const { result } = renderHook(() => useSkillStore());
      const initialNodeCount = result.current.nodes.length;

      act(() => {
        result.current.addNode(SkillActionNodeType.Summon, null);
      });

      expect(result.current.nodes).toHaveLength(initialNodeCount + 1);
      const newNode = result.current.nodes.find(
        (n) =>
          n.type === SkillActionNodeType.Summon && n.data.name === "New Summon",
      );
      expect(newNode).toBeDefined();
      expect(newNode?.data.summon_entity).toEqual({
        id: "",
        owner: "Octoio",
        type: EntityType.Character,
        key: "",
        version: 1,
      });
      expect(newNode?.data.position_offset).toEqual({ x: 0, y: 0, z: 0 });
    });

    it("should add a requirement node", () => {
      const { result } = renderHook(() => useSkillStore());
      const initialNodeCount = result.current.nodes.length;

      act(() => {
        result.current.addNode(SkillActionNodeType.Requirement, null);
      });

      expect(result.current.nodes).toHaveLength(initialNodeCount + 1);
      const newNode = result.current.nodes.find(
        (n) =>
          n.type === SkillActionNodeType.Requirement &&
          n.data.name === "New Requirement",
      );
      expect(newNode).toBeDefined();
      expect(newNode?.data.requirements).toEqual({
        operator: RequirementOperator.All,
        requirements: [],
      });
    });

    it("should add node with parent and create edge", () => {
      const { result } = renderHook(() => useSkillStore());
      const initialNodeCount = result.current.nodes.length;
      const initialEdgeCount = result.current.edges.length;

      // Add parent node first
      act(() => {
        result.current.addNode(SkillActionNodeType.Sequence, null);
      });

      const parentNode = result.current.nodes.find(
        (n) =>
          n.type === SkillActionNodeType.Sequence &&
          n.data.name === "New Sequence",
      );
      const parentId = parentNode?.id;

      // Add child node
      act(() => {
        result.current.addNode(SkillActionNodeType.Delay, parentId!);
      });

      expect(result.current.nodes).toHaveLength(initialNodeCount + 2);
      expect(result.current.edges).toHaveLength(initialEdgeCount + 1);
      const newEdge = result.current.edges.find((e) => e.source === parentId);
      expect(newEdge).toBeDefined();
    });

    it("should update node data", () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.addNode(SkillActionNodeType.Delay, null);
      });

      const delayNode = result.current.nodes.find(
        (n) =>
          n.type === SkillActionNodeType.Delay && n.data.name === "New Delay",
      );
      const nodeId = delayNode?.id;

      act(() => {
        result.current.updateNode(nodeId!, { name: "Updated Delay" });
      });

      const updatedNode = result.current.nodes.find((n) => n.id === nodeId);
      expect(updatedNode?.data.name).toBe("Updated Delay");
    });

    it("should remove node and its edges", () => {
      const { result } = renderHook(() => useSkillStore());
      const initialNodeCount = result.current.nodes.length;
      const initialEdgeCount = result.current.edges.length;

      // Add two nodes with connection
      act(() => {
        result.current.addNode(SkillActionNodeType.Sequence, null);
      });

      const parentNode = result.current.nodes.find(
        (n) =>
          n.type === SkillActionNodeType.Sequence &&
          n.data.name === "New Sequence",
      );
      const parentId = parentNode?.id;

      act(() => {
        result.current.addNode(SkillActionNodeType.Delay, parentId!);
      });

      expect(result.current.nodes).toHaveLength(initialNodeCount + 2);
      expect(result.current.edges).toHaveLength(initialEdgeCount + 1);

      // Remove parent node
      act(() => {
        result.current.removeNode(parentId!);
      });

      expect(result.current.nodes).toHaveLength(initialNodeCount + 1);
      expect(result.current.edges).toHaveLength(initialEdgeCount);
    });
  });

  describe("Entity References", () => {
    it("should set icon reference", () => {
      const { result } = renderHook(() => useSkillStore());
      const newIconRef = {
        id: "test-icon-id",
        type: EntityType.Image,
        owner: "Test",
        key: "TestIcon",
        version: 2,
      };

      act(() => {
        result.current.setIconReference(newIconRef);
      });

      expect(result.current.skillData?.entity.icon_reference).toEqual(
        newIconRef,
      );
    });

    it("should set indicators", () => {
      const { result } = renderHook(() => useSkillStore());
      const indicators = [
        {
          model_reference: {
            id: "test-model",
            type: EntityType.Model,
            owner: "Test",
            key: "TestModel",
            version: 1,
          },
          position: SkillIndicatorPosition.Character,
          scale: { x: 1, y: 1, z: 1 },
        },
      ];

      act(() => {
        result.current.setIndicators(indicators);
      });

      expect(result.current.skillData?.entity.indicators).toEqual(indicators);
    });
  });

  describe("Import/Export", () => {
    it("should export skill data to JSON", () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.updateMetadata("Test Skill", "Test Description");
      });

      let jsonString: string;

      act(() => {
        jsonString = result.current.exportToJson();
      });

      const parsedData: {
        entity: { metadata: { title: string; description: string } };
      } = JSON.parse(jsonString!);

      expect(parsedData.entity.metadata.title).toBe("Test Skill");
      expect(parsedData.entity.metadata.description).toBe("Test Description");
    });

    it("should import skill data from JSON", () => {
      const { result } = renderHook(() => useSkillStore());

      const testData = {
        id: "test-id",
        owner: "Test",
        type: EntityType.Skill,
        key: "test-skill",
        version: 1,
        entity: {
          metadata: {
            title: "Imported Skill",
            description: "Imported Description",
          },
          quality: QualityType.Rare,
          categories: [],
          cost: { mana: 25 },
          cooldown: 3,
          target_type: SkillTargetType.Ally,
          execution_root: {
            type: SkillActionNodeType.Sequence,
            name: "Root",
            children: [],
            loop: 1,
          },
          icon_reference: {
            id: "imported-icon",
            type: EntityType.Image,
            owner: "Test",
            key: "ImportedIcon",
            version: 1,
          },
          indicators: [],
          cast_distance: { min: 1, max: 5 },
        },
      };

      act(() => {
        result.current.importFromJson(JSON.stringify(testData));
      });

      expect(result.current.skillData?.entity.metadata.title).toBe(
        "Imported Skill",
      );
      expect(result.current.skillData?.entity.quality).toBe(QualityType.Rare);
      expect(result.current.skillData?.entity.cost.mana).toBe(25);
      expect(result.current.skillData?.entity.cooldown).toBe(3);
    });

    it("should handle invalid JSON gracefully", () => {
      const { result } = renderHook(() => useSkillStore());
      const originalData = result.current.skillData;

      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Silent mock implementation
      });

      act(() => {
        result.current.importFromJson("invalid json");
      });

      // Should not change the data when JSON is invalid
      expect(result.current.skillData).toEqual(originalData);

      // Restore console.error
      consoleSpy.mockRestore();
    });
  });

  describe("React Flow Integration", () => {
    it("should prevent multiple children on requirement nodes", () => {
      const { result } = renderHook(() => useSkillStore());
      const initialEdgeCount = result.current.edges.length;

      // Add requirement node
      act(() => {
        result.current.addNode(SkillActionNodeType.Requirement, null);
      });

      const reqNode = result.current.nodes.find(
        (n) =>
          n.type === SkillActionNodeType.Requirement &&
          n.data.name === "New Requirement",
      );
      const reqNodeId = reqNode?.id;

      // Add first child
      act(() => {
        result.current.addNode(SkillActionNodeType.Delay, reqNodeId!);
      });

      expect(result.current.edges).toHaveLength(initialEdgeCount + 1);

      // Suppress console.warn for this test
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {
          // Silent mock implementation
        });

      // Try to connect another child (should be handled by onConnect)
      const connection = {
        source: reqNodeId!,
        target: "some-other-node",
        sourceHandle: null,
        targetHandle: null,
      };

      // This should not create a second edge due to the requirement node constraint
      act(() => {
        result.current.onConnect(connection);
      });

      // Should still have only the initial + 1 edge
      expect(result.current.edges).toHaveLength(initialEdgeCount + 1);

      // Restore console.warn
      consoleWarnSpy.mockRestore();
    });

    it("should update nodes correctly", () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.addNode(SkillActionNodeType.Sequence, null);
      });

      const newNodes = [
        {
          ...result.current.nodes[0],
          position: { x: 100, y: 200 },
        },
      ];

      act(() => {
        result.current.setNodes(newNodes);
      });

      expect(result.current.nodes[0].position).toEqual({ x: 100, y: 200 });
    });
  });

  describe("Node Conversion", () => {
    it("should convert skill data to flow nodes", () => {
      const { result } = renderHook(() => useSkillStore());

      // Set up skill data with nested structure
      const skillData = {
        ...result.current.skillData!,
        entity: {
          ...result.current.skillData!.entity,
          execution_root: {
            type: SkillActionNodeType.Sequence,
            name: "Root Sequence",
            children: [
              {
                type: SkillActionNodeType.Delay,
                name: "Initial Delay",
                delay: 1.0,
              },
              {
                type: SkillActionNodeType.Hit,
                name: "Damage",
                hit_effect: {
                  hit_type: "Damage" as const,
                  scalers: [],
                  target_mechanic: { type: "Self" as const },
                  target: "Enemy" as const,
                  hit_sound: {
                    id: "",
                    owner: "Octoio",
                    type: EntityType.Sound,
                    key: "",
                    version: 1,
                  },
                  can_crit: true,
                  can_miss: true,
                },
              },
            ],
            loop: 1,
          } as SkillActionNode,
        },
      };

      act(() => {
        result.current.setSkillData(skillData);
      });

      // Should convert to nodes automatically
      expect(result.current.nodes.length).toBeGreaterThan(0);
      expect(result.current.edges.length).toBeGreaterThan(0);
    });
  });

  describe("Entity References", () => {
    it("should set and get entity references", () => {
      const { result } = renderHook(() => useSkillStore());

      // Get default references and modify them
      const mockReferences = {
        ...result.current.entityReferences,
        [EntityType.Sound]: [
          {
            id: "test-sound-1",
            type: EntityType.Sound,
            owner: "Test",
            key: "TestSound1",
            version: 1,
          },
          {
            id: "test-sound-2",
            type: EntityType.Sound,
            owner: "Test",
            key: "TestSound2",
            version: 1,
          },
        ],
        [EntityType.Image]: [
          {
            id: "test-image-1",
            type: EntityType.Image,
            owner: "Test",
            key: "TestImage1",
            version: 1,
          },
        ],
      };

      act(() => {
        result.current.setEntityReferences(mockReferences);
      });

      expect(result.current.entityReferences).toEqual(mockReferences);

      // Test getting references by type
      const soundReferences = result.current.getEntityReferencesByType(
        EntityType.Sound,
      );
      expect(soundReferences).toHaveLength(2);
      expect(soundReferences[0].key).toBe("TestSound1");

      const imageReferences = result.current.getEntityReferencesByType(
        EntityType.Image,
      );
      expect(imageReferences).toHaveLength(1);
      expect(imageReferences[0].key).toBe("TestImage1");
    });
  });

  describe("Entity Definition Updates", () => {
    it("should update entity definition directly", () => {
      const { result } = renderHook(() => useSkillStore());
      const newDefinition = {
        id: "new-skill-id",
        owner: "NewOwner",
        type: EntityType.Skill,
        key: "new-skill-key",
        version: 2,
        entity: {
          metadata: {
            title: "Direct Update Skill",
            description: "Updated via updateEntityDefinition",
          },
          quality: QualityType.Legendary,
          categories: [],
          cost: { mana: 100 },
          cooldown: 10,
          target_type: SkillTargetType.Self,
          execution_root: {
            type: SkillActionNodeType.Sequence,
            name: "Updated Root",
            children: [],
            loop: 2,
          } as SkillActionNode,
          icon_reference: {
            id: "new-icon",
            type: EntityType.Image,
            owner: "NewOwner",
            key: "NewIcon",
            version: 1,
          },
          indicators: [],
          cast_distance: { min: 3, max: 8 },
        },
      };

      act(() => {
        result.current.updateEntityDefinition(newDefinition);
      });

      expect(result.current.skillData).toEqual(newDefinition);
      expect(result.current.skillData?.entity.metadata.title).toBe(
        "Direct Update Skill",
      );
      expect(result.current.skillData?.entity.quality).toBe(
        QualityType.Legendary,
      );
      expect(result.current.skillData?.id).toBe("new-skill-id");
      expect(result.current.skillData?.owner).toBe("NewOwner");
    });
  });

  describe("Advanced Node Operations", () => {
    it("should handle reorderNode with invalid node ID", () => {
      const { result } = renderHook(() => useSkillStore());

      // Try to reorder a non-existent node
      act(() => {
        result.current.reorderNode("invalid-node-id", "left");
      });

      // Should not crash and state should remain unchanged
      expect(result.current.nodes.length).toBeGreaterThanOrEqual(1);
    });

    it("should handle reorderNode with node that has no parent", () => {
      const { result } = renderHook(() => useSkillStore());

      // Get the root node (which has no parent)
      const rootNode = result.current.nodes[0];

      act(() => {
        result.current.reorderNode(rootNode.id, "right");
      });

      // Should not crash and state should remain unchanged
      expect(result.current.nodes.length).toBeGreaterThanOrEqual(1);
    });

    it("should handle reorderNode at boundaries", () => {
      const { result } = renderHook(() => useSkillStore());

      // Add parent and multiple children
      act(() => {
        result.current.addNode(SkillActionNodeType.Sequence, null);
      });

      const parentNode = result.current.nodes.find(
        (n) =>
          n.type === SkillActionNodeType.Sequence &&
          n.data.name === "New Sequence",
      );
      const parentId = parentNode?.id;

      // Add multiple children
      act(() => {
        result.current.addNode(SkillActionNodeType.Delay, parentId!);
      });
      act(() => {
        result.current.addNode(SkillActionNodeType.Sound, parentId!);
      });
      act(() => {
        result.current.addNode(SkillActionNodeType.Animation, parentId!);
      });

      const childNodes = result.current.nodes.filter((n) =>
        result.current.edges.some(
          (e) => e.source === parentId && e.target === n.id,
        ),
      );

      // Sort children by position to get leftmost and rightmost
      const sortedChildren = [...childNodes].sort(
        (a, b) => a.position.x - b.position.x,
      );
      const leftmostChild = sortedChildren[0];
      const rightmostChild = sortedChildren[sortedChildren.length - 1];

      // Try to move leftmost child further left (should do nothing)
      const initialLeftPosition = leftmostChild.position.x;
      act(() => {
        result.current.reorderNode(leftmostChild.id, "left");
      });

      const updatedLeftChild = result.current.nodes.find(
        (n) => n.id === leftmostChild.id,
      );
      expect(updatedLeftChild?.position.x).toBe(initialLeftPosition);

      // Try to move rightmost child further right (should do nothing)
      const initialRightPosition = rightmostChild.position.x;
      act(() => {
        result.current.reorderNode(rightmostChild.id, "right");
      });

      const updatedRightChild = result.current.nodes.find(
        (n) => n.id === rightmostChild.id,
      );
      expect(updatedRightChild?.position.x).toBe(initialRightPosition);
    });

    it("should handle successful node reordering", () => {
      const { result } = renderHook(() => useSkillStore());

      // Add parent and multiple children
      act(() => {
        result.current.addNode(SkillActionNodeType.Sequence, null);
      });

      const parentNode = result.current.nodes.find(
        (n) =>
          n.type === SkillActionNodeType.Sequence &&
          n.data.name === "New Sequence",
      );
      const parentId = parentNode?.id;

      // Add two children
      act(() => {
        result.current.addNode(SkillActionNodeType.Delay, parentId!);
      });
      act(() => {
        result.current.addNode(SkillActionNodeType.Sound, parentId!);
      });

      const childNodes = result.current.nodes.filter((n) =>
        result.current.edges.some(
          (e) => e.source === parentId && e.target === n.id,
        ),
      );

      // Sort children by position
      const sortedChildren = [...childNodes].sort(
        (a, b) => a.position.x - b.position.x,
      );
      const leftChild = sortedChildren[0];
      const rightChild = sortedChildren[1];

      const initialLeftPosition = leftChild.position.x;
      const initialRightPosition = rightChild.position.x;

      // Move right child to the left
      act(() => {
        result.current.reorderNode(rightChild.id, "left");
      });

      // Positions should be swapped
      const updatedLeftChild = result.current.nodes.find(
        (n) => n.id === leftChild.id,
      );
      const updatedRightChild = result.current.nodes.find(
        (n) => n.id === rightChild.id,
      );

      expect(updatedLeftChild?.position.x).toBe(initialRightPosition);
      expect(updatedRightChild?.position.x).toBe(initialLeftPosition);
    });
  });

  describe("Flow Conversion Edge Cases", () => {
    it("should handle nodesToSkill edge cases", () => {
      const { result } = renderHook(() => useSkillStore());

      // Test the scenario where the function handles edge cases gracefully
      // We'll test with a valid but minimal scenario since TypeScript prevents null
      act(() => {
        result.current.nodesToSkill();
      });

      // Test passes if no error is thrown
      expect(true).toBe(true);
    });

    it("should handle skillToNodes with no execution_root", () => {
      const { result } = renderHook(() => useSkillStore());

      const skillDataWithoutRoot = {
        ...result.current.skillData!,
        entity: {
          ...result.current.skillData!.entity,
          execution_root: undefined as unknown as SkillActionNode,
        },
      };

      act(() => {
        result.current.setSkillData(skillDataWithoutRoot);
      });

      // The store handles missing execution_root by gracefully managing the conversion
      // It may create default nodes or handle the undefined case appropriately
      expect(result.current.nodes).toBeDefined();
      expect(result.current.edges).toBeDefined();
    });

    it("should handle complex nested skill structure conversion", () => {
      const { result } = renderHook(() => useSkillStore());

      const complexSkill = {
        ...result.current.skillData!,
        entity: {
          ...result.current.skillData!.entity,
          execution_root: {
            type: SkillActionNodeType.Sequence,
            name: "Complex Root",
            children: [
              {
                type: SkillActionNodeType.Requirement,
                name: "Requirement Check",
                requirements: {
                  operator: RequirementOperator.All,
                  requirements: [],
                },
                child: {
                  type: SkillActionNodeType.Delay,
                  name: "Conditional Delay",
                  delay: 0.5,
                },
              },
              {
                type: SkillActionNodeType.Parallel,
                name: "Parallel Actions",
                children: [
                  {
                    type: SkillActionNodeType.Hit,
                    name: "Damage Effect",
                    hit_effect: {
                      hit_type: "Damage" as const,
                      scalers: [],
                      target_mechanic: { type: "Self" as const },
                      target: "Enemy" as const,
                      hit_sound: {
                        id: "",
                        owner: "Octoio",
                        type: EntityType.Sound,
                        key: "",
                        version: 1,
                      },
                      can_crit: true,
                      can_miss: true,
                    },
                  },
                  {
                    type: SkillActionNodeType.Sound,
                    name: "Sound Effect",
                    sound: {
                      id: "test-sound",
                      owner: "Test",
                      type: EntityType.Sound,
                      key: "TestSound",
                      version: 1,
                    },
                  },
                ],
                loop: 1,
              },
            ],
            loop: 1,
          } as SkillActionNode,
        },
      };

      act(() => {
        result.current.setSkillData(complexSkill);
      });

      // Should convert complex structure correctly
      expect(result.current.nodes.length).toBeGreaterThan(0);
      expect(result.current.edges.length).toBeGreaterThan(0);

      // Verify that both container and leaf nodes are created
      const sequenceNodes = result.current.nodes.filter(
        (n) => n.type === SkillActionNodeType.Sequence,
      );
      const parallelNodes = result.current.nodes.filter(
        (n) => n.type === SkillActionNodeType.Parallel,
      );
      const requirementNodes = result.current.nodes.filter(
        (n) => n.type === SkillActionNodeType.Requirement,
      );

      expect(sequenceNodes.length).toBeGreaterThanOrEqual(1);
      expect(parallelNodes.length).toBeGreaterThanOrEqual(1);
      expect(requirementNodes.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Store Reset", () => {
    it("should maintain state independently between tests", () => {
      const { result } = renderHook(() => useSkillStore());

      // This test verifies that our store reset is working
      // The beforeEach sets up a clean state, but nodes are created from the skill data
      expect(result.current.nodes.length).toBeGreaterThanOrEqual(1);
      expect(result.current.skillData?.entity.metadata.title).toBe("");
    });
  });

  describe("Error Handling", () => {
    it("should handle updateSkillEntity with null skillData", () => {
      const { result } = renderHook(() => useSkillStore());

      // Create a temporary store state without skillData by directly modifying the store
      // We'll test the internal protection mechanism
      const originalSkillData = result.current.skillData;

      // Set skillData to null by updating the definition
      act(() => {
        result.current.updateEntityDefinition(
          undefined as unknown as SkillEntityDefinition,
        );
      });

      // Try to update skill entity (should not crash due to internal null check)
      act(() => {
        result.current.updateMetadata("Test", "Description");
      });

      // Restore original data for cleanup
      act(() => {
        result.current.setSkillData(originalSkillData!);
      });

      // Test passes if no error is thrown
      expect(true).toBe(true);
    });

    it("should handle edge case in convertFlowToExecutionTree with no nodes", () => {
      const { result } = renderHook(() => useSkillStore());

      // Clear all nodes
      act(() => {
        result.current.setNodes([]);
      });

      // Try to convert to skill (should handle gracefully)
      act(() => {
        result.current.nodesToSkill();
      });

      // Should not crash
      expect(result.current.nodes).toEqual([]);
    });

    it("should handle edge case in convertFlowToExecutionTree with complex scenarios", () => {
      const { result } = renderHook(() => useSkillStore());

      // Create nodes with various edge cases
      const mockNodes = [
        {
          id: "node1",
          type: SkillActionNodeType.Delay,
          position: { x: 0, y: 0 },
          data: {
            type: SkillActionNodeType.Delay,
            name: "Delay 1",
            delay: 1.0,
          },
        },
        {
          id: "node2",
          type: SkillActionNodeType.Delay,
          position: { x: 100, y: 0 },
          data: {
            type: SkillActionNodeType.Delay,
            name: "Delay 2",
            delay: 2.0,
          },
        },
      ];

      act(() => {
        result.current.setNodes(mockNodes);
      });

      // Try to convert to skill with disconnected nodes
      act(() => {
        result.current.nodesToSkill();
      });

      // Should not crash and handle edge cases gracefully
      expect(true).toBe(true);
    });
  });
});
