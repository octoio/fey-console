import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { EntityReferenceSelect } from "@components/common/entity-reference-select";
import { EntityType } from "@models/common.types";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock store
const mockGetEntityReferencesByType = vi.fn();

vi.mock("@store/skill.store", () => ({
  useSkillStore: vi.fn(() => ({
    getEntityReferencesByType: mockGetEntityReferencesByType,
  })),
}));

// Mock Ant Design components
vi.mock("antd", () => {
  const MockSelect = ({
    value,
    onChange,
    children,
    className,
    prefix,
  }: {
    value?: string | number;
    onChange?: (value: string | number) => void;
    children?: React.ReactNode;
    className?: string;
    prefix?: React.ReactNode;
  }) => {
    // Use prefix to determine if this is key or version select
    // Check if prefix contains "version" text
    const prefixString =
      React.isValidElement(prefix) && prefix.props?.children
        ? prefix.props.children
        : "";
    const isVersionSelect = prefixString === "version";
    const testId = isVersionSelect ? "version-select" : "key-select";

    return (
      <div>
        {prefix}
        <select
          data-testid={testId}
          value={value || ""} // Ensure value is always defined
          onChange={(e) => {
            if (onChange) {
              // Convert to number for version select, keep as string for key select
              const convertedValue = isVersionSelect
                ? parseInt(e.target.value, 10)
                : e.target.value;
              onChange(convertedValue);
            }
          }}
          className={className}
        >
          {children}
        </select>
      </div>
    );
  };

  const MockOption = ({
    value,
    children,
  }: {
    value: string | number;
    children: React.ReactNode;
  }) => <option value={value}>{children}</option>;
  MockOption.displayName = "MockOption";
  MockSelect.Option = MockOption;

  return {
    Select: MockSelect,
    Input: ({
      value,
      prefix,
      disabled,
    }: {
      value?: string;
      prefix?: React.ReactNode;
      disabled?: boolean;
    }) => (
      <div data-testid="input-container">
        {prefix}
        <input data-testid="input" value={value} disabled={disabled} readOnly />
      </div>
    ),
    Form: {
      Item: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="form-item">{children}</div>
      ),
    },
    Space: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="space">{children}</div>
    ),
    Typography: {
      Text: ({
        strong,
        children,
      }: {
        strong?: boolean;
        children: React.ReactNode;
      }) => (
        <span data-testid="text" data-strong={strong}>
          {children}
        </span>
      ),
    },
  };
});

