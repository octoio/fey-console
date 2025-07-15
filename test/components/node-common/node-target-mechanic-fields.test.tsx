/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, beforeEach } from "vitest";
import { NodeTargetMechanicFields } from "@components/node-common/node-target-mechanic-fields";
import {
  SkillEffectTargetMechanicType,
  SkillEffectTargetMechanicTeam,
  SkillEffectTargetMechanicCircle,
  SkillEffectTargetMechanicRectangle,
  CharacterTeam,
} from "@models/skill.types";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock styled components
vi.mock("@components/common/styled-components", () => ({
  FullWidthSelect: ({ children, value, onChange, size, ...props }: any) => (
    <select
      data-testid="full-width-select"
      data-size={size}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      {...props}
    >
      {children}
    </select>
  ),
  FullWidthInputNumber: ({
    value,
    onChange,
    min,
    step,
    size,
    ...props
  }: any) => (
    <input
      data-testid="full-width-input-number"
      type="number"
      data-size={size}
      value={value || ""}
      onChange={(e) => onChange?.(parseFloat(e.target.value) || 0)}
      min={min}
      step={step}
      {...props}
    />
  ),
}));

// Mock antd Select and Option
vi.mock("antd", () => ({
  Select: {
    Option: ({ children, value, ...props }: any) => (
      <option value={value} {...props}>
        {children}
      </option>
    ),
  },
}));

// Mock NodeField
vi.mock("@components/node-common/node-field", () => ({
  NodeField: ({ label, children }: any) => (
    <div data-testid="node-field">
      <label data-testid="field-label">{label}</label>
      {children}
    </div>
  ),
}));

// Mock NodeInteractive
vi.mock("@components/node-common/node-interactive", () => ({
  NodeInteractive: ({ children }: any) => (
    <div data-testid="node-interactive">{children}</div>
  ),
}));

