import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { StatusNode } from "@components/nodetypes/status-node";
import { SkillActionNodeType } from "@models/skill.types";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock functions
const mockOnChange = vi.fn();

vi.mock("@utils/node-operations", () => ({
  createNodeDataHandler: vi.fn(() => ({
    data: { type: "buff", duration: 3000 },
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
      <div data-testid="status-node" data-node-type={nodeType}>
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
    LIGHT_BLUE_BG: "#e6f4ff",
    BLUE_BORDER: "#1677ff",
  },
  StatusEffectEditor: vi.fn(({ statusEffect, onChange }) => (
    <div data-testid="status-effect-editor">
      <button
        data-testid="status-effect-change"
        onClick={() => onChange({ type: "buff", duration: 5000 })}
      >
        Change Status Effect
      </button>
      <div data-testid="status-effect-value">
        {JSON.stringify(statusEffect || {})}
      </div>
    </div>
  )),
}));

describe("StatusNode", () => {
  const mockProps = {
    id: "status-1",
    type: SkillActionNodeType.Status,
    zIndex: 0,
    selected: false,
    dragHandle: undefined,
    isConnectable: true,
    xPos: 0,
    yPos: 0,
    dragging: false,
    data: {
      status_effect: {
        type: "buff",
        duration: 3000,
        effect: "strength_boost",
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("should render status node with status effect editor", () => {
      render(<StatusNode {...mockProps} />);

      expect(screen.getByTestId("status-effect-editor")).toBeInTheDocument();
    });

    it("should render with empty status effect when not provided", () => {
      const propsWithoutStatusEffect = {
        ...mockProps,
        data: {},
      };

      render(<StatusNode {...propsWithoutStatusEffect} />);

      expect(screen.getByTestId("status-effect-editor")).toBeInTheDocument();
    });
  });

  describe("Status Effect Interactions", () => {
    it("should handle status effect changes", () => {
      render(<StatusNode {...mockProps} />);

      const changeButton = screen.getByTestId("status-effect-change");
      fireEvent.click(changeButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        type: "buff",
        duration: 5000,
      });
    });
  });

  describe("Node Properties", () => {
    it("should have correct node type", () => {
      render(<StatusNode {...mockProps} />);

      expect(screen.getByTestId("status-node")).toHaveAttribute(
        "data-node-type",
        SkillActionNodeType.Status,
      );
    });

    it("should have correct styling configuration", () => {
      render(<StatusNode {...mockProps} />);

      const nodeColors = screen.getByTestId("node-colors");
      expect(nodeColors).toHaveAttribute("data-bg", "#e6f4ff");
      expect(nodeColors).toHaveAttribute("data-border", "#1677ff");
    });
  });

  describe("Error Handling", () => {
    it("should handle missing data gracefully", () => {
      const emptyProps = {
        ...mockProps,
        data: {},
      };

      expect(() => {
        render(<StatusNode {...emptyProps} />);
      }).not.toThrow();

      expect(screen.getByTestId("status-effect-editor")).toBeInTheDocument();
    });

    describe("Error Handling", () => {
      it("should handle missing data gracefully", () => {
        const emptyProps = {
          id: "status-1",
          data: {},
          type: SkillActionNodeType.Status,
          position: { x: 0, y: 0 },
          selected: false,
          xPos: 0,
          yPos: 0,
          zIndex: 0,
          isConnectable: true,
          dragging: false,
        };

        expect(() => {
          render(<StatusNode {...emptyProps} />);
        }).not.toThrow();

        expect(screen.getByTestId("status-effect-editor")).toBeInTheDocument();
      });
    });
  });
});
