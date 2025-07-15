import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { SummonNode } from "@components/nodetypes/summon-node";
import { SkillActionNodeType } from "@models/skill.types";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock functions
const mockUpdateNodeData = vi.fn();
const mockOnChange = vi.fn();

vi.mock("@utils/node-operations", () => ({
  useNodeOperations: vi.fn(() => ({
    updateNodeData: mockUpdateNodeData,
    handleNameChange: vi.fn(),
    handleNodeDelete: vi.fn(),
  })),
  createNodeDataHandler: vi.fn(() => ({
    data: { key: "test-character" },
    onChange: mockOnChange,
  })),
}));

// Mock node-common components
vi.mock("@components/node-common", () => ({
  createNodeComponent: ({
    nodeType,
    backgroundColor,
    borderColor,
    renderContent,
  }: {
    nodeType: string;
    backgroundColor: string;
    borderColor: string;
    renderContent: (props: {
      id: string;
      data: Record<string, unknown>;
    }) => React.ReactNode;
  }) => {
    const MockedComponent = (props: {
      id: string;
      data: Record<string, unknown>;
    }) => (
      <div data-testid="summon-node" data-node-type={nodeType}>
        <div
          data-testid="node-colors"
          data-bg={backgroundColor}
          data-border={borderColor}
        >
          {renderContent(props)}
        </div>
      </div>
    );
    return MockedComponent;
  },
  NODE_COLORS: {
    PALE_GREEN_BG: "#f6ffed",
    LIME_BORDER: "#73d13d",
  },
  NodeEntityReference: vi.fn(
    ({ entityType, value, onChange, label, placeholder }) => (
      <div data-testid="node-entity-reference">
        <label>{label}</label>
        <input
          data-testid="entity-reference-input"
          placeholder={placeholder}
          value={value || ""}
          onChange={(e) => onChange({ key: e.target.value })}
        />
        <div data-testid="entity-type">{entityType}</div>
      </div>
    ),
  ),
  NodeField: vi.fn(({ label, children }) => (
    <div data-testid="node-field">
      <label>{label}</label>
      {children}
    </div>
  )),
  NodeInteractive: vi.fn(({ children }) => (
    <div data-testid="node-interactive">{children}</div>
  )),
}));

