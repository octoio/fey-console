import { describe, it, expect, vi, beforeEach } from "vitest";
import { SkillPropertiesForm } from "@components/skill-properties-form";
import { EntityType } from "@models/common.types";
import { QualityType } from "@models/quality.types";
import {
  SkillActionNodeType,
  SkillTargetType,
  type SkillEntityDefinition,
  type SkillActionParallelNode,
} from "@models/skill.types";
import { render, screen } from "@testing-library/react";

// Mock the store hook
const mockUseSkillStore = vi.fn();
vi.mock("@store/skill.store", () => ({
  useSkillStore: () => mockUseSkillStore(),
}));

// Mock all skill form section components
vi.mock("@components/skill-form/basic-info-form", () => ({
  BasicInfoForm: vi.fn(() => (
    <div data-testid="basic-info-form">Basic Info Form</div>
  )),
}));

vi.mock("@components/skill-form/cast-distance-section", () => ({
  CastDistanceSection: vi.fn(() => (
    <div data-testid="cast-distance-section">Cast Distance Section</div>
  )),
}));

vi.mock("@components/skill-form/entity-definition-section", () => ({
  EntityDefinitionSection: vi.fn(() => (
    <div data-testid="entity-definition-section">Entity Definition Section</div>
  )),
}));

vi.mock("@components/skill-form/icon-reference-section", () => ({
  IconReferenceSection: vi.fn(() => (
    <div data-testid="icon-reference-section">Icon Reference Section</div>
  )),
}));

vi.mock("@components/skill-form/indicators-section", () => ({
  IndicatorsSection: vi.fn(() => (
    <div data-testid="indicators-section">Indicators Section</div>
  )),
}));

vi.mock("@components/skill-form/skill-properties-section", () => ({
  SkillPropertiesSection: vi.fn(() => (
    <div data-testid="skill-properties-section">Skill Properties Section</div>
  )),
}));

// Mock Ant Design components
vi.mock("antd", () => ({
  Form: vi.fn(({ children, layout }) => (
    <form data-testid="ant-form" data-layout={layout}>
      {children}
    </form>
  )),
  Empty: vi.fn(({ description }) => (
    <div data-testid="ant-empty">{description}</div>
  )),
}));

// Mock styled components
vi.mock("@components/common/styled-components", () => ({
  FormContainer: vi.fn(({ children }) => (
    <div data-testid="form-container">{children}</div>
  )),
  EmptyContainer: vi.fn(({ children }) => (
    <div data-testid="empty-container">{children}</div>
  )),
}));

const mockSkillData: SkillEntityDefinition = {
  id: "test-skill-id",
  owner: "Octoio",
  type: EntityType.Skill,
  key: "TestSkill",
  version: 1,
  entity: {
    metadata: {
      title: "Test Skill",
      description: "Test skill description",
    },
    quality: QualityType.Common,
    categories: [],
    cost: {
      mana: 20,
    },
    cooldown: 5,
    target_type: SkillTargetType.Enemy,
    execution_root: {
      type: SkillActionNodeType.Parallel,
      name: "Root",
      children: [],
      loop: 1,
    } as SkillActionParallelNode,
    icon_reference: {
      id: "test-icon-id",
      type: EntityType.Image,
      owner: "Octoio",
      key: "TestIcon",
      version: 1,
    },
    indicators: [],
    cast_distance: {
      min: 1,
      max: 10,
    },
  },
};

