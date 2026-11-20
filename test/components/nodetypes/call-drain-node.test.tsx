import React from "react";
import { describe, it, expect } from "vitest";
import { vi } from "vitest";
import { CallDrainNode } from "@components/nodetypes/call-drain-node";
import { SkillActionNodeType } from "@models/skill.types";
import { render, screen } from "@testing-library/react";

vi.mock("@components/node-common", () => ({
  createNodeComponent: ({
    nodeType,
    renderContent,
  }: {
    nodeType: string;
    renderContent: (props: Record<string, unknown>) => React.ReactNode;
  }) => {
    const MockedComponent = (props: Record<string, unknown>) => (
      <div data-testid="call-drain-node" data-node-type={nodeType}>
        {renderContent(props)}
      </div>
    );
    return MockedComponent;
  },
  NODE_COLORS: { PALE_ORANGE_BG: "#fff7e6", ORANGE_BORDER: "#ffc069" },
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
}));

describe("CallDrainNode", () => {
  it("is the CallDrain node type and says what it does", () => {
    render(<CallDrainNode {...({} as never)} />);
    expect(screen.getByTestId("call-drain-node")).toHaveAttribute(
      "data-node-type",
      SkillActionNodeType.CallDrain,
    );
    expect(screen.getByText(/nearest drain/)).toBeInTheDocument();
  });
});
