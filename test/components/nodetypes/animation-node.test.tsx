import { describe, it, expect, beforeEach, vi } from "vitest";
import { AnimationNode } from "@components/nodetypes/animation-node";
import { useSkillStore } from "@store/skill.store";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock store
const mockUpdateNodeData = vi.fn();

// Mock node-operations
vi.mock("@utils/node-operations", () => ({
  createNodeDataHandler: vi.fn((_id, data, field) => ({
    data,
    onChange: vi.fn((newData) => {
      mockUpdateNodeData({ [field]: newData });
    }),
  })),
  useNodeOperations: vi.fn(() => ({
    updateNodeData: mockUpdateNodeData,
  })),
}));

// Mock styled components
vi.mock("@components/common/styled-components", () => ({
  FullWidthInputNumber: ({
    value,
    onChange,
    min,
    step,
    size,
    ...props
  }: {
    value: number | null;
    onChange: (val: number | null) => void;
    min: number;
    step: number;
    size: string;
  }) => (
    <input
      data-testid="duration-input"
      type="number"
      value={value === null || value === undefined ? "" : value}
      onChange={(e) => {
        const val = e.target.value;
        const numVal = val === "" ? null : parseFloat(val);
        onChange?.(numVal);
      }}
      min={min}
      step={step}
      data-size={size}
      {...props}
    />
  ),
}));

// Mock antd components
vi.mock("antd", () => ({
  Checkbox: ({
    checked,
    onChange,
    children,
  }: {
    checked: boolean;
    onChange: (e: { target: { checked: boolean } }) => void;
    children: React.ReactNode;
  }) => (
    <label>
      <input
        data-testid="show-progress-checkbox"
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.({ target: { checked: e.target.checked } })}
      />
      {children}
    </label>
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
    renderContent: (props: unknown) => React.ReactNode;
  }) => {
    const MockComponent = (props: unknown) => (
      <div
        data-testid={`${nodeType.toLowerCase()}-node`}
        data-background={backgroundColor}
        data-border={borderColor}
      >
        <div data-testid="node-header">{nodeType}</div>
        <div data-testid="node-content">{renderContent(props)}</div>
      </div>
    );
    MockComponent.displayName = `${nodeType}Node`;
    return MockComponent;
  },
  NODE_COLORS: {
    LIGHT_PURPLE_BG: "#f3e8ff",
    PURPLE_BORDER: "#7c3aed",
  },
  NodeField: ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <div data-testid="node-field">
      <label>{label}</label>
      {children}
    </div>
  ),
  NodeInteractive: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="node-interactive">{children}</div>
  ),
  NodeEntityReferences: ({
    entityType,
    title,
    values,
    onChange,
  }: {
    entityType: string;
    title: string;
    values: Array<{ key: string; name: string }>;
    onChange: (newValues: Array<{ key: string; name: string }>) => void;
  }) => (
    <div data-testid="node-entity-references" data-entity-type={entityType}>
      <label htmlFor="animations-select">{title}</label>
      <select
        id="animations-select"
        value={values.length > 0 ? values[0].key : ""}
        onChange={(e) => {
          const newValue = e.target.value
            ? [{ key: e.target.value, name: `${e.target.value} Name` }]
            : [];
          onChange(newValue);
        }}
        data-testid="animations-selector"
      >
        <option value="">Select...</option>
        <option value="anim1">Animation 1</option>
        <option value="anim2">Animation 2</option>
        <option value="walk">Walk Animation</option>
      </select>
    </div>
  ),
}));

const createNodeProps = (id: string, data: Record<string, unknown>) => ({
  id,
  data,
  type: "custom",
  selected: false,
  zIndex: 1,
  isConnectable: true,
  xPos: 0,
  yPos: 0,
  dragHandle: undefined,
  dragging: false,
});

