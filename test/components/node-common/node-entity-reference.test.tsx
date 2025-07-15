import { describe, it, expect, vi, beforeEach } from "vitest";
import { NodeEntityReference } from "@components/node-common/node-entity-reference";
import { EntityType } from "@models/common.types";
import { render, screen } from "@testing-library/react";

// Mock only the EntityReferenceSelect component
vi.mock("@components/common/entity-reference-select", () => ({
  EntityReferenceSelect: vi.fn(
    ({
      placeholder,
      value,
      size,
      allowClear,
      entityType,
      onChange,
      className,
    }) => (
      <select
        data-testid="entity-reference-select"
        className={className}
        data-entity-type={entityType}
        data-size={size}
        data-allow-clear={allowClear}
        value={value || ""}
        onChange={(e) =>
          onChange && onChange({ id: e.target.value, entityType })
        }
      >
        <option value="">{placeholder}</option>
        <option value="test-entity">Test Entity</option>
        <option value="test-value">Test Value</option>
      </select>
    ),
  ),
}));

describe("NodeEntityReference", () => {
  const defaultProps = {
    entityType: EntityType.Character,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with minimal props", () => {
    render(<NodeEntityReference {...defaultProps} />);

    expect(screen.getByTestId("entity-reference-select")).toBeInTheDocument();
  });

  it("renders without label (no label text)", () => {
    render(<NodeEntityReference {...defaultProps} />);

    expect(screen.getByTestId("entity-reference-select")).toBeInTheDocument();
    // Should not have any label text in the document
    expect(screen.queryByText(/label/i)).not.toBeInTheDocument();
  });

  it("renders with label", () => {
    render(<NodeEntityReference {...defaultProps} label="Test Label" />);

    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByTestId("entity-reference-select")).toBeInTheDocument();
  });

  it("passes entityType to EntityReferenceSelect", () => {
    render(
      <NodeEntityReference {...defaultProps} entityType={EntityType.Weapon} />,
    );

    const select = screen.getByTestId("entity-reference-select");
    expect(select).toHaveAttribute("data-entity-type", EntityType.Weapon);
  });

  it("passes value to EntityReferenceSelect", () => {
    render(<NodeEntityReference {...defaultProps} value="test-value" />);

    const select = screen.getByTestId("entity-reference-select");
    expect(select).toHaveDisplayValue("Test Value");
  });

  it("uses default placeholder when none provided", () => {
    render(<NodeEntityReference {...defaultProps} />);

    expect(screen.getByText("Select entity")).toBeInTheDocument();
  });

  it("uses custom placeholder when provided", () => {
    render(
      <NodeEntityReference {...defaultProps} placeholder="Choose an item" />,
    );

    expect(screen.getByText("Choose an item")).toBeInTheDocument();
  });

  it("uses default size when none provided", () => {
    render(<NodeEntityReference {...defaultProps} />);

    const select = screen.getByTestId("entity-reference-select");
    expect(select).toHaveAttribute("data-size", "small");
  });

  it("uses custom size when provided", () => {
    render(<NodeEntityReference {...defaultProps} size="large" />);

    const select = screen.getByTestId("entity-reference-select");
    expect(select).toHaveAttribute("data-size", "large");
  });

  it("uses default allowClear when none provided", () => {
    render(<NodeEntityReference {...defaultProps} />);

    const select = screen.getByTestId("entity-reference-select");
    expect(select).toHaveAttribute("data-allow-clear", "true");
  });

  it("uses custom allowClear when provided", () => {
    render(<NodeEntityReference {...defaultProps} allowClear={false} />);

    const select = screen.getByTestId("entity-reference-select");
    expect(select).toHaveAttribute("data-allow-clear", "false");
  });

  it("renders with all entity types", () => {
    Object.values(EntityType).forEach((entityType) => {
      const { unmount } = render(
        <NodeEntityReference entityType={entityType} onChange={vi.fn()} />,
      );

      const select = screen.getByTestId("entity-reference-select");
      expect(select).toHaveAttribute("data-entity-type", entityType);

      unmount();
    });
  });

  it("handles different sizes", () => {
    const sizes: Array<"small" | "middle" | "large"> = [
      "small",
      "middle",
      "large",
    ];

    sizes.forEach((size) => {
      const { unmount } = render(
        <NodeEntityReference {...defaultProps} size={size} />,
      );

      const select = screen.getByTestId("entity-reference-select");
      expect(select).toHaveAttribute("data-size", size);

      unmount();
    });
  });

  it("applies nodrag class to EntityReferenceSelect", () => {
    render(<NodeEntityReference {...defaultProps} />);

    const select = screen.getByTestId("entity-reference-select");
    expect(select).toHaveClass("nodrag");
  });

  it("wraps in div with nodrag class through NodeInteractive", () => {
    render(<NodeEntityReference {...defaultProps} />);

    // The component should be wrapped in a div with nodrag class
    const nodeInteractiveDiv = screen
      .getByTestId("entity-reference-select")
      .closest(".nodrag");
    expect(nodeInteractiveDiv).toBeInTheDocument();
  });
});
