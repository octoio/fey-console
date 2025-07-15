import { NodeProps } from "reactflow";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { HitEffectNode } from "@components/nodetypes/hit-effect-node";
import { HitType, EntityType, EntityReference } from "@models/common.types";
import {
  HitEffect,
  SkillActionNodeType,
  SkillEffectTarget,
  SkillEffectTargetMechanicType,
} from "@models/skill.types";
import { StatType } from "@models/stat.types";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock the store
vi.mock("@store/skill.store");

// Mock components from node-common
vi.mock("@components/node-common", async () => {
  const actual = await vi.importActual("@components/node-common");
  return {
    ...actual,
    createNodeComponent: vi.fn((config) => {
      const MockedComponent = (props: NodeProps) => (
        <div data-testid="hit-effect-node" data-node-type={config.nodeType}>
          <div
            data-testid="node-colors"
            data-bg={config.backgroundColor}
            data-border={config.borderColor}
          >
            {config.renderContent(props)}
          </div>
        </div>
      );
      return MockedComponent;
    }),
    HitEffectEditor: vi.fn(({ hitEffect, onChange }) => (
      <div data-testid="hit-effect-editor">
        <div data-testid="hit-type-selector">
          <select
            data-testid="hit-type-select"
            value={hitEffect?.hit_type || HitType.Damage}
            onChange={(e) =>
              onChange({ ...hitEffect, hit_type: e.target.value as HitType })
            }
          >
            <option value={HitType.Damage}>Damage</option>
            <option value={HitType.Heal}>Heal</option>
            <option value={HitType.Threat}>Threat</option>
            <option value={HitType.Mana}>Mana</option>
          </select>
        </div>

        <div data-testid="hit-sound-input">
          <input
            data-testid="hit-sound-key"
            value={hitEffect?.hit_sound?.key || ""}
            onChange={(e) =>
              onChange({
                ...hitEffect,
                hit_sound: e.target.value
                  ? { key: e.target.value, type: EntityType.Sound }
                  : null,
              })
            }
            placeholder="Hit sound key"
          />
        </div>

        <div data-testid="checkboxes">
          <label>
            <input
              type="checkbox"
              data-testid="can-crit-checkbox"
              checked={hitEffect?.can_crit || false}
              onChange={(e) =>
                onChange({ ...hitEffect, can_crit: e.target.checked })
              }
            />
            Can Critical Hit
          </label>

          <label>
            <input
              type="checkbox"
              data-testid="can-miss-checkbox"
              checked={hitEffect?.can_miss || false}
              onChange={(e) =>
                onChange({ ...hitEffect, can_miss: e.target.checked })
              }
            />
            Can Miss
          </label>
        </div>

        <div data-testid="scalers">
          <div>Scalers: {JSON.stringify(hitEffect?.scalers || [])}</div>
        </div>

        <div data-testid="targeting">
          <div>Target: {JSON.stringify(hitEffect?.target || {})}</div>
          <div>
            Target Mechanic: {JSON.stringify(hitEffect?.target_mechanic || {})}
          </div>
        </div>
      </div>
    )),
    NODE_COLORS: {
      LIGHT_RED_BG: "#ffe6e6",
      RED_BORDER: "#ff4d4f",
    },
  };
});

// Mock store function for testing updates
const mockUpdateNodeData = vi.fn();

// Mock the useSkillStore hook with minimal implementation
vi.mock("@store/skill.store", () => ({
  useSkillStore: vi.fn(() => ({
    updateNode: mockUpdateNodeData,
  })),
}));

// Mock node-operations utility
vi.mock("@utils/node-operations", () => ({
  createNodeDataHandler: vi.fn((id, data, property) => ({
    data: data || {
      hit_type: HitType.Damage,
      scalers: [],
      target: SkillEffectTarget.Enemy,
      target_mechanic: { type: SkillEffectTargetMechanicType.Self },
      hit_sound: null,
      can_crit: false,
      can_miss: false,
    },
    onChange: vi.fn((newData) => {
      mockUpdateNodeData(id, { [property]: newData });
    }),
  })),
}));