describe("AnimationNode Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSkillStore.setState({
      nodes: [],
      edges: [],
    });
  });

  describe("Component Rendering", () => {
    it("should render with default props", () => {
      const props = createNodeProps("test-animation-node-1", {
        show_progress: false,
        duration: 0,
        animations: [],
      });
      render(<AnimationNode {...props} />);

      expect(screen.getByTestId("animation-node")).toBeInTheDocument();
      expect(screen.getByTestId("show-progress-checkbox")).toBeInTheDocument();
      expect(screen.getByTestId("duration-input")).toBeInTheDocument();
      expect(screen.getByTestId("node-entity-references")).toBeInTheDocument();
    });

    it("should render with existing animation data", () => {
      const props = createNodeProps("test-animation-node-1", {
        show_progress: true,
        duration: 2.5,
        animations: [{ key: "anim1", name: "Animation 1" }],
      });
      render(<AnimationNode {...props} />);

      const checkbox = screen.getByTestId("show-progress-checkbox");
      const durationInput = screen.getByTestId("duration-input");
      const animationsSelector = screen.getByTestId("animations-selector");

      expect(checkbox).toBeChecked();
      expect(durationInput).toHaveValue(2.5);
      expect(animationsSelector).toHaveValue("anim1");
    });

    it("should render with empty animation data", () => {
      const props = createNodeProps("test-animation-node-1", {});
      render(<AnimationNode {...props} />);

      const checkbox = screen.getByTestId("show-progress-checkbox");
      const durationInput = screen.getByTestId("duration-input");
      const animationsSelector = screen.getByTestId("animations-selector");

      expect(checkbox).not.toBeChecked();
      expect(durationInput).toHaveValue(null);
      expect(animationsSelector).toHaveValue("");
    });
  });

  describe("Show Progress Checkbox", () => {
    it("should handle checking show progress", async () => {
      const user = userEvent.setup();
      const props = createNodeProps("test-animation-node-1", {
        show_progress: false,
      });
      render(<AnimationNode {...props} />);

      const checkbox = screen.getByTestId("show-progress-checkbox");
      await user.click(checkbox);

      expect(mockUpdateNodeData).toHaveBeenCalledWith({ show_progress: true });
    });

    it("should handle unchecking show progress", async () => {
      const user = userEvent.setup();
      const props = createNodeProps("test-animation-node-1", {
        show_progress: true,
      });
      render(<AnimationNode {...props} />);

      const checkbox = screen.getByTestId("show-progress-checkbox");
      await user.click(checkbox);

      expect(mockUpdateNodeData).toHaveBeenCalledWith({ show_progress: false });
    });
  });

  describe("Duration Input", () => {
    it("should handle duration change using fireEvent", () => {
      const props = createNodeProps("test-animation-node-1", { duration: 0 });
      render(<AnimationNode {...props} />);

      const durationInput = screen.getByTestId("duration-input");
      fireEvent.change(durationInput, { target: { value: "3.5" } });

      expect(mockUpdateNodeData).toHaveBeenCalledWith({ duration: 3.5 });
    });

    it("should handle empty duration input", () => {
      const props = createNodeProps("test-animation-node-1", { duration: 2 });
      render(<AnimationNode {...props} />);

      const durationInput = screen.getByTestId("duration-input");
      fireEvent.change(durationInput, { target: { value: "" } });

      // The component converts null to 0 in handleDurationChange
      expect(mockUpdateNodeData).toHaveBeenCalledWith({ duration: 0 });
    });

    it("should handle decimal duration values", () => {
      const props = createNodeProps("test-animation-node-1", { duration: 0 });
      render(<AnimationNode {...props} />);

      const durationInput = screen.getByTestId("duration-input");
      fireEvent.change(durationInput, { target: { value: "1.25" } });

      expect(mockUpdateNodeData).toHaveBeenCalledWith({ duration: 1.25 });
    });

    it("should handle zero duration", () => {
      const props = createNodeProps("test-animation-node-1", { duration: 5 });
      render(<AnimationNode {...props} />);

      const durationInput = screen.getByTestId("duration-input");
      fireEvent.change(durationInput, { target: { value: "0" } });

      expect(mockUpdateNodeData).toHaveBeenCalledWith({ duration: 0 });
    });
  });

  describe("Animation Selection", () => {
    it("should handle animation selection", async () => {
      const user = userEvent.setup();
      const props = createNodeProps("test-animation-node-1", {
        animations: [],
      });
      render(<AnimationNode {...props} />);

      const animationsSelector = screen.getByTestId("animations-selector");
      await user.selectOptions(animationsSelector, "anim1");

      expect(mockUpdateNodeData).toHaveBeenCalledWith({
        animations: [{ key: "anim1", name: "anim1 Name" }],
      });
    });

    it("should handle changing animation selection", async () => {
      const user = userEvent.setup();
      const props = createNodeProps("test-animation-node-1", {
        animations: [{ key: "anim1", name: "Animation 1" }],
      });
      render(<AnimationNode {...props} />);

      const animationsSelector = screen.getByTestId("animations-selector");
      await user.selectOptions(animationsSelector, "anim2");

      expect(mockUpdateNodeData).toHaveBeenCalledWith({
        animations: [{ key: "anim2", name: "anim2 Name" }],
      });
    });

    it("should handle clearing animation selection", async () => {
      const user = userEvent.setup();
      const props = createNodeProps("test-animation-node-1", {
        animations: [{ key: "anim1", name: "Animation 1" }],
      });
      render(<AnimationNode {...props} />);

      const animationsSelector = screen.getByTestId("animations-selector");
      await user.selectOptions(animationsSelector, "");

      expect(mockUpdateNodeData).toHaveBeenCalledWith({ animations: [] });
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined animations", () => {
      const props = createNodeProps("test-animation-node-1", {
        animations: undefined,
      });
      render(<AnimationNode {...props} />);

      const selector = screen.getByTestId("animations-selector");
      expect(selector).toHaveValue("");
    });

    it("should handle null duration", () => {
      const props = createNodeProps("test-animation-node-1", {
        duration: null,
      });
      render(<AnimationNode {...props} />);

      const durationInput = screen.getByTestId("duration-input");
      expect(durationInput).toHaveValue(null);
    });

    it("should handle undefined show_progress", () => {
      const props = createNodeProps("test-animation-node-1", {
        show_progress: undefined,
      });
      render(<AnimationNode {...props} />);

      const checkbox = screen.getByTestId("show-progress-checkbox");
      expect(checkbox).not.toBeChecked();
    });

    it("should handle large duration values", () => {
      const props = createNodeProps("test-animation-node-1", { duration: 0 });
      render(<AnimationNode {...props} />);

      const durationInput = screen.getByTestId("duration-input");
      fireEvent.change(durationInput, { target: { value: "999.99" } });

      expect(mockUpdateNodeData).toHaveBeenCalledWith({ duration: 999.99 });
    });
  });

  describe("Component Integration", () => {
    it("should handle multiple simultaneous updates", async () => {
      const user = userEvent.setup();
      const props = createNodeProps("test-animation-node-1", {
        show_progress: false,
        duration: 0,
        animations: [],
      });
      render(<AnimationNode {...props} />);

      const checkbox = screen.getByTestId("show-progress-checkbox");
      const durationInput = screen.getByTestId("duration-input");
      const animationsSelector = screen.getByTestId("animations-selector");

      // Clear mock calls to start fresh
      mockUpdateNodeData.mockClear();

      // Make multiple changes
      await user.click(checkbox);
      fireEvent.change(durationInput, { target: { value: "2.5" } });
      await user.selectOptions(animationsSelector, "anim2");

      // Verify all specific updates were called
      expect(mockUpdateNodeData).toHaveBeenCalledWith({ show_progress: true });
      expect(mockUpdateNodeData).toHaveBeenCalledWith({ duration: 2.5 });
      expect(mockUpdateNodeData).toHaveBeenCalledWith({
        animations: [{ key: "anim2", name: "anim2 Name" }],
      });
      // Check that we got all expected calls
      expect(mockUpdateNodeData.mock.calls.length).toBe(3);
    });

    it("should maintain state consistency", () => {
      const props1 = createNodeProps("animation-node-1", {
        show_progress: true,
        duration: 1.5,
        animations: [{ key: "anim1", name: "Animation 1" }],
      });
      const props2 = createNodeProps("animation-node-2", {
        show_progress: false,
        duration: 3,
        animations: [],
      });

      const { rerender } = render(<AnimationNode {...props1} />);
      expect(screen.getByTestId("duration-input")).toHaveValue(1.5);

      rerender(<AnimationNode {...props2} />);
      expect(screen.getByTestId("duration-input")).toHaveValue(3);
    });
  });
});