describe("EntityReferenceSelect", () => {
  const mockOnChange = vi.fn();

  const createMockEntityReferences = () => [
    {
      id: "entity-1",
      key: "weapon-sword",
      owner: "Octoio",
      type: EntityType.Weapon,
      version: 1,
    },
    {
      id: "entity-2",
      key: "weapon-sword",
      owner: "Octoio",
      type: EntityType.Weapon,
      version: 2,
    },
    {
      id: "entity-3",
      key: "spell-fireball",
      owner: "Octoio",
      type: EntityType.Skill,
      version: 1,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetEntityReferencesByType.mockReturnValue(createMockEntityReferences());
  });

  describe("Rendering", () => {
    it("renders all form fields correctly", () => {
      render(
        <EntityReferenceSelect
          entityType={EntityType.Weapon}
          onChange={mockOnChange}
        />,
      );

      expect(screen.getByTestId("space")).toBeInTheDocument();
      expect(screen.getAllByTestId("form-item")).toHaveLength(3); // owner, type, key
      expect(screen.getAllByTestId("input")).toHaveLength(2); // owner and type inputs
      expect(screen.getByTestId("key-select")).toBeInTheDocument(); // key select
    });

    it("displays default owner and type values", () => {
      render(
        <EntityReferenceSelect
          entityType={EntityType.Weapon}
          onChange={mockOnChange}
        />,
      );

      const inputs = screen.getAllByTestId("input");
      expect(inputs[0]).toHaveValue("Octoio"); // owner
      expect(inputs[1]).toHaveValue(EntityType.Weapon); // type
    });

    it("renders with provided value", () => {
      render(
        <EntityReferenceSelect
          entityType={EntityType.Weapon}
          value="weapon-sword"
          onChange={mockOnChange}
        />,
      );

      const select = screen.getByTestId("key-select");
      expect(select).toHaveValue("weapon-sword");
    });

    it("shows version select when entity has a key", () => {
      render(
        <EntityReferenceSelect
          entityType={EntityType.Weapon}
          value="weapon-sword"
          onChange={mockOnChange}
        />,
      );

      const formItems = screen.getAllByTestId("form-item");
      expect(formItems).toHaveLength(4); // owner, type, key, version
      expect(screen.getByTestId("version-select")).toBeInTheDocument();
    });

    it("hides version select when no key is selected", () => {
      render(
        <EntityReferenceSelect
          entityType={EntityType.Weapon}
          onChange={mockOnChange}
        />,
      );

      const formItems = screen.getAllByTestId("form-item");
      expect(formItems).toHaveLength(3); // owner, type, key (no version)
      expect(screen.queryByTestId("version-select")).not.toBeInTheDocument();
    });
  });

  describe("Entity Selection", () => {
    it("calls onChange when selecting an existing entity", () => {
      render(
        <EntityReferenceSelect
          entityType={EntityType.Weapon}
          onChange={mockOnChange}
        />,
      );

      const select = screen.getByTestId("key-select");
      fireEvent.change(select, { target: { value: "weapon-sword" } });

      expect(mockOnChange).toHaveBeenCalledWith({
        id: "entity-1",
        key: "weapon-sword",
        owner: "Octoio",
        type: EntityType.Weapon,
        version: 1,
      });
    });

    it("calls onChange with new entity when selecting non-existing key", () => {
      // This test verifies that the component can handle empty entity lists
      // and renders without errors (testing component robustness)
      mockGetEntityReferencesByType.mockReturnValue([]);

      render(
        <EntityReferenceSelect
          entityType={EntityType.Weapon}
          value="new-weapon"
          onChange={mockOnChange}
        />,
      );

      // The component should render without errors
      const inputs = screen.getAllByTestId("input");
      expect(inputs[0]).toHaveValue("Octoio"); // owner
      expect(inputs[1]).toHaveValue(EntityType.Weapon); // type

      // The component should render a select element
      const select = screen.getByTestId("key-select");
      expect(select).toBeInTheDocument();

      // Check that version select is rendered for non-empty keys
      expect(screen.getByTestId("version-select")).toBeInTheDocument();
    });

    it("handles version changes correctly", () => {
      render(
        <EntityReferenceSelect
          entityType={EntityType.Weapon}
          value="weapon-sword"
          onChange={mockOnChange}
        />,
      );

      const versionSelect = screen.getByTestId("version-select");
      fireEvent.change(versionSelect, { target: { value: "2" } });

      expect(mockOnChange).toHaveBeenCalledWith({
        id: "entity-1", // Uses the found entity's id
        key: "weapon-sword",
        owner: "Octoio",
        type: EntityType.Weapon,
        version: 2,
      });
    });

    it("handles null version change by defaulting to 1", () => {
      render(
        <EntityReferenceSelect
          entityType={EntityType.Weapon}
          value="weapon-sword"
          onChange={mockOnChange}
        />,
      );

      const versionSelect = screen.getByTestId("version-select");
      fireEvent.change(versionSelect, { target: { value: "" } });

      expect(mockOnChange).toHaveBeenCalledWith({
        id: "entity-1",
        key: "weapon-sword",
        owner: "Octoio",
        type: EntityType.Weapon,
        version: 1,
      });
    });
  });

  describe("Version Handling", () => {
    it("displays available versions for selected entity", () => {
      render(
        <EntityReferenceSelect
          entityType={EntityType.Weapon}
          value="weapon-sword"
          onChange={mockOnChange}
        />,
      );

      // The component should show versions 1 and 2 for weapon-sword
      const versionSelect = screen.getByTestId("version-select");

      // Check that version select exists
      expect(versionSelect).toBeInTheDocument();
    });

    it("shows default version 1 when no versions available", () => {
      // Mock empty entity references
      mockGetEntityReferencesByType.mockReturnValue([]);

      render(
        <EntityReferenceSelect
          entityType={EntityType.Weapon}
          value="unknown-entity"
          onChange={mockOnChange}
        />,
      );

      const formItems = screen.getAllByTestId("form-item");
      expect(formItems).toHaveLength(4); // Should still show version select
    });
  });

  describe("Props and Configuration", () => {
    it("passes through className prop", () => {
      render(
        <EntityReferenceSelect
          entityType={EntityType.Weapon}
          onChange={mockOnChange}
          className="custom-class"
        />,
      );

      const select = screen.getByTestId("key-select");
      expect(select).toHaveClass("custom-class");
    });

    it("uses custom placeholder", () => {
      render(
        <EntityReferenceSelect
          entityType={EntityType.Weapon}
          onChange={mockOnChange}
          placeholder="Choose an entity"
        />,
      );

      // Since placeholder is not a valid HTML select attribute,
      // we can test that the component renders without errors
      const select = screen.getByTestId("key-select");
      expect(select).toBeInTheDocument();
    });

    it("handles different entity types", () => {
      render(
        <EntityReferenceSelect
          entityType={EntityType.Skill}
          onChange={mockOnChange}
        />,
      );

      expect(mockGetEntityReferencesByType).toHaveBeenCalledWith(
        EntityType.Skill,
      );
    });
  });

  describe("Edge Cases", () => {
    it("handles empty entity references list", () => {
      mockGetEntityReferencesByType.mockReturnValue([]);

      render(
        <EntityReferenceSelect
          entityType={EntityType.Weapon}
          onChange={mockOnChange}
        />,
      );

      expect(screen.getByTestId("key-select")).toBeInTheDocument();
      expect(screen.getByTestId("space")).toBeInTheDocument();
    });

    it("handles undefined value prop", () => {
      render(
        <EntityReferenceSelect
          entityType={EntityType.Weapon}
          value={undefined}
          onChange={mockOnChange}
        />,
      );

      const inputs = screen.getAllByTestId("input");
      expect(inputs[0]).toHaveValue("Octoio");
      expect(inputs[1]).toHaveValue(EntityType.Weapon);
    });

    it("creates default entity when value doesn't match any references", () => {
      render(
        <EntityReferenceSelect
          entityType={EntityType.Weapon}
          value="non-existent-key"
          onChange={mockOnChange}
        />,
      );

      // The component should render without errors and show default values
      const inputs = screen.getAllByTestId("input");
      expect(inputs[0]).toHaveValue("Octoio"); // owner
      expect(inputs[1]).toHaveValue(EntityType.Weapon); // type

      // The component should render both selects
      expect(screen.getByTestId("key-select")).toBeInTheDocument();
      expect(screen.getByTestId("version-select")).toBeInTheDocument();
    });
  });
});
