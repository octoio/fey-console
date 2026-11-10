import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { InterruptNode } from "@components/nodetypes/interrupt-node";
import { SkillActionNodeType } from "@models/skill.types";
import { render, screen, fireEvent } from "@testing-library/react";

const mockUpdateNodeData = vi.fn();
const mockOnChange = vi.fn();

vi.mock("@utils/node-operations", () => ({
  useNodeOperations: vi.fn(() => ({
    updateNodeData: mockUpdateNodeData,
    handleNameChange: vi.fn(),
    handleNodeDelete: vi.fn(),
  })),
  createNodeDataHandler: vi.fn((_id: string, data: unknown) => ({
    data,
    onChange: mockOnChange,
  })),
}));

vi.mock("@components/node-common", () => ({
  createNodeComponent: ({
    nodeType,
    renderContent,
  }: {
    nodeType: string;
    renderContent: (props: {
      id: string;
      data: Record<string, unknown>;
    }) => React.ReactNode;
  }) => {
    const MockedComponent = (props: {
      id: string;
      data: Record<string, unknown>;
    }) => (
      <div data-testid="interrupt-node" data-node-type={nodeType}>
        {renderContent(props)}
      </div>
    );
    return MockedComponent;
  },
  NODE_COLORS: { LIGHT_RED_BG: "#fff1f0", RED_BORDER: "#ffa39e" },
  NodeField: ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <div>
      <label>{label}</label>
      {children}
    </div>
  ),
  NodeInteractive: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  StatusEffectEditor: ({
    statusEffect,
  }: {
    statusEffect: { status: { key: string } };
  }) => <div data-testid="status-effect-editor">{statusEffect.status.key}</div>,
}));

const props = (data: Record<string, unknown>) => ({
  id: "interrupt-1",
  data,
  type: SkillActionNodeType.Interrupt,
  position: { x: 0, y: 0 },
  selected: false,
  xPos: 0,
  yPos: 0,
  zIndex: 0,
  isConnectable: true,
  dragging: false,
});

describe("InterruptNode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("is the Interrupt node type", () => {
    render(<InterruptNode {...props({})} />);
    expect(screen.getByTestId("interrupt-node")).toHaveAttribute(
      "data-node-type",
      "Interrupt",
    );
  });

  it("shows the target and no status editor without on_interrupt", () => {
    render(<InterruptNode {...props({ target: "Ally" })} />);
    expect(screen.getByText("Target")).toBeInTheDocument();
    expect(screen.getByText("Ally")).toBeInTheDocument();
    expect(screen.queryByTestId("status-effect-editor")).toBeNull();
  });

  it("shows the status editor when on_interrupt is set", () => {
    render(
      <InterruptNode
        {...props({
          target: "Enemy",
          on_interrupt: { status: { key: "Dazed" } },
        })}
      />,
    );
    expect(screen.getByTestId("status-effect-editor")).toHaveTextContent(
      "Dazed",
    );
  });

  it("adds a default on_interrupt with a Selected mechanic when ticked", () => {
    render(<InterruptNode {...props({ target: "Enemy" })} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(mockUpdateNodeData).toHaveBeenCalledWith({
      on_interrupt: expect.objectContaining({
        target_mechanic: { type: "Selected" },
        durations: [],
        scalers: [],
      }),
    });
  });

  it("removes on_interrupt when unticked", () => {
    render(
      <InterruptNode
        {...props({ target: "Enemy", on_interrupt: { status: { key: "x" } } })}
      />,
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(mockUpdateNodeData).toHaveBeenCalledWith({
      on_interrupt: undefined,
    });
  });
});