describe("NodeTargetMechanicFields", () => {
  let mockOnUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnUpdate = vi.fn();
  });

  describe("Component Rendering", () => {
    it("returns null when mechanic is null", () => {
      const { container } = render(
        <NodeTargetMechanicFields
          mechanic={null as any}
          onUpdate={mockOnUpdate}
        />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("returns null when mechanic is undefined", () => {
      const { container } = render(
        <NodeTargetMechanicFields
          mechanic={undefined as any}
          onUpdate={mockOnUpdate}
        />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("returns null for unknown mechanic type", () => {
      const unknownMechanic = {
        type: "UnknownType" as any,
      };

      const { container } = render(
        <NodeTargetMechanicFields
          mechanic={unknownMechanic}
          onUpdate={mockOnUpdate}
        />,
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Team Mechanic", () => {
    let teamMechanic: SkillEffectTargetMechanicTeam;

    beforeEach(() => {
      teamMechanic = {
        type: SkillEffectTargetMechanicType.Team,
        team: CharacterTeam.Ally,
      };
    });

    it("renders team selection for Team mechanic", () => {
      render(
        <NodeTargetMechanicFields
          mechanic={teamMechanic}
          onUpdate={mockOnUpdate}
        />,
      );

      expect(screen.getByTestId("node-field")).toBeInTheDocument();
      expect(screen.getByTestId("field-label")).toHaveTextContent("Team");
      expect(screen.getByTestId("node-interactive")).toBeInTheDocument();
      expect(screen.getByTestId("full-width-select")).toBeInTheDocument();
    });

    it("displays correct initial team value", () => {
      render(
        <NodeTargetMechanicFields
          mechanic={teamMechanic}
          onUpdate={mockOnUpdate}
        />,
      );

      const select = screen.getByTestId("full-width-select");
      expect(select).toHaveValue(CharacterTeam.Ally);
    });

    it("renders all team options", () => {
      render(
        <NodeTargetMechanicFields
          mechanic={teamMechanic}
          onUpdate={mockOnUpdate}
        />,
      );

      // Check that all teams are available as options
      const options = screen.getAllByRole("option");
      expect(options.length).toBe(3); // Ally, Enemy, Neutral

      // Check for specific option text content
      expect(screen.getByText("Ally")).toBeInTheDocument();
      expect(screen.getByText("Enemy")).toBeInTheDocument();
      expect(screen.getByText("Neutral")).toBeInTheDocument();
    });

    it("handles team change", () => {
      render(
        <NodeTargetMechanicFields
          mechanic={teamMechanic}
          onUpdate={mockOnUpdate}
        />,
      );

      const select = screen.getByTestId("full-width-select");
      fireEvent.change(select, { target: { value: CharacterTeam.Enemy } });

      expect(mockOnUpdate).toHaveBeenCalledWith({
        ...teamMechanic,
        team: CharacterTeam.Enemy,
      });
    });

    it("applies correct size to select", () => {
      render(
        <NodeTargetMechanicFields
          mechanic={teamMechanic}
          onUpdate={mockOnUpdate}
        />,
      );

      const select = screen.getByTestId("full-width-select");
      expect(select).toHaveAttribute("data-size", "small");
    });
  });

  describe("Circle Mechanic", () => {
    let circleMechanic: SkillEffectTargetMechanicCircle;

    beforeEach(() => {
      circleMechanic = {
        type: SkillEffectTargetMechanicType.Circle,
        hit_count: 5,
        radius: 2.5,
      };
    });

    it("renders hit count and radius fields for Circle mechanic", () => {
      render(
        <NodeTargetMechanicFields
          mechanic={circleMechanic}
          onUpdate={mockOnUpdate}
        />,
      );

      const labels = screen.getAllByTestId("field-label");
      expect(labels[0]).toHaveTextContent("Hit Count");
      expect(labels[1]).toHaveTextContent("Radius");

      const inputs = screen.getAllByTestId("full-width-input-number");
      expect(inputs).toHaveLength(2);
    });

    it("displays correct initial values for Circle mechanic", () => {
      render(
        <NodeTargetMechanicFields
          mechanic={circleMechanic}
          onUpdate={mockOnUpdate}
        />,
      );

      const inputs = screen.getAllByTestId("full-width-input-number");
      expect(inputs[0]).toHaveValue(5); // hit_count
      expect(inputs[1]).toHaveValue(2.5); // radius
    });

    it("handles hit count change", () => {
      render(
        <NodeTargetMechanicFields
          mechanic={circleMechanic}
          onUpdate={mockOnUpdate}
        />,
      );

      const inputs = screen.getAllByTestId("full-width-input-number");
      const hitCountInput = inputs[0];

      fireEvent.change(hitCountInput, { target: { value: "10" } });

      expect(mockOnUpdate).toHaveBeenCalledWith({
        ...circleMechanic,
        hit_count: 10,
      });
    });

    it("handles radius change", () => {
      render(
        <NodeTargetMechanicFields
          mechanic={circleMechanic}
          onUpdate={mockOnUpdate}
        />,
      );

      const inputs = screen.getAllByTestId("full-width-input-number");
      const radiusInput = inputs[1];

      fireEvent.change(radiusInput, { target: { value: "5.0" } });

      expect(mockOnUpdate).toHaveBeenCalledWith({
        ...circleMechanic,
        radius: 5.0,
      });
    });

    it("handles zero hit count correctly", () => {
      render(
        <NodeTargetMechanicFields
          mechanic={circleMechanic}
          onUpdate={mockOnUpdate}
        />,
      );

      const inputs = screen.getAllByTestId("full-width-input-number");
      const hitCountInput = inputs[0];

      fireEvent.change(hitCountInput, { target: { value: "0" } });

      expect(mockOnUpdate).toHaveBeenCalledWith({
        ...circleMechanic,
        hit_count: 1, // Should default to 1
      });
    });

    it("handles zero radius correctly", () => {
      render(
        <NodeTargetMechanicFields
          mechanic={circleMechanic}
          onUpdate={mockOnUpdate}
        />,
      );

      const inputs = screen.getAllByTestId("full-width-input-number");
      const radiusInput = inputs[1];

      fireEvent.change(radiusInput, { target: { value: "0" } });

      expect(mockOnUpdate).toHaveBeenCalledWith({
        ...circleMechanic,
        radius: 0,
      });
    });

    it("applies correct attributes to Circle inputs", () => {
      render(
        <NodeTargetMechanicFields
          mechanic={circleMechanic}
          onUpdate={mockOnUpdate}
        />,
      );

      const inputs = screen.getAllByTestId("full-width-input-number");

      // Hit count input
      expect(inputs[0]).toHaveAttribute("min", "1");
      expect(inputs[0]).toHaveAttribute("data-size", "small");

      // Radius input
      expect(inputs[1]).toHaveAttribute("min", "0");
      expect(inputs[1]).toHaveAttribute("step", "0.5");
      expect(inputs[1]).toHaveAttribute("data-size", "small");
    });
  });

  describe("Rectangle Mechanic", () => {
    let rectangleMechanic: SkillEffectTargetMechanicRectangle;

    beforeEach(() => {
      rectangleMechanic = {
        type: SkillEffectTargetMechanicType.Rectangle,
        hit_count: 3,
        width: 4.0,
        height: 6.0,
      };
    });

    it("renders hit count, width, and height fields for Rectangle mechanic", () => {
      render(
        <NodeTargetMechanicFields
          mechanic={rectangleMechanic}
          onUpdate={mockOnUpdate}
        />,
      );

      const labels = screen.getAllByTestId("field-label");
      expect(labels[0]).toHaveTextContent("Hit Count");
      expect(labels[1]).toHaveTextContent("Width");
      expect(labels[2]).toHaveTextContent("Height");

      const inputs = screen.getAllByTestId("full-width-input-number");
      expect(inputs).toHaveLength(3);
    });

    it("displays correct initial values for Rectangle mechanic", () => {
      render(
        <NodeTargetMechanicFields
          mechanic={rectangleMechanic}
          onUpdate={mockOnUpdate}
        />,
      );

      const inputs = screen.getAllByTestId("full-width-input-number");
      expect(inputs[0]).toHaveValue(3); // hit_count
      expect(inputs[1]).toHaveValue(4.0); // width
      expect(inputs[2]).toHaveValue(6.0); // height
    });

    it("handles hit count change", () => {
      render(
        <NodeTargetMechanicFields
          mechanic={rectangleMechanic}
          onUpdate={mockOnUpdate}
        />,
      );

      const inputs = screen.getAllByTestId("full-width-input-number");
      const hitCountInput = inputs[0];

      fireEvent.change(hitCountInput, { target: { value: "8" } });

      expect(mockOnUpdate).toHaveBeenCalledWith({
        ...rectangleMechanic,
        hit_count: 8,
      });
    });

    it("handles width change", () => {
      render(
        <NodeTargetMechanicFields
          mechanic={rectangleMechanic}
          onUpdate={mockOnUpdate}
        />,
      );

      const inputs = screen.getAllByTestId("full-width-input-number");
      const widthInput = inputs[1];

      fireEvent.change(widthInput, { target: { value: "7.5" } });

      expect(mockOnUpdate).toHaveBeenCalledWith({
        ...rectangleMechanic,
        width: 7.5,
      });
    });

    it("handles height change", () => {
      render(
        <NodeTargetMechanicFields
          mechanic={rectangleMechanic}
          onUpdate={mockOnUpdate}
        />,
      );

      const inputs = screen.getAllByTestId("full-width-input-number");
      const heightInput = inputs[2];

      fireEvent.change(heightInput, { target: { value: "9.0" } });

      expect(mockOnUpdate).toHaveBeenCalledWith({
        ...rectangleMechanic,
        height: 9.0,
      });
    });

    it("handles zero values correctly", () => {
      render(
        <NodeTargetMechanicFields
          mechanic={rectangleMechanic}
          onUpdate={mockOnUpdate}
        />,
      );

      const inputs = screen.getAllByTestId("full-width-input-number");

      // Test hit count zero -> defaults to 1
      fireEvent.change(inputs[0], { target: { value: "0" } });
      expect(mockOnUpdate).toHaveBeenCalledWith({
        ...rectangleMechanic,
        hit_count: 1,
      });

      // Test width zero -> stays 0
      fireEvent.change(inputs[1], { target: { value: "0" } });
      expect(mockOnUpdate).toHaveBeenCalledWith({
        ...rectangleMechanic,
        width: 0,
      });

      // Test height zero -> stays 0
      fireEvent.change(inputs[2], { target: { value: "0" } });
      expect(mockOnUpdate).toHaveBeenCalledWith({
        ...rectangleMechanic,
        height: 0,
      });
    });

    it("applies correct attributes to Rectangle inputs", () => {
      render(
        <NodeTargetMechanicFields
          mechanic={rectangleMechanic}
          onUpdate={mockOnUpdate}
        />,
      );

      const inputs = screen.getAllByTestId("full-width-input-number");

      // Hit count input
      expect(inputs[0]).toHaveAttribute("min", "1");
      expect(inputs[0]).toHaveAttribute("data-size", "small");

      // Width input
      expect(inputs[1]).toHaveAttribute("min", "0");
      expect(inputs[1]).toHaveAttribute("step", "0.5");
      expect(inputs[1]).toHaveAttribute("data-size", "small");

      // Height input
      expect(inputs[2]).toHaveAttribute("min", "0");
      expect(inputs[2]).toHaveAttribute("step", "0.5");
      expect(inputs[2]).toHaveAttribute("data-size", "small");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty/NaN values correctly for Circle mechanic", () => {
      const circleMechanic: SkillEffectTargetMechanicCircle = {
        type: SkillEffectTargetMechanicType.Circle,
        hit_count: 1,
        radius: 1.0,
      };

      render(
        <NodeTargetMechanicFields
          mechanic={circleMechanic}
          onUpdate={mockOnUpdate}
        />,
      );

      const inputs = screen.getAllByTestId("full-width-input-number");

      // Test empty string for hit_count
      fireEvent.change(inputs[0], { target: { value: "" } });
      expect(mockOnUpdate).toHaveBeenCalledWith({
        ...circleMechanic,
        hit_count: 1, // Defaults to 1 for hit_count
      });

      // Test empty string for radius
      fireEvent.change(inputs[1], { target: { value: "" } });
      expect(mockOnUpdate).toHaveBeenCalledWith({
        ...circleMechanic,
        radius: 0, // Defaults to 0 for radius
      });
    });

    it("handles empty/NaN values correctly for Rectangle mechanic", () => {
      const rectangleMechanic: SkillEffectTargetMechanicRectangle = {
        type: SkillEffectTargetMechanicType.Rectangle,
        hit_count: 1,
        width: 1.0,
        height: 1.0,
      };

      render(
        <NodeTargetMechanicFields
          mechanic={rectangleMechanic}
          onUpdate={mockOnUpdate}
        />,
      );

      const inputs = screen.getAllByTestId("full-width-input-number");

      // Test empty string for hit_count
      fireEvent.change(inputs[0], { target: { value: "" } });
      expect(mockOnUpdate).toHaveBeenCalledWith({
        ...rectangleMechanic,
        hit_count: 1, // Defaults to 1
      });

      // Test empty string for width
      fireEvent.change(inputs[1], { target: { value: "" } });
      expect(mockOnUpdate).toHaveBeenCalledWith({
        ...rectangleMechanic,
        width: 0, // Defaults to 0
      });

      // Test empty string for height
      fireEvent.change(inputs[2], { target: { value: "" } });
      expect(mockOnUpdate).toHaveBeenCalledWith({
        ...rectangleMechanic,
        height: 0, // Defaults to 0
      });
    });

    it("preserves other properties when updating specific values", () => {
      const complexCircleMechanic = {
        type: SkillEffectTargetMechanicType.Circle,
        hit_count: 5,
        radius: 2.5,
        extra_property: "should_be_preserved",
      } as any;

      render(
        <NodeTargetMechanicFields
          mechanic={complexCircleMechanic}
          onUpdate={mockOnUpdate}
        />,
      );

      const inputs = screen.getAllByTestId("full-width-input-number");
      fireEvent.change(inputs[0], { target: { value: "10" } });

      expect(mockOnUpdate).toHaveBeenCalledWith({
        type: SkillEffectTargetMechanicType.Circle,
        hit_count: 10,
        radius: 2.5,
        extra_property: "should_be_preserved",
      });
    });
  });

  describe("Component Integration", () => {
    it("renders multiple NodeField and NodeInteractive components correctly", () => {
      const rectangleMechanic: SkillEffectTargetMechanicRectangle = {
        type: SkillEffectTargetMechanicType.Rectangle,
        hit_count: 1,
        width: 1.0,
        height: 1.0,
      };

      render(
        <NodeTargetMechanicFields
          mechanic={rectangleMechanic}
          onUpdate={mockOnUpdate}
        />,
      );

      expect(screen.getAllByTestId("node-field")).toHaveLength(3);
      expect(screen.getAllByTestId("node-interactive")).toHaveLength(3);
      expect(screen.getAllByTestId("field-label")).toHaveLength(3);
    });

    it("calls onUpdate with correct mechanic object spread", () => {
      const teamMechanic: SkillEffectTargetMechanicTeam = {
        type: SkillEffectTargetMechanicType.Team,
        team: CharacterTeam.Ally,
      };

      render(
        <NodeTargetMechanicFields
          mechanic={teamMechanic}
          onUpdate={mockOnUpdate}
        />,
      );

      const select = screen.getByTestId("full-width-select");
      fireEvent.change(select, { target: { value: CharacterTeam.Enemy } });

      expect(mockOnUpdate).toHaveBeenCalledWith({
        type: SkillEffectTargetMechanicType.Team,
        team: CharacterTeam.Enemy,
      });

      // Verify the original object wasn't mutated
      expect(teamMechanic.team).toBe(CharacterTeam.Ally);
    });
  });
});
