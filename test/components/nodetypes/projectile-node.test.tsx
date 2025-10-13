import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ProjectileNode } from "@components/nodetypes/projectile-node";
import { EntityType } from "@models/common.types";
import { ProjectileSpawnPositionType } from "@models/skill.types";
import { useSkillStore } from "@store/skill.store";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock functions
const mockUpdateNodeData = vi.fn();
const mockOnChange = vi.fn();

vi.mock("@utils/node-operations", () => ({
  useNodeOperations: vi.fn(() => ({
    updateNodeData: mockUpdateNodeData,
  })),
  createNodeDataHandler: vi.fn(() => ({
    data: { key: "test-projectile" },
    onChange: mockOnChange,
  })),
}));

// Mock antd components
vi.mock("antd", () => ({
  InputNumber: ({
    value,
    onChange,
    step,
    size,
    addonBefore,
  }: {
    value: number;
    onChange: (val: number | null) => void;
    step: number;
    size: string;
    addonBefore: string;
  }) => (
    <input
      data-testid={`input-${addonBefore.toLowerCase()}`}
      type="number"
      value={value || 0}
      onChange={(e) =>
        onChange(e.target.value ? parseFloat(e.target.value) : null)
      }
      step={step}
      data-size={size}
      data-addon-before={addonBefore}
    />
  ),
  Select: ({
    value,
    onChange,
    options,
    size,
  }: {
    value: string;
    onChange: (val: string) => void;
    options: Array<{ label: string; value: string }>;
    size: string;
  }) => (
    <select
      data-testid="spawn-position-type-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-size={size}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
  Space: ({ children, direction }: any) => (
    <div data-testid="space" data-direction={direction}>
      {children}
    </div>
  ),
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
    renderContent: (props: { id: string; data: Record<string, unknown> }) => React.ReactNode;
  }) => {
    const MockedComponent = (props: {
      id: string;
      data: Record<string, unknown>;
    }) => (
      <div data-testid="projectile-node" data-node-type={nodeType}>
        <div
          data-testid="node-colors"
          data-bg={backgroundColor}
          data-border={borderColor}
        >
          {renderContent(props)}
        </div>
      </div>
    );
    MockedComponent.displayName = "ProjectileNode";
    return MockedComponent;
  },
  NODE_COLORS: {
    PALE_ORANGE_BG: "#fff7e6",
    ORANGE_BORDER: "#ffa940",
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
    )
  ),
  NodeField: vi.fn(({ label, children }) => (
    <div data-testid="node-field" data-label={label}>
      <label>{label}</label>
      {children}
    </div>
  )),
  NodeInteractive: vi.fn(({ children }) => (
    <div data-testid="node-interactive">{children}</div>
  )),
}));