describe("HitEffectNode", () => {
  const defaultHitEffect: HitEffect = {
    hit_type: HitType.Damage,
    scalers: [],
    target: SkillEffectTarget.Enemy,
    target_mechanic: { type: SkillEffectTargetMechanicType.Self },
    hit_sound: {
      owner: "test",
      type: EntityType.Sound,
      key: "",
      version: 1,
      id: "test-id",
    },
    can_crit: false,
    can_miss: false,
  };

  const createMockEntityReference = (key: string): EntityReference => ({
    owner: "test",
    type: EntityType.Sound,
    key,
    version: 1,
    id: `test-${key}`,
  });

  const createMockProps = (hitEffect: Partial<HitEffect> = {}): NodeProps => ({
    id: "hit-effect-node-1",
    data: {
      hit_effect: { ...defaultHitEffect, ...hitEffect },
    },
    type: "hitEffect",
    dragHandle: "",
    isConnectable: true,
    zIndex: 0,
    xPos: 0,
    yPos: 0,
    dragging: false,
    selected: false,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the hit effect node with correct structure", () => {
      const props = createMockProps();
      render(<HitEffectNode {...props} />);

      expect(screen.getByTestId("hit-effect-node")).toBeInTheDocument();
      expect(screen.getByTestId("hit-effect-editor")).toBeInTheDocument();
      expect(screen.getByTestId("hit-type-selector")).toBeInTheDocument();
      expect(screen.getByTestId("hit-sound-input")).toBeInTheDocument();
      expect(screen.getByTestId("checkboxes")).toBeInTheDocument();
      expect(screen.getByTestId("scalers")).toBeInTheDocument();
      expect(screen.getByTestId("targeting")).toBeInTheDocument();
    });

    it("renders with correct node type and colors", () => {
      const props = createMockProps();
      render(<HitEffectNode {...props} />);

      const nodeElement = screen.getByTestId("hit-effect-node");
      expect(nodeElement).toHaveAttribute(
        "data-node-type",
        SkillActionNodeType.Hit,
      );

      const colorsElement = screen.getByTestId("node-colors");
      expect(colorsElement).toHaveAttribute("data-bg", "#ffe6e6");
      expect(colorsElement).toHaveAttribute("data-border", "#ff4d4f");
    });

    it("renders with default hit effect values", () => {
      const props = createMockProps();
      render(<HitEffectNode {...props} />);

      const hitTypeSelect = screen.getByTestId("hit-type-select");
      expect(hitTypeSelect).toHaveValue(HitType.Damage);

      const hitSoundInput = screen.getByTestId("hit-sound-key");
      expect(hitSoundInput).toHaveValue("");

      const canCritCheckbox = screen.getByTestId("can-crit-checkbox");
      expect(canCritCheckbox).not.toBeChecked();

      const canMissCheckbox = screen.getByTestId("can-miss-checkbox");
      expect(canMissCheckbox).not.toBeChecked();
    });

    it("renders with custom hit effect values", () => {
      const customHitEffect: Partial<HitEffect> = {
        hit_type: HitType.Heal,
        hit_sound: createMockEntityReference("heal_sound"),
        can_crit: true,
        can_miss: true,
        scalers: [
          { base: 100, scaling: { min: 1.0, max: 2.0 }, stat: StatType.Int },
        ],
      };

      const props = createMockProps(customHitEffect);
      render(<HitEffectNode {...props} />);

      const hitTypeSelect = screen.getByTestId("hit-type-select");
      expect(hitTypeSelect).toHaveValue(HitType.Heal);

      const hitSoundInput = screen.getByTestId("hit-sound-key");
      expect(hitSoundInput).toHaveValue("heal_sound");

      const canCritCheckbox = screen.getByTestId("can-crit-checkbox");
      expect(canCritCheckbox).toBeChecked();

      const canMissCheckbox = screen.getByTestId("can-miss-checkbox");
      expect(canMissCheckbox).toBeChecked();
    });
  });

  describe("Hit Type Interaction", () => {
    it("handles hit type changes", async () => {
      const props = createMockProps();
      render(<HitEffectNode {...props} />);

      const hitTypeSelect = screen.getByTestId("hit-type-select");

      fireEvent.change(hitTypeSelect, { target: { value: HitType.Heal } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith("hit-effect-node-1", {
          hit_effect: expect.objectContaining({
            hit_type: HitType.Heal,
          }),
        });
      });
    });

    it("supports all hit types", async () => {
      const props = createMockProps();
      render(<HitEffectNode {...props} />);

      const hitTypeSelect = screen.getByTestId("hit-type-select");

      // Test changing to Heal
      fireEvent.change(hitTypeSelect, { target: { value: HitType.Heal } });
      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith("hit-effect-node-1", {
          hit_effect: expect.objectContaining({
            hit_type: HitType.Heal,
          }),
        });
      });

      // Test changing to Threat
      fireEvent.change(hitTypeSelect, { target: { value: HitType.Threat } });
      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith("hit-effect-node-1", {
          hit_effect: expect.objectContaining({
            hit_type: HitType.Threat,
          }),
        });
      });

      // Test changing to Mana
      fireEvent.change(hitTypeSelect, { target: { value: HitType.Mana } });
      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith("hit-effect-node-1", {
          hit_effect: expect.objectContaining({
            hit_type: HitType.Mana,
          }),
        });
      });
    });
  });

  describe("Hit Sound Interaction", () => {
    it("handles hit sound key changes", async () => {
      const props = createMockProps();
      render(<HitEffectNode {...props} />);

      const hitSoundInput = screen.getByTestId("hit-sound-key");

      fireEvent.change(hitSoundInput, { target: { value: "sword_hit" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith("hit-effect-node-1", {
          hit_effect: expect.objectContaining({
            hit_sound: expect.objectContaining({
              key: "sword_hit",
              type: EntityType.Sound,
            }),
          }),
        });
      });
    });

    it("handles clearing hit sound", async () => {
      const props = createMockProps({
        hit_sound: createMockEntityReference("existing_sound"),
      });
      render(<HitEffectNode {...props} />);

      const hitSoundInput = screen.getByTestId("hit-sound-key");
      expect(hitSoundInput).toHaveValue("existing_sound");

      fireEvent.change(hitSoundInput, { target: { value: "" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith("hit-effect-node-1", {
          hit_effect: expect.objectContaining({
            hit_sound: null,
          }),
        });
      });
    });
  });

  describe("Checkbox Interactions", () => {
    it("handles can crit checkbox changes", async () => {
      const props = createMockProps();
      render(<HitEffectNode {...props} />);

      const canCritCheckbox = screen.getByTestId("can-crit-checkbox");

      fireEvent.click(canCritCheckbox);

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith("hit-effect-node-1", {
          hit_effect: expect.objectContaining({
            can_crit: true,
          }),
        });
      });
    });

    it("handles can miss checkbox changes", async () => {
      const props = createMockProps();
      render(<HitEffectNode {...props} />);

      const canMissCheckbox = screen.getByTestId("can-miss-checkbox");

      fireEvent.click(canMissCheckbox);

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith("hit-effect-node-1", {
          hit_effect: expect.objectContaining({
            can_miss: true,
          }),
        });
      });
    });

    it("handles unchecking checkboxes", async () => {
      const props = createMockProps({ can_crit: true, can_miss: true });
      render(<HitEffectNode {...props} />);

      const canCritCheckbox = screen.getByTestId("can-crit-checkbox");
      const canMissCheckbox = screen.getByTestId("can-miss-checkbox");

      expect(canCritCheckbox).toBeChecked();
      expect(canMissCheckbox).toBeChecked();

      fireEvent.click(canCritCheckbox);
      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith("hit-effect-node-1", {
          hit_effect: expect.objectContaining({
            can_crit: false,
          }),
        });
      });

      fireEvent.click(canMissCheckbox);
      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith("hit-effect-node-1", {
          hit_effect: expect.objectContaining({
            can_miss: false,
          }),
        });
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles missing hit_effect data gracefully", () => {
      const props: NodeProps = {
        id: "hit-effect-node-1",
        data: {},
        type: "hitEffect",
        dragHandle: "",
        isConnectable: true,
        zIndex: 0,
        xPos: 0,
        yPos: 0,
        dragging: false,
        selected: false,
      };

      render(<HitEffectNode {...props} />);

      expect(screen.getByTestId("hit-effect-node")).toBeInTheDocument();
      expect(screen.getByTestId("hit-effect-editor")).toBeInTheDocument();
    });

    it("handles null hit_effect data", () => {
      const props: NodeProps = {
        id: "hit-effect-node-1",
        data: { hit_effect: null },
        type: "hitEffect",
        dragHandle: "",
        isConnectable: true,
        zIndex: 0,
        xPos: 0,
        yPos: 0,
        dragging: false,
        selected: false,
      };

      render(<HitEffectNode {...props} />);

      expect(screen.getByTestId("hit-effect-node")).toBeInTheDocument();
      expect(screen.getByTestId("hit-effect-editor")).toBeInTheDocument();
    });

    it("handles partial hit_effect data", () => {
      const partialHitEffect = {
        hit_type: HitType.Damage,
      };

      const props: NodeProps = {
        id: "hit-effect-node-1",
        data: { hit_effect: partialHitEffect },
        type: "hitEffect",
        dragHandle: "",
        isConnectable: true,
        zIndex: 0,
        xPos: 0,
        yPos: 0,
        dragging: false,
        selected: false,
      };

      render(<HitEffectNode {...props} />);

      expect(screen.getByTestId("hit-effect-node")).toBeInTheDocument();
      expect(screen.getByTestId("hit-effect-editor")).toBeInTheDocument();
    });
  });

  describe("Complex Interactions", () => {
    it("handles multiple rapid changes", async () => {
      const props = createMockProps();
      render(<HitEffectNode {...props} />);

      const hitTypeSelect = screen.getByTestId("hit-type-select");
      const hitSoundInput = screen.getByTestId("hit-sound-key");
      const canCritCheckbox = screen.getByTestId("can-crit-checkbox");

      // Make multiple changes quickly
      fireEvent.change(hitTypeSelect, { target: { value: HitType.Heal } });
      fireEvent.change(hitSoundInput, { target: { value: "heal_sound" } });
      fireEvent.click(canCritCheckbox);

      // Wait for at least one call to verify function was called
      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith(
          "hit-effect-node-1",
          expect.objectContaining({
            hit_effect: expect.any(Object),
          }),
        );
      });

      // Verify multiple calls were made
      expect(mockUpdateNodeData).toHaveBeenCalledTimes(3);
    });

    it("maintains data integrity during updates", async () => {
      const initialHitEffect: Partial<HitEffect> = {
        hit_type: HitType.Damage,
        hit_sound: createMockEntityReference("sword_hit"),
        can_crit: true,
        can_miss: false,
        scalers: [
          { base: 50, scaling: { min: 1, max: 2 }, stat: StatType.Str },
        ],
      };

      const props = createMockProps(initialHitEffect);
      render(<HitEffectNode {...props} />);

      const hitTypeSelect = screen.getByTestId("hit-type-select");

      fireEvent.change(hitTypeSelect, { target: { value: HitType.Heal } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith("hit-effect-node-1", {
          hit_effect: expect.objectContaining({
            hit_type: HitType.Heal,
            // Verify other data is preserved
            hit_sound: expect.objectContaining({
              key: "sword_hit",
            }),
            can_crit: true,
            can_miss: false,
            scalers: expect.arrayContaining([
              expect.objectContaining({
                base: 50,
                stat: StatType.Str,
              }),
            ]),
          }),
        });
      });
    });
  });

  describe("Accessibility", () => {
    it("provides proper labels for form controls", () => {
      const props = createMockProps();
      render(<HitEffectNode {...props} />);

      const canCritCheckbox = screen.getByTestId("can-crit-checkbox");
      const canMissCheckbox = screen.getByTestId("can-miss-checkbox");

      // Check that labels are associated with checkboxes
      expect(canCritCheckbox).toBeInTheDocument();
      expect(canMissCheckbox).toBeInTheDocument();

      expect(screen.getByText("Can Critical Hit")).toBeInTheDocument();
      expect(screen.getByText("Can Miss")).toBeInTheDocument();
    });

    it("maintains focus management", () => {
      const props = createMockProps();
      render(<HitEffectNode {...props} />);

      const hitTypeSelect = screen.getByTestId("hit-type-select");
      const hitSoundInput = screen.getByTestId("hit-sound-key");

      hitTypeSelect.focus();
      expect(document.activeElement).toBe(hitTypeSelect);

      hitSoundInput.focus();
      expect(document.activeElement).toBe(hitSoundInput);
    });
  });
});
