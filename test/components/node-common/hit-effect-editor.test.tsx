import { describe, it, expect, vi, beforeEach } from "vitest";
import { HitEffectEditor } from "@components/node-common/hit-effect-editor";
import { HitType, EntityType } from "@models/common.types";
import {
  HitEffect,
  SkillEffectTarget,
  SkillEffectTargetMechanicType,
} from "@models/skill.types";
import { StatType } from "@models/stat.types";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock the sub-components
vi.mock("@components/node-common", async () => {
  const actual = await vi.importActual("@components/node-common");
  return {
    ...actual,
    NodeField: vi.fn(({ label, children }) => (
      <div data-testid="node-field" data-label={label}>
        {children}
      </div>
    )),
    NodeInteractive: vi.fn(({ children }) => (
      <div data-testid="node-interactive">{children}</div>
    )),
    NodeEntityReference: vi.fn(
      ({ entityType, value, onChange, label, placeholder }) => (
        <div data-testid="node-entity-reference">
          <label>{label}</label>
          <input
            data-testid="entity-reference-input"
            value={value}
            onChange={(e) =>
              onChange({
                id: "test-id",
                owner: "test-owner",
                type: entityType,
                key: e.target.value,
                version: 1,
              })
            }
            placeholder={placeholder}
          />
        </div>
      ),
    ),
    TargetMechanicEditor: vi.fn(
      ({ target, targetMechanic, onTargetChange, onMechanicChange }) => (
        <div data-testid="target-mechanic-editor">
          <select
            data-testid="target-select"
            value={target}
            onChange={(e) =>
              onTargetChange(e.target.value as SkillEffectTarget)
            }
          >
            <option value={SkillEffectTarget.Enemy}>Enemy</option>
            <option value={SkillEffectTarget.Ally}>Ally</option>
            <option value={SkillEffectTarget.Any}>Any</option>
          </select>
          <select
            data-testid="mechanic-select"
            value={targetMechanic.type}
            onChange={(e) =>
              onMechanicChange({
                type: e.target.value as SkillEffectTargetMechanicType,
              })
            }
          >
            <option value={SkillEffectTargetMechanicType.Self}>Self</option>
            <option value={SkillEffectTargetMechanicType.Team}>Team</option>
            <option value={SkillEffectTargetMechanicType.Selected}>
              Selected
            </option>
          </select>
        </div>
      ),
    ),
    NodeScalers: vi.fn(({ scalers, onChange, title }) => (
      <div data-testid="node-scalers">
        <div data-testid="scalers-title">{title}</div>
        <div data-testid="scalers-count">{scalers.length}</div>
        <button
          data-testid="add-scaler-btn"
          onClick={() =>
            onChange([
              ...scalers,
              { base: 10, scaling: { min: 1, max: 2 }, stat: StatType.Str },
            ])
          }
        >
          Add Scaler
        </button>
      </div>
    )),
  };
});

// Mock Ant Design components
vi.mock("antd", async (importOriginal) => {
  const actual = await importOriginal<typeof import("antd")>();
  return {
    ...actual,
    Select: Object.assign(
      vi.fn(({ value, onChange, children, style, size, ...props }) => (
        <select
          data-testid="ant-select"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          style={style}
          data-size={size}
          {...props}
        >
          {children}
        </select>
      )),
      {
        Option: vi.fn(({ value, children }) => (
          <option value={value}>{children}</option>
        )),
      },
    ),
    Checkbox: vi.fn(({ checked, onChange, children, ...props }) => (
      <label data-testid="ant-checkbox" {...props}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          data-testid="checkbox-input"
        />
        {children}
      </label>
    )),
    Space: vi.fn(({ direction, style, children }) => (
      <div data-testid="ant-space" data-direction={direction} style={style}>
        {children}
      </div>
    )),
  };
});

