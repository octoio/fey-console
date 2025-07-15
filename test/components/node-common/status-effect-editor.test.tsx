/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable */
import { vi, describe, it, expect, beforeEach } from "vitest";
import { StatusEffectEditor } from "@components/node-common/status-effect-editor";
import { render, screen, fireEvent } from "@testing-library/react";
import { EntityType } from "@models/common.types";
import {
  StatusEffect,
  SkillEffectTarget,
  SkillEffectTargetMechanicType,
} from "@models/skill.types";
import { StatusDurationType } from "@models/status.types";
import { StatType } from "@models/stat.types";

// Mock Ant Design components
vi.mock("antd", () => {
  const Option = ({ children, value, ...props }: any) => (
    <option value={value} {...props}>
      {children}
    </option>
  );

  const SelectComponent = ({ children, value, onChange, ...props }: any) => {
    SelectComponent.Option = Option;
    return (
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        data-testid="ant-select"
        {...props}
      >
        {children}
      </select>
    );
  };
  SelectComponent.Option = Option;

  return {
    Button: ({
      children,
      onClick,
      icon,
      type,
      danger,
      size,
      ...props
    }: any) => (
      <button
        onClick={onClick}
        data-testid="ant-button"
        data-type={type}
        data-danger={danger}
        data-size={size}
        {...props}
      >
        {icon}
        {children}
      </button>
    ),
    InputNumber: ({
      value,
      onChange,
      min,
      step,
      size,
      style,
      ...props
    }: any) => (
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange?.(parseFloat(e.target.value) || 0)}
        min={min}
        step={step}
        data-testid="ant-input-number"
        data-size={size}
        style={style}
        {...props}
      />
    ),
    Select: SelectComponent,
  };
});

// Mock Ant Design icons
vi.mock("@ant-design/icons", () => ({
  DeleteOutlined: () => <span data-testid="delete-icon">Delete</span>,
}));

// Mock zustand
vi.mock("zustand", () => ({
  create: vi.fn(() => vi.fn()),
}));

// Mock the subcomponents
vi.mock("@components/node-common/target-mechanic-editor", () => ({
  TargetMechanicEditor: ({
    target,
    targetMechanic,
    onTargetChange,
    onMechanicChange,
  }: any) => (
    <div data-testid="target-mechanic-editor">
      <select
        data-testid="target-select"
        value={target}
        onChange={(e) => onTargetChange?.(e.target.value)}
      >
        <option value="Enemy">Enemy</option>
        <option value="Ally">Ally</option>
        <option value="Any">Any</option>
      </select>
      <select
        data-testid="mechanic-select"
        value={targetMechanic}
        onChange={(e) => onMechanicChange?.(e.target.value)}
      >
        <option value="Self">Self</option>
        <option value="Team">Team</option>
        <option value="Selected">Selected</option>
      </select>
    </div>
  ),
}));

vi.mock("@components/node-common/node-entity-reference", () => ({
  NodeEntityReference: ({
    entityType,
    value,
    onChange,
    label,
    placeholder,
  }: any) => (
    <div data-testid="node-entity-reference">
      <label>{label}</label>
      <input
        data-testid="entity-reference-input"
        value={value}
        onChange={(e) => onChange?.({ key: e.target.value, type: entityType })}
        placeholder={placeholder}
      />
    </div>
  ),
}));