describe("ProjectileNode", () => {
  const mockProps = {
    id: "projectile-1",
    data: {
      projectile: {
        key: "fireball-projectile",
        name: "Fireball",
      },
      spawn_position: {
        type: ProjectileSpawnPositionType.Character,
        position: {
          x: 1.5,
          y: 2.0,
          z: 0.5,
        },
        offset: {
          x: 0.5,
          y: 1.0,
          z: 0.0,
        },
      },
      direction: {
        x: 0.0,
        y: 0.5,
        z: 1.0,
      },
    },
    type: "Projectile",
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
    useSkillStore.setState({
      nodes: [],
      edges: [],
    });
  });

  describe("Component Rendering", () => {
    it("should render projectile node with all fields", () => {
      render(<ProjectileNode {...mockProps} />);

      expect(screen.getByTestId("projectile-node")).toBeInTheDocument();
      expect(screen.getByTestId("node-entity-reference")).toBeInTheDocument();
      expect(screen.getAllByText("Projectile").length).toBeGreaterThan(0);
      expect(screen.getByText("Spawn Position Type")).toBeInTheDocument();
      expect(screen.getByText("Spawn Position")).toBeInTheDocument();
      expect(screen.getByText("Spawn Offset")).toBeInTheDocument();
      expect(screen.getByText("Direction")).toBeInTheDocument();
    });

    it("should display current projectile entity reference", () => {
      render(<ProjectileNode {...mockProps} />);

      const entityInput = screen.getByTestId("entity-reference-input");
      expect(entityInput).toHaveValue("fireball-projectile");
    });

    it("should show Projectile entity type", () => {
      render(<ProjectileNode {...mockProps} />);

      expect(screen.getByTestId("entity-type")).toHaveTextContent(
        EntityType.Projectile
      );
    });

    it("should render spawn position type select", () => {
      render(<ProjectileNode {...mockProps} />);

      const select = screen.getByTestId("spawn-position-type-select");
      expect(select).toHaveValue(ProjectileSpawnPositionType.Character);
    });

    it("should render all position inputs with correct values", () => {
      render(<ProjectileNode {...mockProps} />);

      // Spawn Position
      const spawnPosX = screen.getAllByTestId("input-x")[0];
      const spawnPosY = screen.getAllByTestId("input-y")[0];
      const spawnPosZ = screen.getAllByTestId("input-z")[0];

      expect(spawnPosX).toHaveValue(1.5);
      expect(spawnPosY).toHaveValue(2.0);
      expect(spawnPosZ).toHaveValue(0.5);
    });

    it("should render all offset inputs with correct values", () => {
      render(<ProjectileNode {...mockProps} />);

      // Spawn Offset (second set of x, y, z)
      const offsetX = screen.getAllByTestId("input-x")[1];
      const offsetY = screen.getAllByTestId("input-y")[1];
      const offsetZ = screen.getAllByTestId("input-z")[1];

      expect(offsetX).toHaveValue(0.5);
      expect(offsetY).toHaveValue(1.0);
      expect(offsetZ).toHaveValue(0.0);
    });

    it("should render all direction inputs with correct values", () => {
      render(<ProjectileNode {...mockProps} />);

      // Direction (third set of x, y, z)
      const dirX = screen.getAllByTestId("input-x")[2];
      const dirY = screen.getAllByTestId("input-y")[2];
      const dirZ = screen.getAllByTestId("input-z")[2];

      expect(dirX).toHaveValue(0.0);
      expect(dirY).toHaveValue(0.5);
      expect(dirZ).toHaveValue(1.0);
    });

    it("should render with default values when data is missing", () => {
      const emptyProps = {
        id: "projectile-1",
        data: {},
        type: "Projectile",
        position: { x: 0, y: 0 },
        selected: false,
        xPos: 0,
        yPos: 0,
        zIndex: 0,
        isConnectable: true,
        dragging: false,
      };

      render(<ProjectileNode {...emptyProps} />);

      expect(screen.getByTestId("node-entity-reference")).toBeInTheDocument();
      expect(screen.getByText("Spawn Position Type")).toBeInTheDocument();
      expect(screen.getByText("Spawn Position")).toBeInTheDocument();
    });
  });

  describe("Entity Reference Interactions", () => {
    it("should handle projectile entity changes", async () => {
      render(<ProjectileNode {...mockProps} />);

      const entityInput = screen.getByTestId("entity-reference-input");
      fireEvent.change(entityInput, {
        target: { value: "ice-projectile" },
      });

      expect(mockOnChange).toHaveBeenCalledWith({ key: "ice-projectile" });
    });

    it("should pass correct entity type to NodeEntityReference", () => {
      render(<ProjectileNode {...mockProps} />);

      expect(screen.getByTestId("entity-type")).toHaveTextContent(
        EntityType.Projectile
      );
    });

    it("should display correct placeholder text", () => {
      render(<ProjectileNode {...mockProps} />);

      const entityInput = screen.getByTestId("entity-reference-input");
      expect(entityInput).toHaveAttribute("placeholder", "Select projectile");
    });

    it("should handle empty entity reference", () => {
      const propsWithoutEntity = {
        ...mockProps,
        data: {
          ...mockProps.data,
          projectile: null,
        },
      };

      render(<ProjectileNode {...propsWithoutEntity} />);

      const entityInput = screen.getByTestId("entity-reference-input");
      expect(entityInput).toHaveValue("");
    });
  });

  describe("Spawn Position Type Interactions", () => {
    it("should update spawn position type to World", async () => {
      const user = userEvent.setup();
      render(<ProjectileNode {...mockProps} />);

      const select = screen.getByTestId("spawn-position-type-select");
      await user.selectOptions(select, ProjectileSpawnPositionType.World);

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith({
          spawn_position: {
            ...mockProps.data.spawn_position,
            type: ProjectileSpawnPositionType.World,
          },
        });
      });
    });

    it("should update spawn position type to Character", async () => {
      const user = userEvent.setup();
      const propsWithWorldType = {
        ...mockProps,
        data: {
          ...mockProps.data,
          spawn_position: {
            ...mockProps.data.spawn_position,
            type: ProjectileSpawnPositionType.World,
          },
        },
      };
      render(<ProjectileNode {...propsWithWorldType} />);

      const select = screen.getByTestId("spawn-position-type-select");
      await user.selectOptions(select, ProjectileSpawnPositionType.Character);

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith({
          spawn_position: {
            ...propsWithWorldType.data.spawn_position,
            type: ProjectileSpawnPositionType.Character,
          },
        });
      });
    });
  });

  describe("Spawn Position Interactions", () => {
    it("should update spawn position X axis", async () => {
      render(<ProjectileNode {...mockProps} />);

      const xInput = screen.getAllByTestId("input-x")[0];
      fireEvent.change(xInput, { target: { value: "5.0" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith({
          spawn_position: {
            ...mockProps.data.spawn_position,
            position: {
              x: 5.0,
              y: 2.0,
              z: 0.5,
            },
          },
        });
      });
    });

    it("should update spawn position Y axis", async () => {
      render(<ProjectileNode {...mockProps} />);

      const yInput = screen.getAllByTestId("input-y")[0];
      fireEvent.change(yInput, { target: { value: "3.5" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith({
          spawn_position: {
            ...mockProps.data.spawn_position,
            position: {
              x: 1.5,
              y: 3.5,
              z: 0.5,
            },
          },
        });
      });
    });

    it("should update spawn position Z axis", async () => {
      render(<ProjectileNode {...mockProps} />);

      const zInput = screen.getAllByTestId("input-z")[0];
      fireEvent.change(zInput, { target: { value: "2.0" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith({
          spawn_position: {
            ...mockProps.data.spawn_position,
            position: {
              x: 1.5,
              y: 2.0,
              z: 2.0,
            },
          },
        });
      });
    });

    it("should handle null values and default to 0", async () => {
      render(<ProjectileNode {...mockProps} />);

      const xInput = screen.getAllByTestId("input-x")[0];
      fireEvent.change(xInput, { target: { value: "" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith({
          spawn_position: {
            ...mockProps.data.spawn_position,
            position: {
              x: 0,
              y: 2.0,
              z: 0.5,
            },
          },
        });
      });
    });
  });

  describe("Spawn Offset Interactions", () => {
    it("should update spawn offset X axis", async () => {
      render(<ProjectileNode {...mockProps} />);

      const xInput = screen.getAllByTestId("input-x")[1];
      fireEvent.change(xInput, { target: { value: "2.5" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith({
          spawn_position: {
            ...mockProps.data.spawn_position,
            offset: {
              x: 2.5,
              y: 1.0,
              z: 0.0,
            },
          },
        });
      });
    });

    it("should update spawn offset Y axis", async () => {
      render(<ProjectileNode {...mockProps} />);

      const yInput = screen.getAllByTestId("input-y")[1];
      fireEvent.change(yInput, { target: { value: "1.5" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith({
          spawn_position: {
            ...mockProps.data.spawn_position,
            offset: {
              x: 0.5,
              y: 1.5,
              z: 0.0,
            },
          },
        });
      });
    });

    it("should update spawn offset Z axis", async () => {
      render(<ProjectileNode {...mockProps} />);

      const zInput = screen.getAllByTestId("input-z")[1];
      fireEvent.change(zInput, { target: { value: "3.0" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith({
          spawn_position: {
            ...mockProps.data.spawn_position,
            offset: {
              x: 0.5,
              y: 1.0,
              z: 3.0,
            },
          },
        });
      });
    });

    it("should preserve position when updating offset", async () => {
      render(<ProjectileNode {...mockProps} />);

      const xInput = screen.getAllByTestId("input-x")[1];
      fireEvent.change(xInput, { target: { value: "10.0" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith({
          spawn_position: expect.objectContaining({
            position: mockProps.data.spawn_position.position,
            offset: {
              x: 10.0,
              y: 1.0,
              z: 0.0,
            },
          }),
        });
      });
    });
  });

  describe("Direction Interactions", () => {
    it("should update direction X axis", async () => {
      render(<ProjectileNode {...mockProps} />);

      const xInput = screen.getAllByTestId("input-x")[2];
      fireEvent.change(xInput, { target: { value: "1.0" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith({
          direction: {
            x: 1.0,
            y: 0.5,
            z: 1.0,
          },
        });
      });
    });

    it("should update direction Y axis", async () => {
      render(<ProjectileNode {...mockProps} />);

      const yInput = screen.getAllByTestId("input-y")[2];
      fireEvent.change(yInput, { target: { value: "0.8" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith({
          direction: {
            x: 0.0,
            y: 0.8,
            z: 1.0,
          },
        });
      });
    });

    it("should update direction Z axis", async () => {
      render(<ProjectileNode {...mockProps} />);

      const zInput = screen.getAllByTestId("input-z")[2];
      fireEvent.change(zInput, { target: { value: "0.5" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith({
          direction: {
            x: 0.0,
            y: 0.5,
            z: 0.5,
          },
        });
      });
    });

    it("should handle null direction values and default to 0", async () => {
      render(<ProjectileNode {...mockProps} />);

      const xInput = screen.getAllByTestId("input-x")[2];
      fireEvent.change(xInput, { target: { value: "" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith({
          direction: {
            x: 0,
            y: 0.5,
            z: 1.0,
          },
        });
      });
    });
  });

  describe("Node Properties", () => {
    it("should have correct node type", () => {
      render(<ProjectileNode {...mockProps} />);

      expect(screen.getByTestId("projectile-node")).toHaveAttribute(
        "data-node-type",
        "Projectile"
      );
    });

    it("should have correct styling configuration", () => {
      render(<ProjectileNode {...mockProps} />);

      const nodeColors = screen.getByTestId("node-colors");
      expect(nodeColors).toHaveAttribute("data-bg", "#fff7e6");
      expect(nodeColors).toHaveAttribute("data-border", "#ffa940");
    });

    it("should have correct step values for position inputs", () => {
      render(<ProjectileNode {...mockProps} />);

      const positionInputs = screen.getAllByTestId("input-x");
      positionInputs.forEach((input, index) => {
        if (index < 2) {
          // Position and offset inputs
          expect(input).toHaveAttribute("step", "0.5");
        }
      });
    });

    it("should have correct step values for direction inputs", () => {
      render(<ProjectileNode {...mockProps} />);

      const directionInputs = screen.getAllByTestId("input-x");
      const directionX = directionInputs[2]; // Third X input is for direction
      expect(directionX).toHaveAttribute("step", "0.1");
    });
  });

  describe("Error Handling", () => {
    it("should handle missing spawn_position data gracefully", () => {
      const emptyProps = {
        id: "projectile-1",
        data: {
          projectile: { key: "test" },
        },
        type: "Projectile",
        position: { x: 0, y: 0 },
        selected: false,
        xPos: 0,
        yPos: 0,
        zIndex: 0,
        isConnectable: true,
        dragging: false,
      };

      render(<ProjectileNode {...emptyProps} />);

      // Should render without crashing
      expect(screen.getByTestId("projectile-node")).toBeInTheDocument();
    });

    it("should handle missing direction data gracefully", () => {
      const propsWithoutDirection = {
        ...mockProps,
        data: {
          ...mockProps.data,
          direction: undefined,
        },
      };

      render(<ProjectileNode {...propsWithoutDirection} />);

      // Should render without crashing
      expect(screen.getByTestId("projectile-node")).toBeInTheDocument();
    });

    it("should handle partial spawn_position data", async () => {
      const partialProps = {
        id: "projectile-1",
        data: {
          projectile: { key: "test" },
          spawn_position: {
            type: ProjectileSpawnPositionType.Character,
            position: { x: 1 }, // Missing y and z
          },
        },
        type: "Projectile",
        position: { x: 0, y: 0 },
        selected: false,
        xPos: 0,
        yPos: 0,
        zIndex: 0,
        isConnectable: true,
        dragging: false,
      };

      render(<ProjectileNode {...partialProps} />);

      const yInput = screen.getAllByTestId("input-y")[0];
      fireEvent.change(yInput, { target: { value: "2" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith(
          expect.objectContaining({
            spawn_position: expect.objectContaining({
              position: expect.objectContaining({ y: 2 }),
            }),
          })
        );
      });
    });
  });

  describe("Integration", () => {
    it("should handle multiple updates in sequence", async () => {
      render(<ProjectileNode {...mockProps} />);

      const posX = screen.getAllByTestId("input-x")[0];
      const dirY = screen.getAllByTestId("input-y")[2];

      fireEvent.change(posX, { target: { value: "5" } });
      fireEvent.change(dirY, { target: { value: "0.9" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledTimes(2);
      });
    });

    it("should preserve independent data when updating spawn position", async () => {
      render(<ProjectileNode {...mockProps} />);

      const posX = screen.getAllByTestId("input-x")[0];
      fireEvent.change(posX, { target: { value: "10" } });

      await waitFor(() => {
        expect(mockUpdateNodeData).toHaveBeenCalledWith({
          spawn_position: expect.objectContaining({
            type: mockProps.data.spawn_position.type,
            offset: mockProps.data.spawn_position.offset,
          }),
        });
      });
    });

    it("should maintain data structure consistency", async () => {
      render(<ProjectileNode {...mockProps} />);

      const offsetZ = screen.getAllByTestId("input-z")[1];
      fireEvent.change(offsetZ, { target: { value: "5.5" } });

      await waitFor(() => {
        const call = mockUpdateNodeData.mock.calls[0][0];
        expect(call.spawn_position).toHaveProperty("type");
        expect(call.spawn_position).toHaveProperty("position");
        expect(call.spawn_position).toHaveProperty("offset");
      });
    });
  });

  describe("Default Values", () => {
    it("should default spawn position type to Character when missing", () => {
      const propsWithoutType = {
        id: "projectile-1",
        data: {},
        type: "Projectile",
        position: { x: 0, y: 0 },
        selected: false,
        xPos: 0,
        yPos: 0,
        zIndex: 0,
        isConnectable: true,
        dragging: false,
      };

      render(<ProjectileNode {...propsWithoutType} />);

      const select = screen.getByTestId("spawn-position-type-select");
      expect(select).toHaveValue(ProjectileSpawnPositionType.Character);
    });

    it("should default direction Z to 1 when missing", () => {
      const propsWithoutDirection = {
        id: "projectile-1",
        data: {},
        type: "Projectile",
        position: { x: 0, y: 0 },
        selected: false,
        xPos: 0,
        yPos: 0,
        zIndex: 0,
        isConnectable: true,
        dragging: false,
      };

      render(<ProjectileNode {...propsWithoutDirection} />);

      const directionZ = screen.getAllByTestId("input-z")[2];
      expect(directionZ).toHaveValue(1);
    });
  });
});
