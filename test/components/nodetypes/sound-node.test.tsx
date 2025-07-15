import { describe, it, expect, beforeEach, vi } from "vitest";
import { SoundNode } from "@components/nodetypes/sound-node";
import { EntityType } from "@models/common.types";
import { useSkillStore } from "@store/skill.store";
import { render, screen } from "@testing-library/react";
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
}));

// Mock node-common components
vi.mock("@components/node-common", () => ({
  createNodeComponent: ({
    nodeType,
    backgroundColor,
    borderColor,
    renderContent,
  }: any) => {
    const MockComponent = (props: any) => (
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
    LIGHT_YELLOW_BG: "#fff9e6",
    YELLOW_BORDER: "#d4b106",
  },
  NodeEntityReference: ({
    label,
    value,
    onChange,
    placeholder,
    entityType,
    size,
  }: any) => (
    <div data-testid="node-entity-reference">
      <label htmlFor="sound-select">{label}</label>
      <select
        id="sound-select"
        value={value}
        onChange={(e) =>
          onChange({
            key: e.target.value,
            name: `${e.target.value} Name`,
          })
        }
        data-testid="sound-selector"
        data-placeholder={placeholder}
        data-entity-type={entityType}
        data-size={size}
      >
        <option value="">Select...</option>
        <option value="sound1">Sound 1</option>
        <option value="sound2">Sound 2</option>
        <option value="explosion">Explosion</option>
      </select>
    </div>
  ),
}));

const createNodeProps = (id: string, data: any) =>
  ({
    id,
    data,
    type: "custom",
    selected: false,
    zIndex: 1,
    isConnectable: true,
    xPos: 0,
    yPos: 0,
    dragHandle: undefined,
  }) as any;

describe("SoundNode Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSkillStore.setState({
      nodes: [],
      edges: [],
    });
  });

  describe("Component Rendering", () => {
    it("should render with default props", () => {
      const props = createNodeProps("test-sound-node-1", { sound: null });
      render(<SoundNode {...props} />);

      expect(screen.getByTestId("node-entity-reference")).toBeInTheDocument();
      expect(
        screen.getByRole("combobox", { name: /sound/i }),
      ).toBeInTheDocument();
      expect(screen.getByTestId("sound-selector")).toBeInTheDocument();
    });

    it("should render with existing sound data", () => {
      const props = createNodeProps("test-sound-node-1", {
        sound: { key: "sound1", name: "Sound 1" },
      });
      render(<SoundNode {...props} />);

      const selector = screen.getByTestId("sound-selector");
      expect(selector).toHaveValue("sound1");
    });

    it("should render with empty sound data", () => {
      const props = createNodeProps("test-sound-node-1", {
        sound: { key: "", name: "" },
      });
      render(<SoundNode {...props} />);

      const selector = screen.getByTestId("sound-selector");
      expect(selector).toHaveValue("");
    });
  });

  describe("Component Configuration", () => {
    it("should pass correct entity type to NodeEntityReference", () => {
      const props = createNodeProps("test-sound-node-1", { sound: null });
      render(<SoundNode {...props} />);

      const selector = screen.getByTestId("sound-selector");
      expect(selector).toHaveAttribute("data-entity-type", EntityType.Sound);
    });

    it("should pass correct placeholder text", () => {
      const props = createNodeProps("test-sound-node-1", { sound: null });
      render(<SoundNode {...props} />);

      const selector = screen.getByTestId("sound-selector");
      expect(selector).toHaveAttribute("data-placeholder", "Select sound");
    });

    it("should pass correct size attribute", () => {
      const props = createNodeProps("test-sound-node-1", { sound: null });
      render(<SoundNode {...props} />);

      const selector = screen.getByTestId("sound-selector");
      expect(selector).toHaveAttribute("data-size", "small");
    });
  });

  describe("Sound Selection", () => {
    it("should handle sound selection", async () => {
      const user = userEvent.setup();
      const props = createNodeProps("test-sound-node-1", { sound: null });
      render(<SoundNode {...props} />);

      const selector = screen.getByTestId("sound-selector");
      await user.selectOptions(selector, "sound1");

      expect(mockUpdateNodeData).toHaveBeenCalledWith({
        sound: { key: "sound1", name: "sound1 Name" },
      });
    });

    it("should handle changing sound selection", async () => {
      const user = userEvent.setup();
      const props = createNodeProps("test-sound-node-1", {
        sound: { key: "sound1", name: "Sound 1" },
      });
      render(<SoundNode {...props} />);

      const selector = screen.getByTestId("sound-selector");
      await user.selectOptions(selector, "explosion");

      expect(mockUpdateNodeData).toHaveBeenCalledWith({
        sound: { key: "explosion", name: "explosion Name" },
      });
    });

    it("should handle clearing sound selection", async () => {
      const user = userEvent.setup();
      const props = createNodeProps("test-sound-node-1", {
        sound: { key: "sound1", name: "Sound 1" },
      });
      render(<SoundNode {...props} />);

      const selector = screen.getByTestId("sound-selector");
      await user.selectOptions(selector, "");

      expect(mockUpdateNodeData).toHaveBeenCalledWith({
        sound: { key: "", name: " Name" },
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined sound data", () => {
      const props = createNodeProps("test-sound-node-1", {
        sound: undefined,
      });
      render(<SoundNode {...props} />);

      const selector = screen.getByTestId("sound-selector");
      expect(selector).toHaveValue("");
    });

    it("should handle null sound data", () => {
      const props = createNodeProps("test-sound-node-1", {
        sound: null,
      });
      render(<SoundNode {...props} />);

      const selector = screen.getByTestId("sound-selector");
      expect(selector).toHaveValue("");
    });

    it("should handle sound data with only key", () => {
      const props = createNodeProps("test-sound-node-1", {
        sound: { key: "sound2" },
      });
      render(<SoundNode {...props} />);

      const selector = screen.getByTestId("sound-selector");
      expect(selector).toHaveValue("sound2");
    });
  });

  describe("Accessibility", () => {
    it("should have proper label association", () => {
      const props = createNodeProps("test-sound-node-1", { sound: null });
      render(<SoundNode {...props} />);

      const label = screen.getByLabelText("Sound");
      const selector = screen.getByTestId("sound-selector");

      expect(label).toBeInTheDocument();
      expect(selector).toHaveAttribute("id", "sound-select");
      expect(label).toBe(selector);
    });

    it("should be keyboard accessible", async () => {
      const user = userEvent.setup();
      const props = createNodeProps("test-sound-node-1", { sound: null });
      render(<SoundNode {...props} />);

      const selector = screen.getByTestId("sound-selector");

      // Test keyboard navigation
      await user.tab();
      expect(selector).toHaveFocus();

      // Test keyboard selection by using selectOptions method
      await user.selectOptions(selector, "sound1");

      // Verify the mock function was called, which shows the interaction worked
      expect(mockUpdateNodeData).toHaveBeenCalledWith({
        sound: { key: "sound1", name: "sound1 Name" },
      });
    });
  });
});