vi.mock("@components/node-common/node-table", () => ({
  NodeTable: ({ title, columns, dataSource, onAdd }: any) => (
    <div data-testid="node-table">
      <div data-testid="table-title">{title}</div>
      <div data-testid="table-data-count">{dataSource?.length || 0}</div>
      <button data-testid="add-button" onClick={onAdd}>
        Add {title}
      </button>
      {dataSource?.map((item: any, index: number) => (
        <div key={index} data-testid={`table-row-${index}`}>
          {columns.map((col: any, colIndex: number) => (
            <div key={colIndex} data-testid={`table-cell-${index}-${colIndex}`}>
              {col.render ? col.render(null, item, index) : item[col.key]}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
}));

vi.mock("@components/node-common/node-scalers", () => ({
  NodeScalers: ({ scalers, onChange, title }: any) => (
    <div data-testid="node-scalers">
      <div data-testid="scalers-title">{title}</div>
      <div data-testid="scalers-count">{scalers?.length || 0}</div>
      <button
        data-testid="add-scaler-btn"
        onClick={() => onChange?.([...scalers, { type: "Base", value: 1.0 }])}
      >
        Add Scaler
      </button>
    </div>
  ),
}));

vi.mock("@components/node-common/node-interactive", () => ({
  NodeInteractive: ({ children }: any) => (
    <div data-testid="node-interactive">{children}</div>
  ),
}));

// Mock the index file that StatusEffectEditor imports from
vi.mock("@components/node-common", () => ({
  NodeTable: ({ title, columns, dataSource, onAdd }: any) => (
    <div data-testid="node-table">
      <div data-testid="table-title">{title}</div>
      <div data-testid="table-data-count">{dataSource?.length || 0}</div>
      <button data-testid="add-button" onClick={onAdd}>
        Add {title}
      </button>
      {dataSource?.map((item: any, index: number) => (
        <div key={index} data-testid={`table-row-${index}`}>
          {columns.map((col: any, colIndex: number) => (
            <div key={colIndex} data-testid={`table-cell-${index}-${colIndex}`}>
              {col.render ? col.render(null, item, index) : item[col.key]}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
  NodeEntityReference: ({
    entityType,
    value,
    onChange,
    label,
    placeholder,
  }: any) => (
    <div data-testid="node-entity-reference">
      <label>{label}</label>
      <input
        data-testid="entity-reference-input"
        value={value}
        onChange={(e) => onChange?.({ key: e.target.value, type: entityType })}
        placeholder={placeholder}
      />
    </div>
  ),
  NodeInteractive: ({ children }: any) => (
    <div data-testid="node-interactive">{children}</div>
  ),
  NodeScalers: ({ scalers, onChange, title }: any) => (
    <div data-testid="node-scalers">
      <div data-testid="scalers-title">{title}</div>
      <div data-testid="scalers-count">{scalers?.length || 0}</div>
      <button
        data-testid="add-scaler-btn"
        onClick={() => onChange?.([...scalers, { type: "Base", value: 1.0 }])}
      >
        Add Scaler
      </button>
    </div>
  ),
  TargetMechanicEditor: ({
    target,
    targetMechanic,
    onTargetChange,
    onMechanicChange,
  }: any) => (
    <div data-testid="target-mechanic-editor">
      <select
        data-testid="target-select"
        value={target}
        onChange={(e) => onTargetChange?.(e.target.value)}
      >
        <option value="Enemy">Enemy</option>
        <option value="Ally">Ally</option>
        <option value="Any">Any</option>
      </select>
      <select
        data-testid="mechanic-select"
        value={targetMechanic}
        onChange={(e) => onMechanicChange?.(e.target.value)}
      >
        <option value="Self">Self</option>
        <option value="Team">Team</option>
        <option value="Selected">Selected</option>
      </select>
    </div>
  ),
}));

// Mock utils
vi.mock("@utils/mechanic", () => ({
  createDefaultTargeting: () => ({
    target: "Enemy",
    target_mechanic: "Self",
  }),
}));

describe("StatusEffectEditor", () => {
  let mockOnChange: ReturnType<typeof vi.fn>;
  let mockStatusEffect: StatusEffect;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnChange = vi.fn();
    mockStatusEffect = {
      target: SkillEffectTarget.Enemy,
      target_mechanic: {
        type: SkillEffectTargetMechanicType.Self,
      },
      durations: [
        { type: StatusDurationType.Chrono, value: 5.0 },
        { type: StatusDurationType.Logical, value: 3.0 },
      ],
      scalers: [
        { base: 1.0, scaling: { min: 0.5, max: 1.5 }, stat: StatType.Str },
      ],
      status: {
        key: "test-status",
        type: EntityType.Status,
        owner: "test",
        version: 1,
        id: "test-id",
      },
    };
  });

  describe("Component Rendering", () => {
    it("renders all main components", () => {
      render(
        <StatusEffectEditor
          statusEffect={mockStatusEffect}
          onChange={mockOnChange}
        />,
      );

      expect(screen.getByTestId("target-mechanic-editor")).toBeInTheDocument();
      expect(screen.getByTestId("node-entity-reference")).toBeInTheDocument();
      expect(screen.getByTestId("node-table")).toBeInTheDocument();
      expect(screen.getByTestId("node-scalers")).toBeInTheDocument();
    });

    it("displays correct initial values", () => {
      render(
        <StatusEffectEditor
          statusEffect={mockStatusEffect}
          onChange={mockOnChange}
        />,
      );

      // Check status reference input
      expect(screen.getByDisplayValue("test-status")).toBeInTheDocument();

      // Check table shows correct duration count
      expect(screen.getByTestId("table-data-count")).toHaveTextContent("2");

      // Check scalers count
      expect(screen.getByTestId("scalers-count")).toHaveTextContent("1");
    });

    it("renders correct labels and titles", () => {
      render(
        <StatusEffectEditor
          statusEffect={mockStatusEffect}
          onChange={mockOnChange}
        />,
      );

      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Durations")).toBeInTheDocument();
      expect(screen.getByText("Status Effect Scalers")).toBeInTheDocument();
    });
  });

  describe("Target and Mechanic Changes", () => {
    it("handles target changes", () => {
      render(
        <StatusEffectEditor
          statusEffect={mockStatusEffect}
          onChange={mockOnChange}
        />,
      );

      const targetSelect = screen.getByTestId("target-select");
      fireEvent.change(targetSelect, { target: { value: "Ally" } });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockStatusEffect,
        target: "Ally",
      });
    });

    it("handles mechanic changes", () => {
      render(
        <StatusEffectEditor
          statusEffect={mockStatusEffect}
          onChange={mockOnChange}
        />,
      );

      const mechanicSelect = screen.getByTestId("mechanic-select");
      fireEvent.change(mechanicSelect, { target: { value: "Team" } });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockStatusEffect,
        target_mechanic: "Team",
      });
    });
  });

  describe("Status Entity Reference", () => {
    it("handles status reference changes", () => {
      render(
        <StatusEffectEditor
          statusEffect={mockStatusEffect}
          onChange={mockOnChange}
        />,
      );

      const statusInput = screen.getByTestId("entity-reference-input");
      fireEvent.change(statusInput, { target: { value: "new-status" } });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockStatusEffect,
        status: { key: "new-status", type: EntityType.Status },
      });
    });

    it("displays correct placeholder", () => {
      render(
        <StatusEffectEditor
          statusEffect={mockStatusEffect}
          onChange={mockOnChange}
        />,
      );

      const statusInput = screen.getByTestId("entity-reference-input");
      expect(statusInput).toHaveAttribute("placeholder", "Select status");
    });
  });

  describe("Duration Management", () => {
    it("renders duration table with correct data", () => {
      render(
        <StatusEffectEditor
          statusEffect={mockStatusEffect}
          onChange={mockOnChange}
        />,
      );

      expect(screen.getByTestId("table-data-count")).toHaveTextContent("2");
      expect(screen.getByTestId("table-row-0")).toBeInTheDocument();
      expect(screen.getByTestId("table-row-1")).toBeInTheDocument();
    });

    it("handles adding new duration", () => {
      render(
        <StatusEffectEditor
          statusEffect={mockStatusEffect}
          onChange={mockOnChange}
        />,
      );

      const addButton = screen.getByTestId("add-button");
      fireEvent.click(addButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockStatusEffect,
        durations: [
          ...mockStatusEffect.durations,
          { type: StatusDurationType.Chrono, value: 5.0 },
        ],
      });
    });

    it("handles duration type changes", () => {
      render(
        <StatusEffectEditor
          statusEffect={mockStatusEffect}
          onChange={mockOnChange}
        />,
      );

      // Find the first duration type select
      const typeSelects = screen.getAllByTestId("ant-select");
      const durationTypeSelect = typeSelects.find((select) =>
        select.closest('[data-testid="table-cell-0-0"]'),
      );

      expect(durationTypeSelect).toBeDefined();
      if (durationTypeSelect) {
        fireEvent.change(durationTypeSelect, {
          target: { value: StatusDurationType.Room },
        });

        expect(mockOnChange).toHaveBeenCalledWith({
          ...mockStatusEffect,
          durations: [
            { type: StatusDurationType.Room, value: 5.0 },
            { type: StatusDurationType.Logical, value: 3.0 },
          ],
        });
      }
    });

    it("handles duration value changes", () => {
      render(
        <StatusEffectEditor
          statusEffect={mockStatusEffect}
          onChange={mockOnChange}
        />,
      );

      // Find the first duration value input
      const valueInputs = screen.getAllByTestId("ant-input-number");
      const durationValueInput = valueInputs.find((input) =>
        input.closest('[data-testid="table-cell-0-1"]'),
      );

      expect(durationValueInput).toBeDefined();
      if (durationValueInput) {
        fireEvent.change(durationValueInput, { target: { value: "10" } });

        expect(mockOnChange).toHaveBeenCalledWith({
          ...mockStatusEffect,
          durations: [
            { type: StatusDurationType.Chrono, value: 10.0 },
            { type: StatusDurationType.Logical, value: 3.0 },
          ],
        });
      }
    });

    it("handles removing durations", () => {
      render(
        <StatusEffectEditor
          statusEffect={mockStatusEffect}
          onChange={mockOnChange}
        />,
      );

      // Find the first delete button
      const deleteButtons = screen.getAllByTestId("ant-button");
      const firstDeleteButton = deleteButtons.find((button) =>
        button.closest('[data-testid="table-cell-0-2"]'),
      );

      expect(firstDeleteButton).toBeDefined();
      if (firstDeleteButton) {
        fireEvent.click(firstDeleteButton);

        expect(mockOnChange).toHaveBeenCalledWith({
          ...mockStatusEffect,
          durations: [{ type: StatusDurationType.Logical, value: 3.0 }],
        });
      }
    });
  });

  describe("Scalers Management", () => {
    it("handles scalers changes", () => {
      render(
        <StatusEffectEditor
          statusEffect={mockStatusEffect}
          onChange={mockOnChange}
        />,
      );

      const addScalerButton = screen.getByTestId("add-scaler-btn");
      fireEvent.click(addScalerButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockStatusEffect,
        scalers: [...mockStatusEffect.scalers, { type: "Base", value: 1.0 }],
      });
    });

    it("displays correct scalers count", () => {
      render(
        <StatusEffectEditor
          statusEffect={mockStatusEffect}
          onChange={mockOnChange}
        />,
      );

      expect(screen.getByTestId("scalers-count")).toHaveTextContent("1");
    });
  });

  describe("Null/Undefined Handling", () => {
    it("handles null statusEffect gracefully", () => {
      render(
        <StatusEffectEditor
          statusEffect={null as unknown as StatusEffect}
          onChange={mockOnChange}
        />,
      );

      // Should still render without crashing
      expect(screen.getByTestId("target-mechanic-editor")).toBeInTheDocument();
      expect(screen.getByTestId("node-entity-reference")).toBeInTheDocument();
      expect(screen.getByTestId("node-table")).toBeInTheDocument();
      expect(screen.getByTestId("node-scalers")).toBeInTheDocument();
    });

    it("creates default values for null statusEffect", () => {
      render(
        <StatusEffectEditor
          statusEffect={null as unknown as StatusEffect}
          onChange={mockOnChange}
        />,
      );

      // Check default values are shown
      expect(screen.getByTestId("table-data-count")).toHaveTextContent("0");
      expect(screen.getByTestId("scalers-count")).toHaveTextContent("0");
    });

    it("handles undefined durations array", () => {
      const statusEffectWithoutDurations = {
        ...mockStatusEffect,
        durations: undefined,
      };

      render(
        <StatusEffectEditor
          statusEffect={statusEffectWithoutDurations as unknown as StatusEffect}
          onChange={mockOnChange}
        />,
      );

      expect(screen.getByTestId("table-data-count")).toHaveTextContent("0");
    });

    it("handles undefined scalers array", () => {
      const statusEffectWithoutScalers = {
        ...mockStatusEffect,
        scalers: undefined,
      };

      render(
        <StatusEffectEditor
          statusEffect={statusEffectWithoutScalers as unknown as StatusEffect}
          onChange={mockOnChange}
        />,
      );

      expect(screen.getByTestId("scalers-count")).toHaveTextContent("0");
    });

    it("handles null status reference", () => {
      const statusEffectWithoutStatus = {
        ...mockStatusEffect,
        status: null,
      };

      render(
        <StatusEffectEditor
          statusEffect={statusEffectWithoutStatus as unknown as StatusEffect}
          onChange={mockOnChange}
        />,
      );

      const statusInput = screen.getByTestId("entity-reference-input");
      expect(statusInput).toHaveValue("");
    });
  });

  describe("Edge Cases", () => {
    it("handles zero duration value correctly", () => {
      render(
        <StatusEffectEditor
          statusEffect={mockStatusEffect}
          onChange={mockOnChange}
        />,
      );

      const valueInputs = screen.getAllByTestId("ant-input-number");
      const firstValueInput = valueInputs.find((input) =>
        input.closest('[data-testid="table-cell-0-1"]'),
      );

      if (firstValueInput) {
        fireEvent.change(firstValueInput, { target: { value: "0" } });

        expect(mockOnChange).toHaveBeenCalledWith({
          ...mockStatusEffect,
          durations: [
            { type: StatusDurationType.Chrono, value: 0 },
            { type: StatusDurationType.Logical, value: 3.0 },
          ],
        });
      }
    });

    it("handles empty duration value (NaN) correctly", () => {
      render(
        <StatusEffectEditor
          statusEffect={mockStatusEffect}
          onChange={mockOnChange}
        />,
      );

      const valueInputs = screen.getAllByTestId("ant-input-number");
      const firstValueInput = valueInputs.find((input) =>
        input.closest('[data-testid="table-cell-0-1"]'),
      );

      if (firstValueInput) {
        fireEvent.change(firstValueInput, { target: { value: "" } });

        expect(mockOnChange).toHaveBeenCalledWith({
          ...mockStatusEffect,
          durations: [
            { type: StatusDurationType.Chrono, value: 0 },
            { type: StatusDurationType.Logical, value: 3.0 },
          ],
        });
      }
    });

    it("handles removing duration from single-item array", () => {
      const singleDurationStatusEffect = {
        ...mockStatusEffect,
        durations: [{ type: StatusDurationType.Chrono, value: 5.0 }],
      };

      render(
        <StatusEffectEditor
          statusEffect={singleDurationStatusEffect}
          onChange={mockOnChange}
        />,
      );

      const deleteButtons = screen.getAllByTestId("ant-button");
      const deleteButton = deleteButtons.find((button) =>
        button.closest('[data-testid="table-cell-0-2"]'),
      );

      if (deleteButton) {
        fireEvent.click(deleteButton);

        expect(mockOnChange).toHaveBeenCalledWith({
          ...singleDurationStatusEffect,
          durations: [],
        });
      }
    });
  });

  describe("Component Integration", () => {
    it("all subcomponents receive correct props", () => {
      render(
        <StatusEffectEditor
          statusEffect={mockStatusEffect}
          onChange={mockOnChange}
        />,
      );

      // TargetMechanicEditor props
      const targetSelect = screen.getByTestId("target-select");
      expect(targetSelect).toHaveValue("Enemy");

      const mechanicSelect = screen.getByTestId("mechanic-select");
      expect(mechanicSelect).toHaveValue("Self");

      // NodeEntityReference props
      const statusInput = screen.getByTestId("entity-reference-input");
      expect(statusInput).toHaveValue("test-status");

      // NodeTable props
      expect(screen.getByText("Durations")).toBeInTheDocument();

      // NodeScalers props
      expect(screen.getByText("Status Effect Scalers")).toBeInTheDocument();
    });
  });
});