describe("SummonNode", () => {
  const mockProps = {
    id: "summon-1",
    data: {
      summon_entity: {
        key: "warrior-character",
        name: "Warrior",
      },
      position_offset: {
        x: 2.5,
        y: 0,
        z: 1.0,
      },
    },
    type: SkillActionNodeType.Summon,
    position: { x: 0, y: 0 },
    selected: false,
    xPos: 0,
    yPos: 0,
    zIndex: 0,
    isConnectable: true,
    dragging: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("should render summon node with entity reference and position inputs", () => {
      render(<SummonNode {...mockProps} />);

      expect(screen.getByTestId("node-entity-reference")).toBeInTheDocument();
      expect(screen.getByText("Character to Summon")).toBeInTheDocument();
      expect(screen.getByText("Position Offset")).toBeInTheDocument();
    });

    it("should display current entity reference", () => {
      render(<SummonNode {...mockProps} />);

      const entityInput = screen.getByTestId("entity-reference-input");
      expect(entityInput).toHaveValue("warrior-character");
    });

    it("should show Character entity type", () => {
      render(<SummonNode {...mockProps} />);

      expect(screen.getByTestId("entity-type")).toHaveTextContent("Character");
    });

    it("should render position offset inputs", () => {
      render(<SummonNode {...mockProps} />);

      const xInput = screen.getByDisplayValue("2.5");
      const yInput = screen.getByDisplayValue("0.0");
      const zInput = screen.getByDisplayValue("1.0");

      expect(xInput).toBeInTheDocument();
      expect(yInput).toBeInTheDocument();
      expect(zInput).toBeInTheDocument();
    });

    it("should render with default values when data is missing", () => {
      const emptyProps = {
        id: "summon-1",
        data: {},
        type: SkillActionNodeType.Summon,
        position: { x: 0, y: 0 },
        selected: false,
        xPos: 0,
        yPos: 0,
        zIndex: 0,
        isConnectable: true,
        dragging: false,
      };

      render(<SummonNode {...emptyProps} />);

      expect(screen.getByTestId("node-entity-reference")).toBeInTheDocument();
      expect(screen.getByText("Position Offset")).toBeInTheDocument();
    });
  });

  describe("Entity Reference Interactions", () => {
    it("should handle character entity changes", async () => {
      render(<SummonNode {...mockProps} />);

      const entityInput = screen.getByTestId("entity-reference-input");
      fireEvent.change(entityInput, { target: { value: "mage-character" } });

      expect(mockOnChange).toHaveBeenCalledWith({ key: "mage-character" });
    });

    it("should pass correct entity type to NodeEntityReference", () => {
      render(<SummonNode {...mockProps} />);

      expect(screen.getByTestId("entity-type")).toHaveTextContent("Character");
    });

    it("should display correct placeholder text", () => {
      render(<SummonNode {...mockProps} />);

      const entityInput = screen.getByTestId("entity-reference-input");
      expect(entityInput).toHaveAttribute("placeholder", "Select character");
    });

    it("should handle empty entity reference", () => {
      const propsWithoutEntity = {
        id: "summon-1",
        data: {
          summon_entity: null,
        },
        type: SkillActionNodeType.Summon,
        position: { x: 0, y: 0 },
        selected: false,
        xPos: 0,
        yPos: 0,
        zIndex: 0,
        isConnectable: true,
        dragging: false,
      };

      render(<SummonNode {...propsWithoutEntity} />);

      const entityInput = screen.getByTestId("entity-reference-input");
      expect(entityInput).toHaveValue("");
    });
  });

  describe("Position Offset Interactions", () => {
    it("should update X position offset", async () => {
      render(<SummonNode {...mockProps} />);

      const xInput = screen.getByDisplayValue("2.5");
      fireEvent.change(xInput, { target: { value: "5" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith({
          position_offset: { x: 5, y: 0, z: 1.0 },
        });
      });
    });

    it("should update Y position offset", async () => {
      render(<SummonNode {...mockProps} />);

      const yInput = screen.getByDisplayValue("0.0");
      fireEvent.change(yInput, { target: { value: "2" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith({
          position_offset: { x: 2.5, y: 2, z: 1.0 },
        });
      });
    });

    it("should update Z position offset", async () => {
      render(<SummonNode {...mockProps} />);

      const zInput = screen.getByDisplayValue("1.0");
      fireEvent.change(zInput, { target: { value: "3" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith({
          position_offset: { x: 2.5, y: 0, z: 3 },
        });
      });
    });

    it("should handle null values and default to 0", async () => {
      render(<SummonNode {...mockProps} />);

      const xInput = screen.getByDisplayValue("2.5");
      fireEvent.change(xInput, { target: { value: "" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith({
          position_offset: { x: 0, y: 0, z: 1.0 },
        });
      });
    });

    it("should preserve other position values when updating one axis", async () => {
      render(<SummonNode {...mockProps} />);

      const yInput = screen.getByDisplayValue("0.0");
      fireEvent.change(yInput, { target: { value: "10" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith({
          position_offset: { x: 2.5, y: 10, z: 1.0 },
        });
      });
    });

    it("should handle missing position_offset data", async () => {
      const propsWithoutPosition = {
        id: "summon-1",
        data: {
          summon_entity: { key: "test" },
        },
        type: SkillActionNodeType.Summon,
        position: { x: 0, y: 0 },
        selected: false,
        xPos: 0,
        yPos: 0,
        zIndex: 0,
        isConnectable: true,
        dragging: false,
      };

      render(<SummonNode {...propsWithoutPosition} />);

      // Find X input by its addonBefore text and parent structure
      const positionSection = screen
        .getByText("Position Offset")
        .closest("div");
      expect(positionSection).toBeInTheDocument();

      // Get all inputs with "0.0" value and pick the first one (X axis)
      const inputs = screen.getAllByDisplayValue("0.0");
      expect(inputs).toHaveLength(3); // X, Y, Z

      const xInput = inputs[0]; // First input should be X
      fireEvent.change(xInput, { target: { value: "5" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith(
          expect.objectContaining({
            position_offset: expect.objectContaining({ x: 5 }),
          }),
        );
      });
    });
  });

  describe("Node Properties", () => {
    it("should have correct node type", () => {
      render(<SummonNode {...mockProps} />);

      expect(screen.getByTestId("summon-node")).toHaveAttribute(
        "data-node-type",
        SkillActionNodeType.Summon,
      );
    });

    it("should have correct styling configuration", () => {
      render(<SummonNode {...mockProps} />);

      const nodeColors = screen.getByTestId("node-colors");
      expect(nodeColors).toHaveAttribute("data-bg", "#f6ffed");
      expect(nodeColors).toHaveAttribute("data-border", "#73d13d");
    });
  });

  describe("Error Handling", () => {
    it("should handle missing data gracefully", () => {
      const emptyProps = {
        id: "summon-1",
        data: {},
        type: SkillActionNodeType.Summon,
        position: { x: 0, y: 0 },
        selected: false,
        xPos: 0,
        yPos: 0,
        zIndex: 0,
        isConnectable: true,
        dragging: false,
      };

      render(<SummonNode {...emptyProps} />);

      // Should render without crashing
      expect(screen.getByTestId("entity-reference-input")).toBeInTheDocument();
      expect(screen.getAllByDisplayValue("0.0")).toHaveLength(3); // X, Y, Z position inputs
    });
  });

  describe("Integration", () => {
    it("should handle multiple position updates", async () => {
      render(<SummonNode {...mockProps} />);

      const xInput = screen.getByDisplayValue("2.5");
      const yInput = screen.getByDisplayValue("0.0");

      fireEvent.change(xInput, { target: { value: "5" } });
      fireEvent.change(yInput, { target: { value: "3" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledTimes(2);
      });
    });

    it("should maintain position offset structure", async () => {
      const propsWithPartialPosition = {
        id: "summon-1",
        data: {
          position_offset: { x: 1 }, // Missing y and z
        },
        type: SkillActionNodeType.Summon,
        position: { x: 0, y: 0 },
        selected: false,
        xPos: 0,
        yPos: 0,
        zIndex: 0,
        isConnectable: true,
        dragging: false,
      };

      render(<SummonNode {...propsWithPartialPosition} />);

      // Get all inputs with "0.0" value (Y and Z should be 0.0, X should be 1.0)
      const zeroInputs = screen.getAllByDisplayValue("0.0");
      expect(zeroInputs).toHaveLength(2); // Y and Z

      const yInput = zeroInputs[0]; // First 0.0 input should be Y
      fireEvent.change(yInput, { target: { value: "2" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith(
          expect.objectContaining({
            position_offset: expect.objectContaining({ x: 1, y: 2 }),
          }),
        );
      });
    });

    it("should work with step increment for position inputs", () => {
      render(<SummonNode {...mockProps} />);

      // Check that inputs have step attribute for decimal values
      const inputs = screen.getAllByRole("spinbutton");
      inputs.forEach((input) => {
        expect(input).toHaveAttribute("step", "0.5");
      });
    });
  });
});