describe("HitEffectEditor", () => {
  const mockOnChange = vi.fn();

  const defaultHitEffect: HitEffect = {
    hit_type: HitType.Damage,
    scalers: [],
    target: SkillEffectTarget.Enemy,
    target_mechanic: { type: SkillEffectTargetMechanicType.Self },
    hit_sound: {
      id: "test-sound-id",
      owner: "test-owner",
      type: EntityType.Sound,
      key: "test-sound",
      version: 1,
    },
    can_crit: true,
    can_miss: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders all main components", () => {
      render(
        <HitEffectEditor
          hitEffect={defaultHitEffect}
          onChange={mockOnChange}
        />,
      );

      expect(screen.getAllByTestId("node-field")).toHaveLength(2); // Hit Type and checkbox fields
      expect(screen.getByTestId("target-mechanic-editor")).toBeInTheDocument();
      expect(screen.getByTestId("node-entity-reference")).toBeInTheDocument();
      expect(screen.getByTestId("node-scalers")).toBeInTheDocument();
    });

    it("renders hit type selector with correct value", () => {
      render(
        <HitEffectEditor
          hitEffect={defaultHitEffect}
          onChange={mockOnChange}
        />,
      );

      const hitTypeSelect = screen.getByTestId("ant-select");
      expect(hitTypeSelect).toHaveValue(HitType.Damage);
    });

    it("renders checkboxes with correct values", () => {
      render(
        <HitEffectEditor
          hitEffect={defaultHitEffect}
          onChange={mockOnChange}
        />,
      );

      const checkboxes = screen.getAllByTestId("checkbox-input");
      expect(checkboxes[0]).toBeChecked(); // can_crit
      expect(checkboxes[1]).not.toBeChecked(); // can_miss
    });

    it("displays hit sound input with correct value", () => {
      render(
        <HitEffectEditor
          hitEffect={defaultHitEffect}
          onChange={mockOnChange}
        />,
      );

      const soundInput = screen.getByTestId("entity-reference-input");
      expect(soundInput).toHaveValue("test-sound");
    });
  });

  describe("Hit Type Changes", () => {
    it("calls onChange when hit type changes", async () => {
      render(
        <HitEffectEditor
          hitEffect={defaultHitEffect}
          onChange={mockOnChange}
        />,
      );

      const hitTypeSelect = screen.getByTestId("ant-select");
      fireEvent.change(hitTypeSelect, { target: { value: HitType.Heal } });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultHitEffect,
        hit_type: HitType.Heal,
      });
    });

    it("handles all hit types correctly", async () => {
      render(
        <HitEffectEditor
          hitEffect={defaultHitEffect}
          onChange={mockOnChange}
        />,
      );

      const hitTypeSelect = screen.getByTestId("ant-select");

      // Test each hit type
      const hitTypes = [HitType.Heal, HitType.Threat, HitType.Mana];

      for (const hitType of hitTypes) {
        fireEvent.change(hitTypeSelect, { target: { value: hitType } });
        expect(mockOnChange).toHaveBeenCalledWith({
          ...defaultHitEffect,
          hit_type: hitType,
        });
      }
    });
  });

  describe("Target and Mechanic Changes", () => {
    it("calls onChange when target changes", () => {
      render(
        <HitEffectEditor
          hitEffect={defaultHitEffect}
          onChange={mockOnChange}
        />,
      );

      const targetSelect = screen.getByTestId("target-select");
      fireEvent.change(targetSelect, {
        target: { value: SkillEffectTarget.Ally },
      });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultHitEffect,
        target: SkillEffectTarget.Ally,
      });
    });

    it("calls onChange when target mechanic changes", () => {
      render(
        <HitEffectEditor
          hitEffect={defaultHitEffect}
          onChange={mockOnChange}
        />,
      );

      const mechanicSelect = screen.getByTestId("mechanic-select");
      fireEvent.change(mechanicSelect, {
        target: { value: SkillEffectTargetMechanicType.Team },
      });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultHitEffect,
        target_mechanic: { type: SkillEffectTargetMechanicType.Team },
      });
    });
  });

  describe("Sound Changes", () => {
    it("calls onChange when sound changes", () => {
      render(
        <HitEffectEditor
          hitEffect={defaultHitEffect}
          onChange={mockOnChange}
        />,
      );

      const soundInput = screen.getByTestId("entity-reference-input");
      fireEvent.change(soundInput, { target: { value: "new-sound-key" } });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultHitEffect,
        hit_sound: {
          id: "test-id",
          owner: "test-owner",
          type: EntityType.Sound,
          key: "new-sound-key",
          version: 1,
        },
      });
    });

    it("handles empty sound key", () => {
      const effectWithoutSound = {
        ...defaultHitEffect,
        hit_sound: {
          id: "",
          owner: "",
          type: EntityType.Sound,
          key: "",
          version: 1,
        },
      };

      render(
        <HitEffectEditor
          hitEffect={effectWithoutSound}
          onChange={mockOnChange}
        />,
      );

      const soundInput = screen.getByTestId("entity-reference-input");
      expect(soundInput).toHaveValue("");
    });
  });

  describe("Checkbox Changes", () => {
    it("calls onChange when can_crit changes", () => {
      render(
        <HitEffectEditor
          hitEffect={defaultHitEffect}
          onChange={mockOnChange}
        />,
      );

      const checkboxes = screen.getAllByTestId("checkbox-input");
      fireEvent.click(checkboxes[0]); // can_crit checkbox

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultHitEffect,
        can_crit: false, // toggled from true to false
      });
    });

    it("calls onChange when can_miss changes", () => {
      render(
        <HitEffectEditor
          hitEffect={defaultHitEffect}
          onChange={mockOnChange}
        />,
      );

      const checkboxes = screen.getAllByTestId("checkbox-input");
      fireEvent.click(checkboxes[1]); // can_miss checkbox

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultHitEffect,
        can_miss: true, // toggled from false to true
      });
    });
  });

  describe("Scalers Changes", () => {
    it("calls onChange when scalers change", () => {
      render(
        <HitEffectEditor
          hitEffect={defaultHitEffect}
          onChange={mockOnChange}
        />,
      );

      const addScalerBtn = screen.getByTestId("add-scaler-btn");
      fireEvent.click(addScalerBtn);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultHitEffect,
        scalers: [
          { base: 10, scaling: { min: 1, max: 2 }, stat: StatType.Str },
        ],
      });
    });

    it("passes correct title to NodeScalers", () => {
      render(
        <HitEffectEditor
          hitEffect={defaultHitEffect}
          onChange={mockOnChange}
        />,
      );

      const scalersTitle = screen.getByTestId("scalers-title");
      expect(scalersTitle).toHaveTextContent("Hit Effect Scalers");
    });
  });

  describe("Null/Undefined Handling", () => {
    it("handles null hitEffect gracefully", () => {
      render(
        <HitEffectEditor
          hitEffect={null as unknown as HitEffect}
          onChange={mockOnChange}
        />,
      );

      // Should still render without crashing
      const nodeFields = screen.getAllByTestId("node-field");
      expect(nodeFields.length).toBeGreaterThan(0);
      expect(screen.getByTestId("target-mechanic-editor")).toBeInTheDocument();
    });

    it("creates default values for null hitEffect", () => {
      render(
        <HitEffectEditor
          hitEffect={null as unknown as HitEffect}
          onChange={mockOnChange}
        />,
      );

      const hitTypeSelect = screen.getByTestId("ant-select");
      expect(hitTypeSelect).toHaveValue(HitType.Damage); // default value

      const checkboxes = screen.getAllByTestId("checkbox-input");
      expect(checkboxes[0]).not.toBeChecked(); // can_crit default false
      expect(checkboxes[1]).not.toBeChecked(); // can_miss default false
    });

    it("handles missing sound reference", () => {
      const effectWithoutSound = {
        ...defaultHitEffect,
        hit_sound: {
          id: "",
          owner: "",
          type: EntityType.Sound,
          key: "",
          version: 1,
        },
      };

      render(
        <HitEffectEditor
          hitEffect={effectWithoutSound}
          onChange={mockOnChange}
        />,
      );

      const soundInput = screen.getByTestId("entity-reference-input");
      expect(soundInput).toHaveValue("");
    });
  });

  describe("Component Integration", () => {
    it("passes correct props to TargetMechanicEditor", () => {
      render(
        <HitEffectEditor
          hitEffect={defaultHitEffect}
          onChange={mockOnChange}
        />,
      );

      const targetSelect = screen.getByTestId("target-select");
      const mechanicSelect = screen.getByTestId("mechanic-select");

      expect(targetSelect).toHaveValue(SkillEffectTarget.Enemy);
      expect(mechanicSelect).toHaveValue(SkillEffectTargetMechanicType.Self);
    });

    it("passes correct props to NodeEntityReference", () => {
      render(
        <HitEffectEditor
          hitEffect={defaultHitEffect}
          onChange={mockOnChange}
        />,
      );

      const entityReference = screen.getByTestId("node-entity-reference");
      expect(entityReference).toHaveTextContent("Hit Sound");

      const soundInput = screen.getByTestId("entity-reference-input");
      expect(soundInput).toHaveAttribute("placeholder", "Select sound");
    });

    it("passes correct props to NodeScalers", () => {
      const effectWithScalers = {
        ...defaultHitEffect,
        scalers: [
          { base: 5, scaling: { min: 0.5, max: 1.5 }, stat: StatType.Int },
        ],
      };

      render(
        <HitEffectEditor
          hitEffect={effectWithScalers}
          onChange={mockOnChange}
        />,
      );

      const scalersCount = screen.getByTestId("scalers-count");
      expect(scalersCount).toHaveTextContent("1");
    });
  });

  describe("Edge Cases", () => {
    it("handles partial hitEffect data", () => {
      const partialEffect: HitEffect = {
        hit_type: HitType.Heal,
        scalers: [],
        target: SkillEffectTarget.Ally,
        target_mechanic: { type: SkillEffectTargetMechanicType.Self },
        hit_sound: {
          id: "",
          owner: "",
          type: EntityType.Sound,
          key: "",
          version: 1,
        },
        can_crit: false,
        can_miss: false,
      };

      render(
        <HitEffectEditor hitEffect={partialEffect} onChange={mockOnChange} />,
      );

      expect(screen.getByTestId("ant-select")).toHaveValue(HitType.Heal);
      expect(screen.getByTestId("target-select")).toHaveValue(
        SkillEffectTarget.Ally,
      );
    });

    it("maintains immutability when making changes", () => {
      const originalEffect = { ...defaultHitEffect };

      render(
        <HitEffectEditor
          hitEffect={defaultHitEffect}
          onChange={mockOnChange}
        />,
      );

      const hitTypeSelect = screen.getByTestId("ant-select");
      fireEvent.change(hitTypeSelect, { target: { value: HitType.Heal } });

      // Original object should remain unchanged
      expect(defaultHitEffect.hit_type).toBe(HitType.Damage);

      // onChange should be called with new object
      expect(mockOnChange).toHaveBeenCalledWith({
        ...originalEffect,
        hit_type: HitType.Heal,
      });
    });
  });
});
