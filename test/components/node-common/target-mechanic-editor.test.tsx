import { describe, it, expect, vi, beforeEach } from "vitest";
import { TargetMechanicEditor } from "@components/node-common/target-mechanic-editor";
import {
  SkillEffectTarget,
  SkillEffectTargetMechanic,
  SkillEffectTargetMechanicType,
} from "@models/skill.types";
import { render, screen } from "@testing-library/react";

// Mock the styled-components
vi.mock("@components/common/styled-components", () => ({
  FullWidthSelect: vi.fn(({ children, value, size, ...props }) => (
    <div
      data-testid="full-width-select"
      data-value={value}
      data-size={size}
      {...props}
    >
      {children}
    </div>
  )),
  HeaderContainer: vi.fn(({ children, ...props }) => (
    <div data-testid="header-container" {...props}>
      {children}
    </div>
  )),
}));

// Mock utility function
vi.mock("@utils/mechanic", () => ({
  mapTargetMechanicChange: vi.fn((type: SkillEffectTargetMechanicType) => ({
    type,
  })),
}));

// Mock child components
vi.mock("@components/node-common", () => ({
  NodeField: vi.fn(({ label, children }) => (
    <div data-testid="node-field" data-label={label}>
      <span>{label}</span>
      <div style={{ marginTop: "4px" }}>{children}</div>
    </div>
  )),
  NodeInteractive: vi.fn(({ children }) => (
    <div data-testid="node-interactive" className="nodrag">
      {children}
    </div>
  )),
  NodeTargetMechanicFields: vi.fn(({ mechanic, onUpdate }) => (
    <div
      data-testid="node-target-mechanic-fields"
      data-mechanic={JSON.stringify(mechanic)}
      onClick={() =>
        onUpdate && onUpdate({ type: SkillEffectTargetMechanicType.Self })
      }
    >
      Mechanic Fields
    </div>
  )),
}));

// Mock Ant Design components
vi.mock("antd", () => ({
  Select: {
    Option: vi.fn(({ children, value, ...props }) => (
      <option value={value} {...props}>
        {children}
      </option>
    )),
  },
}));

describe("TargetMechanicEditor", () => {
  const defaultProps = {
    target: SkillEffectTarget.Ally,
    targetMechanic: {
      type: SkillEffectTargetMechanicType.Self,
    } as SkillEffectTargetMechanic,
    onTargetChange: vi.fn(),
    onMechanicChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render target field with label", () => {
      render(<TargetMechanicEditor {...defaultProps} />);

      const targetField = screen.getAllByTestId("node-field")[0];
      expect(targetField).toBeInTheDocument();
      expect(targetField).toHaveAttribute("data-label", "Target");
      expect(screen.getByText("Target")).toBeInTheDocument();
    });

    it("should render target mechanic field with label", () => {
      render(<TargetMechanicEditor {...defaultProps} />);

      const fields = screen.getAllByTestId("node-field");
      expect(fields).toHaveLength(2);
      expect(fields[1]).toHaveAttribute("data-label", "Target Mechanic");
      expect(screen.getByText("Target Mechanic")).toBeInTheDocument();
    });

    it("should render NodeTargetMechanicFields component", () => {
      render(<TargetMechanicEditor {...defaultProps} />);

      expect(
        screen.getByTestId("node-target-mechanic-fields"),
      ).toBeInTheDocument();
      expect(screen.getByText("Mechanic Fields")).toBeInTheDocument();
    });

    it("should display current target value", () => {
      render(<TargetMechanicEditor {...defaultProps} />);

      const selects = screen.getAllByTestId("full-width-select");
      expect(selects[0]).toHaveAttribute("data-value", SkillEffectTarget.Ally);
    });

    it("should display current target mechanic type", () => {
      render(<TargetMechanicEditor {...defaultProps} />);

      const selects = screen.getAllByTestId("full-width-select");
      expect(selects[1]).toHaveAttribute(
        "data-value",
        SkillEffectTargetMechanicType.Self,
      );
    });
  });

  describe("Component Structure", () => {
    it("should wrap selects in NodeInteractive components", () => {
      render(<TargetMechanicEditor {...defaultProps} />);

      const interactiveComponents = screen.getAllByTestId("node-interactive");
      expect(interactiveComponents).toHaveLength(2);
    });

    it("should render correct number of select components", () => {
      render(<TargetMechanicEditor {...defaultProps} />);

      const selects = screen.getAllByTestId("full-width-select");
      expect(selects).toHaveLength(2);
    });
  });

  describe("Target Mechanic Integration", () => {
    it("should pass mechanic to NodeTargetMechanicFields", () => {
      const customMechanic = {
        type: SkillEffectTargetMechanicType.Circle,
      };

      render(
        <TargetMechanicEditor
          {...defaultProps}
          targetMechanic={customMechanic}
        />,
      );

      const mechanicFields = screen.getByTestId("node-target-mechanic-fields");
      expect(mechanicFields).toHaveAttribute(
        "data-mechanic",
        JSON.stringify(customMechanic),
      );
    });

    it("should handle empty target mechanic gracefully", () => {
      const emptyMechanic = { type: SkillEffectTargetMechanicType.Self };
      render(
        <TargetMechanicEditor
          {...defaultProps}
          targetMechanic={emptyMechanic}
        />,
      );

      const mechanicSelect = screen.getAllByTestId("full-width-select")[1];
      expect(mechanicSelect).toHaveAttribute(
        "data-value",
        SkillEffectTargetMechanicType.Self,
      );
    });
  });

  describe("Component Props", () => {
    it("should have correct display name", () => {
      expect(TargetMechanicEditor.displayName).toBe("TargetMechanicEditor");
    });

    it("should handle different target types", () => {
      render(
        <TargetMechanicEditor
          {...defaultProps}
          target={SkillEffectTarget.Enemy}
        />,
      );

      const targetSelect = screen.getAllByTestId("full-width-select")[0];
      expect(targetSelect).toHaveAttribute(
        "data-value",
        SkillEffectTarget.Enemy,
      );
    });

    it("should handle different mechanic types", () => {
      const rectangleMechanic = {
        type: SkillEffectTargetMechanicType.Rectangle,
      };

      render(
        <TargetMechanicEditor
          {...defaultProps}
          targetMechanic={rectangleMechanic}
        />,
      );

      const mechanicSelect = screen.getAllByTestId("full-width-select")[1];
      expect(mechanicSelect).toHaveAttribute(
        "data-value",
        SkillEffectTargetMechanicType.Rectangle,
      );
    });
  });

  describe("Size Configuration", () => {
    it("should set correct size for select components", () => {
      render(<TargetMechanicEditor {...defaultProps} />);

      const selects = screen.getAllByTestId("full-width-select");
      selects.forEach((select) => {
        expect(select).toHaveAttribute("data-size", "small");
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined mechanic type", () => {
      const mechanicWithoutType = {} as SkillEffectTargetMechanic;
      render(
        <TargetMechanicEditor
          {...defaultProps}
          targetMechanic={mechanicWithoutType}
        />,
      );

      const mechanicSelect = screen.getAllByTestId("full-width-select")[1];
      // When type is undefined, the data-value attribute will be null/undefined
      expect(mechanicSelect.getAttribute("data-value")).toBe(null);
    });

    it("should render with all required props", () => {
      expect(() => {
        render(<TargetMechanicEditor {...defaultProps} />);
      }).not.toThrow();
    });
  });
});
