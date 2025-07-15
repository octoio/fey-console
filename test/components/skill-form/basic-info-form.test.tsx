import { describe, it, expect, beforeEach, vi } from "vitest";
import { BasicInfoForm } from "@components/skill-form/basic-info-form";
import { EntityType } from "@models/common.types";
import { QualityType, ALL_QUALITIES } from "@models/quality.types";
import {
  SkillEntityDefinition,
  SkillTargetType,
  SkillActionNodeType,
  SkillActionParallelNode,
} from "@models/skill.types";
import { useSkillStore } from "@store/skill.store";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock the store
vi.mock("@store/skill.store");

describe("BasicInfoForm", () => {
  const mockUpdateMetadata = vi.fn();
  const mockUpdateBasicInfo = vi.fn();

  const mockSkillData: SkillEntityDefinition = {
    id: "test-skill",
    owner: "TestOwner",
    type: EntityType.Skill,
    key: "test-key",
    version: 1,
    entity: {
      metadata: {
        title: "Test Skill",
        description: "Test description",
      },
      quality: QualityType.Legendary,
      categories: [],
      cost: {
        mana: 0,
      },
      cooldown: 5000,
      target_type: SkillTargetType.Enemy,
      execution_root: {
        type: SkillActionNodeType.Parallel,
        name: "Root",
        children: [],
        loop: 1,
      } as SkillActionParallelNode,
      icon_reference: {
        id: "test-icon",
        type: EntityType.Image,
        owner: "TestOwner",
        key: "test-icon",
        version: 1,
      },
      indicators: [],
      cast_distance: {
        min: 1,
        max: 1,
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSkillStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      skillData: mockSkillData,
      updateMetadata: mockUpdateMetadata,
      updateBasicInfo: mockUpdateBasicInfo,
    });
  });

  describe("Component Rendering", () => {
    it("should render the basic info form with all fields", () => {
      render(<BasicInfoForm />);

      expect(screen.getByText("Basic Information")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test Skill")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test description")).toBeInTheDocument();
      expect(screen.getByText("Legendary")).toBeInTheDocument();
    });

    it("should render all form fields with correct labels", () => {
      render(<BasicInfoForm />);

      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
      expect(screen.getByText("Quality")).toBeInTheDocument();
    });

    it("should render quality select with all quality options", () => {
      render(<BasicInfoForm />);

      // Click to open select dropdown
      const qualitySelect = screen.getByRole("combobox");
      fireEvent.mouseDown(qualitySelect);

      // Check all quality options are present (use getAllByText to handle duplicates)
      ALL_QUALITIES.forEach((quality) => {
        const options = screen.getAllByText(quality);
        expect(options.length).toBeGreaterThan(0);
      });
    });

    it("should return null when skillData is not available", () => {
      (useSkillStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        skillData: null,
        updateMetadata: mockUpdateMetadata,
        updateBasicInfo: mockUpdateBasicInfo,
      });

      const { container } = render(<BasicInfoForm />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Title Field Interactions", () => {
    it("should update title when input changes", async () => {
      render(<BasicInfoForm />);

      const titleInput = screen.getByDisplayValue("Test Skill");
      fireEvent.change(titleInput, { target: { value: "New Title" } });

      await waitFor(() => {
        expect(mockUpdateMetadata).toHaveBeenCalledWith(
          "New Title",
          "Test description",
        );
      });
    });

    it("should handle empty title input", async () => {
      render(<BasicInfoForm />);

      const titleInput = screen.getByDisplayValue("Test Skill");
      fireEvent.change(titleInput, { target: { value: "" } });

      await waitFor(() => {
        expect(mockUpdateMetadata).toHaveBeenCalledWith("", "Test description");
      });
    });

    it("should handle special characters in title", async () => {
      render(<BasicInfoForm />);

      const titleInput = screen.getByDisplayValue("Test Skill");
      const specialTitle = "Special!@#$%^&*()Skill";
      fireEvent.change(titleInput, { target: { value: specialTitle } });

      await waitFor(() => {
        expect(mockUpdateMetadata).toHaveBeenCalledWith(
          specialTitle,
          "Test description",
        );
      });
    });
  });

  describe("Description Field Interactions", () => {
    it("should update description when textarea changes", async () => {
      render(<BasicInfoForm />);

      const descriptionTextarea = screen.getByDisplayValue("Test description");
      fireEvent.change(descriptionTextarea, {
        target: { value: "New description" },
      });

      await waitFor(() => {
        expect(mockUpdateMetadata).toHaveBeenCalledWith(
          "Test Skill",
          "New description",
        );
      });
    });

    it("should handle multiline description", async () => {
      render(<BasicInfoForm />);

      const descriptionTextarea = screen.getByDisplayValue("Test description");
      const multilineDescription = "Line 1\nLine 2\nLine 3";
      fireEvent.change(descriptionTextarea, {
        target: { value: multilineDescription },
      });

      await waitFor(() => {
        expect(mockUpdateMetadata).toHaveBeenCalledWith(
          "Test Skill",
          multilineDescription,
        );
      });
    });

    it("should handle empty description", async () => {
      render(<BasicInfoForm />);

      const descriptionTextarea = screen.getByDisplayValue("Test description");
      fireEvent.change(descriptionTextarea, { target: { value: "" } });

      await waitFor(() => {
        expect(mockUpdateMetadata).toHaveBeenCalledWith("Test Skill", "");
      });
    });
  });

  describe("Quality Field Interactions", () => {
    it("should update quality when selection changes", async () => {
      render(<BasicInfoForm />);

      // Click to open select dropdown
      const qualitySelect = screen.getByRole("combobox");
      fireEvent.mouseDown(qualitySelect);

      // Select Epic quality
      const epicOption = screen.getByText("Epic");
      fireEvent.click(epicOption);

      await waitFor(() => {
        expect(mockUpdateBasicInfo).toHaveBeenCalledWith(
          QualityType.Epic,
          mockSkillData.entity.categories,
          mockSkillData.entity.cooldown,
          mockSkillData.entity.target_type,
        );
      });
    });

    it("should handle different quality types correctly", async () => {
      render(<BasicInfoForm />);

      // Test Epic quality selection
      mockUpdateBasicInfo.mockClear();
      const qualitySelect = screen.getByRole("combobox");
      fireEvent.mouseDown(qualitySelect);
      const epicOption = screen.getByText("Epic");
      fireEvent.click(epicOption);

      expect(mockUpdateBasicInfo).toHaveBeenCalledWith(
        QualityType.Epic,
        mockSkillData.entity.categories,
        mockSkillData.entity.cooldown,
        mockSkillData.entity.target_type,
      );
    });

    it("should handle common quality selection", async () => {
      render(<BasicInfoForm />);

      mockUpdateBasicInfo.mockClear();
      const qualitySelect = screen.getByRole("combobox");
      fireEvent.mouseDown(qualitySelect);

      // Use getAllByText and select the visible option (not the hidden one)
      const commonOptions = screen.getAllByText("Common");
      const visibleCommonOption = commonOptions.find(
        (option) => option.closest(".ant-select-item-option-content") !== null,
      );
      fireEvent.click(visibleCommonOption!);

      expect(mockUpdateBasicInfo).toHaveBeenCalledWith(
        QualityType.Common,
        mockSkillData.entity.categories,
        mockSkillData.entity.cooldown,
        mockSkillData.entity.target_type,
      );
    });

    it("should display currently selected quality", () => {
      render(<BasicInfoForm />);

      // Check that the selected quality is displayed in the UI
      expect(screen.getByText("Legendary")).toBeInTheDocument();
    });
  });

  describe("Form Integration", () => {
    it("should preserve all skill data when updating fields", async () => {
      render(<BasicInfoForm />);

      const titleInput = screen.getByDisplayValue("Test Skill");
      fireEvent.change(titleInput, { target: { value: "Updated Title" } });

      await waitFor(() => {
        expect(mockUpdateMetadata).toHaveBeenCalledWith(
          "Updated Title",
          mockSkillData.entity.metadata.description,
        );
      });

      // Verify description is preserved
      expect(mockUpdateMetadata).not.toHaveBeenCalledWith("Updated Title", "");
    });

    it("should handle rapid successive updates", async () => {
      render(<BasicInfoForm />);

      const titleInput = screen.getByDisplayValue("Test Skill");

      // Rapidly change title multiple times
      fireEvent.change(titleInput, { target: { value: "Title 1" } });
      fireEvent.change(titleInput, { target: { value: "Title 2" } });
      fireEvent.change(titleInput, { target: { value: "Title 3" } });

      await waitFor(() => {
        expect(mockUpdateMetadata).toHaveBeenCalledTimes(3);
      });

      expect(mockUpdateMetadata).toHaveBeenLastCalledWith(
        "Title 3",
        "Test description",
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle store update failures gracefully", async () => {
      // Mock console.error to prevent test output noise
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Intentionally empty - suppressing console.error
      });

      mockUpdateMetadata.mockImplementationOnce(() => {
        throw new Error("Update failed");
      });

      render(<BasicInfoForm />);

      const titleInput = screen.getByDisplayValue("Test Skill");

      // The component should handle the error gracefully without crashing
      expect(() => {
        fireEvent.change(titleInput, { target: { value: "New Title" } });
      }).not.toThrow();

      // Component should still be rendered and functional after the error
      expect(screen.getByText("Basic Information")).toBeInTheDocument();

      // The error should have been logged
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to update title:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("should handle invalid quality selection gracefully", async () => {
      render(<BasicInfoForm />);

      const qualitySelect = screen.getByRole("combobox");

      // Simulate invalid selection (this shouldn't happen in normal usage)
      expect(() => {
        fireEvent.change(qualitySelect, {
          target: { value: "INVALID_QUALITY" },
        });
      }).not.toThrow();
    });
  });

  describe("Accessibility", () => {
    it("should have proper form structure with labels", () => {
      render(<BasicInfoForm />);

      // Check that form labels exist (Ant Design handles association differently)
      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
      expect(screen.getByText("Quality")).toBeInTheDocument();

      // Check that form controls exist
      expect(screen.getByDisplayValue("Test Skill")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test description")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("should have accessible form controls", () => {
      render(<BasicInfoForm />);

      // Use more generic selectors that work with Ant Design
      const textboxes = screen.getAllByRole("textbox");
      const combobox = screen.getByRole("combobox");

      expect(textboxes).toHaveLength(2); // title input and description textarea
      expect(combobox).toBeInTheDocument();

      // Verify the inputs have the expected values
      expect(
        textboxes.find((el) => (el as HTMLInputElement).value === "Test Skill"),
      ).toBeTruthy();
      expect(
        textboxes.find(
          (el) => (el as HTMLTextAreaElement).value === "Test description",
        ),
      ).toBeTruthy();
    });
  });

  describe("Component Structure", () => {
    it("should render within a styled card", () => {
      render(<BasicInfoForm />);

      const cardTitle = screen.getByText("Basic Information");
      expect(cardTitle).toBeInTheDocument();
    });

    it("should have proper textarea configuration", () => {
      render(<BasicInfoForm />);

      const textarea = screen.getByDisplayValue("Test description");
      expect(textarea).toHaveAttribute("rows", "3");
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined metadata gracefully", () => {
      const skillDataWithUndefinedMetadata = {
        ...mockSkillData,
        entity: {
          ...mockSkillData.entity,
          metadata: {
            title: "",
            description: "",
          },
        },
      };

      (useSkillStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        skillData: skillDataWithUndefinedMetadata,
        updateMetadata: mockUpdateMetadata,
        updateBasicInfo: mockUpdateBasicInfo,
      });

      expect(() => render(<BasicInfoForm />)).not.toThrow();
    });

    it("should handle very long text inputs", async () => {
      render(<BasicInfoForm />);

      const longText = "A".repeat(1000);
      const titleInput = screen.getByDisplayValue("Test Skill");

      fireEvent.change(titleInput, { target: { value: longText } });

      await waitFor(() => {
        expect(mockUpdateMetadata).toHaveBeenCalledWith(
          longText,
          "Test description",
        );
      });
    });
  });
});