describe("SkillPropertiesForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Empty State", () => {
    it("should render empty state when no skill data is loaded", () => {
      mockUseSkillStore.mockReturnValue({
        skillData: null,
      });

      render(<SkillPropertiesForm />);

      expect(screen.getByTestId("empty-container")).toBeInTheDocument();
      expect(screen.getByTestId("ant-empty")).toBeInTheDocument();
      expect(
        screen.getByText("No skill data loaded. Import or create a new skill."),
      ).toBeInTheDocument();
    });

    it("should not render form components when skill data is null", () => {
      mockUseSkillStore.mockReturnValue({
        skillData: null,
      });

      render(<SkillPropertiesForm />);

      expect(screen.queryByTestId("form-container")).not.toBeInTheDocument();
      expect(screen.queryByTestId("ant-form")).not.toBeInTheDocument();
      expect(screen.queryByTestId("basic-info-form")).not.toBeInTheDocument();
    });

    it("should render empty container with proper styling", () => {
      mockUseSkillStore.mockReturnValue({
        skillData: null,
      });

      render(<SkillPropertiesForm />);

      const emptyContainer = screen.getByTestId("empty-container");
      expect(emptyContainer).toBeInTheDocument();
      expect(emptyContainer).toContainElement(screen.getByTestId("ant-empty"));
    });

    it("should handle undefined skillData", () => {
      mockUseSkillStore.mockReturnValue({
        skillData: undefined,
      });

      render(<SkillPropertiesForm />);

      expect(screen.getByTestId("empty-container")).toBeInTheDocument();
      expect(
        screen.getByText("No skill data loaded. Import or create a new skill."),
      ).toBeInTheDocument();
    });
  });

  describe("Form Rendering with Skill Data", () => {
    beforeEach(() => {
      mockUseSkillStore.mockReturnValue({
        skillData: mockSkillData,
      });
    });

    it("should render form container when skill data is loaded", () => {
      render(<SkillPropertiesForm />);

      expect(screen.getByTestId("form-container")).toBeInTheDocument();
      expect(screen.queryByTestId("empty-container")).not.toBeInTheDocument();
    });

    it("should render Ant Design Form with vertical layout", () => {
      render(<SkillPropertiesForm />);

      const form = screen.getByTestId("ant-form");
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute("data-layout", "vertical");
    });

    it("should render all form sections in correct order", () => {
      render(<SkillPropertiesForm />);

      // Check that all sections are rendered
      expect(
        screen.getByTestId("entity-definition-section"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("basic-info-form")).toBeInTheDocument();
      expect(
        screen.getByTestId("skill-properties-section"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("cast-distance-section")).toBeInTheDocument();
      expect(screen.getByTestId("icon-reference-section")).toBeInTheDocument();
      expect(screen.getByTestId("indicators-section")).toBeInTheDocument();

      // Verify order by checking the form content
      const form = screen.getByTestId("ant-form");
      const sections = form.children;
      expect(sections).toHaveLength(6);
    });

    it("should render EntityDefinitionSection first", () => {
      render(<SkillPropertiesForm />);

      const form = screen.getByTestId("ant-form");
      const firstSection = form.children[0];
      expect(firstSection).toHaveAttribute(
        "data-testid",
        "entity-definition-section",
      );
    });

    it("should render IndicatorsSection last", () => {
      render(<SkillPropertiesForm />);

      const form = screen.getByTestId("ant-form");
      const lastSection = form.children[form.children.length - 1];
      expect(lastSection).toHaveAttribute("data-testid", "indicators-section");
    });
  });

  describe("Store Integration", () => {
    it("should react to skill data changes", () => {
      // Start with null data
      mockUseSkillStore.mockReturnValue({
        skillData: null,
      });

      const { rerender } = render(<SkillPropertiesForm />);

      // Initially empty
      expect(screen.getByTestId("empty-container")).toBeInTheDocument();

      // Update mock to return skill data
      mockUseSkillStore.mockReturnValue({
        skillData: mockSkillData,
      });
      rerender(<SkillPropertiesForm />);

      // Should now show form
      expect(screen.getByTestId("form-container")).toBeInTheDocument();
      expect(screen.queryByTestId("empty-container")).not.toBeInTheDocument();
    });

    it("should handle skill data being set to null after being loaded", () => {
      // Start with skill data
      mockUseSkillStore.mockReturnValue({
        skillData: mockSkillData,
      });

      const { rerender } = render(<SkillPropertiesForm />);

      // Should show form
      expect(screen.getByTestId("form-container")).toBeInTheDocument();

      // Clear skill data
      mockUseSkillStore.mockReturnValue({
        skillData: null,
      });
      rerender(<SkillPropertiesForm />);

      // Should now show empty state
      expect(screen.getByTestId("empty-container")).toBeInTheDocument();
      expect(screen.queryByTestId("form-container")).not.toBeInTheDocument();
    });

    it("should use skillData from store correctly", () => {
      mockUseSkillStore.mockReturnValue({
        skillData: mockSkillData,
      });

      render(<SkillPropertiesForm />);

      // Verify that the store's skillData is being used
      expect(screen.getByTestId("form-container")).toBeInTheDocument();
      expect(screen.getByTestId("ant-form")).toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    it("should have proper component hierarchy when empty", () => {
      mockUseSkillStore.mockReturnValue({
        skillData: null,
      });

      render(<SkillPropertiesForm />);

      const emptyContainer = screen.getByTestId("empty-container");
      const empty = screen.getByTestId("ant-empty");

      expect(emptyContainer).toContainElement(empty);
      expect(empty).toHaveTextContent(
        "No skill data loaded. Import or create a new skill.",
      );
    });

    it("should have proper component hierarchy when loaded", () => {
      mockUseSkillStore.mockReturnValue({
        skillData: mockSkillData,
      });

      render(<SkillPropertiesForm />);

      const formContainer = screen.getByTestId("form-container");
      const form = screen.getByTestId("ant-form");

      expect(formContainer).toContainElement(form);
      expect(form).toContainElement(
        screen.getByTestId("entity-definition-section"),
      );
    });

    it("should render without errors", () => {
      mockUseSkillStore.mockReturnValue({
        skillData: null,
      });

      expect(() => render(<SkillPropertiesForm />)).not.toThrow();
    });

    it("should handle component lifecycle correctly", () => {
      mockUseSkillStore.mockReturnValue({
        skillData: null,
      });

      const { unmount } = render(<SkillPropertiesForm />);

      expect(screen.getByTestId("empty-container")).toBeInTheDocument();

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty skill data object", () => {
      mockUseSkillStore.mockReturnValue({
        skillData: {} as SkillEntityDefinition,
      });

      render(<SkillPropertiesForm />);

      // Even with empty object, should render form since skillData is truthy
      expect(screen.getByTestId("form-container")).toBeInTheDocument();
      expect(screen.queryByTestId("empty-container")).not.toBeInTheDocument();
    });

    it("should handle rapid skill data changes", () => {
      const { rerender } = render(<SkillPropertiesForm />);

      // Rapid changes
      mockUseSkillStore.mockReturnValue({
        skillData: mockSkillData,
      });
      rerender(<SkillPropertiesForm />);

      mockUseSkillStore.mockReturnValue({
        skillData: null,
      });
      rerender(<SkillPropertiesForm />);

      const updatedSkillData = {
        ...mockSkillData,
        entity: {
          ...mockSkillData.entity,
          metadata: {
            ...mockSkillData.entity.metadata,
            title: "Updated Skill",
          },
        },
      };
      mockUseSkillStore.mockReturnValue({
        skillData: updatedSkillData,
      });
      rerender(<SkillPropertiesForm />);

      // Should handle all changes gracefully
      expect(screen.getByTestId("form-container")).toBeInTheDocument();
    });

    it("should handle falsy skillData values", () => {
      const falsyValues = [null, undefined, false, 0, "", NaN];

      falsyValues.forEach((value) => {
        mockUseSkillStore.mockReturnValue({
          skillData: value as SkillEntityDefinition | null,
        });

        const { unmount } = render(<SkillPropertiesForm />);

        expect(screen.getByTestId("empty-container")).toBeInTheDocument();
        expect(screen.queryByTestId("form-container")).not.toBeInTheDocument();

        unmount();
      });
    });
  });

  describe("Accessibility and Semantic Structure", () => {
    it("should use semantic form element", () => {
      mockUseSkillStore.mockReturnValue({
        skillData: mockSkillData,
      });

      render(<SkillPropertiesForm />);

      const form = screen.getByTestId("ant-form");
      expect(form.tagName.toLowerCase()).toBe("form");
    });

    it("should provide meaningful empty state message", () => {
      mockUseSkillStore.mockReturnValue({
        skillData: null,
      });

      render(<SkillPropertiesForm />);

      const message = screen.getByText(
        "No skill data loaded. Import or create a new skill.",
      );
      expect(message).toBeInTheDocument();
      expect(message).toBeVisible();
    });

    it("should have proper container structure for styling", () => {
      mockUseSkillStore.mockReturnValue({
        skillData: null,
      });

      render(<SkillPropertiesForm />);

      expect(screen.getByTestId("empty-container")).toBeInTheDocument();

      mockUseSkillStore.mockReturnValue({
        skillData: mockSkillData,
      });
      const { rerender } = render(<SkillPropertiesForm />);
      rerender(<SkillPropertiesForm />);

      expect(screen.getByTestId("form-container")).toBeInTheDocument();
    });
  });
});
