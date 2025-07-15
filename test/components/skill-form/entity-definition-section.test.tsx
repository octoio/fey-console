import { describe, it, expect, beforeEach, vi } from "vitest";
import { EntityDefinitionSection } from "@components/skill-form/entity-definition-section";
import { EntityType } from "@models/common.types";
import { QualityType } from "@models/quality.types";
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

describe("EntityDefinitionSection", () => {
  const mockUpdateEntityDefinition = vi.fn();

  const mockSkillData: SkillEntityDefinition = {
    id: "TestOwner:Skill:test-key:1",
    owner: "TestOwner",
    type: EntityType.Skill,
    key: "test-key",
    version: 1,
    entity: {
      metadata: {
        title: "Test Skill",
        description: "Test description",
      },
      quality: QualityType.Common,
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
        min: 1.0,
        max: 5.0,
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSkillStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      skillData: mockSkillData,
      updateEntityDefinition: mockUpdateEntityDefinition,
    });
  });

  describe("Component Rendering", () => {
    it("should render the entity definition section with all fields", () => {
      render(<EntityDefinitionSection />);

      expect(screen.getByText("Entity Definition")).toBeInTheDocument();
      expect(screen.getByText("Owner")).toBeInTheDocument();
      expect(screen.getByText("Type")).toBeInTheDocument();
      expect(screen.getByText("Key")).toBeInTheDocument();
      expect(screen.getByText("Version")).toBeInTheDocument();
      expect(screen.getByText("Generated ID")).toBeInTheDocument();
    });

    it("should render with correct initial values", () => {
      render(<EntityDefinitionSection />);

      expect(screen.getByDisplayValue("TestOwner")).toBeInTheDocument();
      expect(screen.getByText("Skill")).toBeInTheDocument();
      expect(screen.getByDisplayValue("test-key")).toBeInTheDocument();
      expect(screen.getByDisplayValue("1")).toBeInTheDocument();
      expect(
        screen.getByDisplayValue("TestOwner:Skill:test-key:1"),
      ).toBeInTheDocument();
    });

    it("should return null when skillData is not available", () => {
      (useSkillStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        skillData: null,
        updateEntityDefinition: mockUpdateEntityDefinition,
      });

      const { container } = render(<EntityDefinitionSection />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Owner Field Interactions", () => {
    it("should update owner when input changes", async () => {
      render(<EntityDefinitionSection />);

      const ownerInput = screen.getByDisplayValue("TestOwner");
      fireEvent.change(ownerInput, { target: { value: "NewOwner" } });

      await waitFor(() => {
        expect(mockUpdateEntityDefinition).toHaveBeenCalledWith({
          ...mockSkillData,
          owner: "NewOwner",
          id: "NewOwner:Skill:test-key:1",
        });
      });
    });

    it("should handle empty owner input", async () => {
      render(<EntityDefinitionSection />);

      const ownerInput = screen.getByDisplayValue("TestOwner");
      fireEvent.change(ownerInput, { target: { value: "" } });

      await waitFor(() => {
        expect(mockUpdateEntityDefinition).toHaveBeenCalledWith({
          ...mockSkillData,
          owner: "",
          id: ":Skill:test-key:1",
        });
      });
    });

    it("should handle special characters in owner", async () => {
      render(<EntityDefinitionSection />);

      const ownerInput = screen.getByDisplayValue("TestOwner");
      fireEvent.change(ownerInput, { target: { value: "My-Company_2024" } });

      await waitFor(() => {
        expect(mockUpdateEntityDefinition).toHaveBeenCalledWith({
          ...mockSkillData,
          owner: "My-Company_2024",
          id: "My-Company_2024:Skill:test-key:1",
        });
      });
    });
  });

  describe("Type Field Interactions", () => {
    it("should display the type select as disabled", () => {
      render(<EntityDefinitionSection />);

      // Check that "Skill" text is displayed and the select is disabled
      expect(screen.getByText("Skill")).toBeInTheDocument();

      // Check for disabled attribute on the select
      const selectInput = screen.getByRole("combobox");
      expect(selectInput).toBeDisabled();
    });

    it("should show only Skill option in the select", () => {
      render(<EntityDefinitionSection />);

      expect(screen.getByText("Skill")).toBeInTheDocument();

      // The select should be disabled so type can't be changed
      const selectInput = screen.getByRole("combobox");
      expect(selectInput).toHaveAttribute("disabled");
    });
  });

  describe("Key Field Interactions", () => {
    it("should update key when input changes", async () => {
      render(<EntityDefinitionSection />);

      const keyInput = screen.getByDisplayValue("test-key");
      fireEvent.change(keyInput, { target: { value: "new-skill-key" } });

      await waitFor(() => {
        expect(mockUpdateEntityDefinition).toHaveBeenCalledWith({
          ...mockSkillData,
          key: "new-skill-key",
          id: "TestOwner:Skill:new-skill-key:1",
        });
      });
    });

    it("should handle empty key input", async () => {
      render(<EntityDefinitionSection />);

      const keyInput = screen.getByDisplayValue("test-key");
      fireEvent.change(keyInput, { target: { value: "" } });

      await waitFor(() => {
        expect(mockUpdateEntityDefinition).toHaveBeenCalledWith({
          ...mockSkillData,
          key: "",
          id: "TestOwner:Skill::1",
        });
      });
    });

    it("should handle special characters in key", async () => {
      render(<EntityDefinitionSection />);

      const keyInput = screen.getByDisplayValue("test-key");
      fireEvent.change(keyInput, { target: { value: "fire-ball_v2" } });

      await waitFor(() => {
        expect(mockUpdateEntityDefinition).toHaveBeenCalledWith({
          ...mockSkillData,
          key: "fire-ball_v2",
          id: "TestOwner:Skill:fire-ball_v2:1",
        });
      });
    });
  });

  describe("Version Field Interactions", () => {
    it("should update version when input changes", async () => {
      render(<EntityDefinitionSection />);

      const versionInput = screen.getByDisplayValue("1");
      fireEvent.change(versionInput, { target: { value: "2" } });

      await waitFor(() => {
        expect(mockUpdateEntityDefinition).toHaveBeenCalledWith({
          ...mockSkillData,
          version: 2,
          id: "TestOwner:Skill:test-key:2",
        });
      });
    });

    it("should handle decimal version input by converting to integer", async () => {
      render(<EntityDefinitionSection />);

      const versionInput = screen.getByDisplayValue("1");
      fireEvent.change(versionInput, { target: { value: "3.7" } });

      await waitFor(() => {
        expect(mockUpdateEntityDefinition).toHaveBeenCalledWith({
          ...mockSkillData,
          version: 3,
          id: "TestOwner:Skill:test-key:3",
        });
      });
    });

    it("should handle zero version input by defaulting to 1", async () => {
      render(<EntityDefinitionSection />);

      const versionInput = screen.getByDisplayValue("1");
      fireEvent.change(versionInput, { target: { value: "0" } });

      await waitFor(() => {
        expect(mockUpdateEntityDefinition).toHaveBeenCalledWith({
          ...mockSkillData,
          version: 1,
          id: "TestOwner:Skill:test-key:1",
        });
      });
    });

    it("should handle negative version input by defaulting to 1", async () => {
      render(<EntityDefinitionSection />);

      const versionInput = screen.getByDisplayValue("1");
      fireEvent.change(versionInput, { target: { value: "-5" } });

      await waitFor(() => {
        expect(mockUpdateEntityDefinition).toHaveBeenCalledWith({
          ...mockSkillData,
          version: 1,
          id: "TestOwner:Skill:test-key:1",
        });
      });
    });

    it("should handle invalid version input by defaulting to 1", async () => {
      render(<EntityDefinitionSection />);

      const versionInput = screen.getByDisplayValue("1");
      fireEvent.change(versionInput, { target: { value: "invalid" } });

      await waitFor(() => {
        expect(mockUpdateEntityDefinition).toHaveBeenCalledWith({
          ...mockSkillData,
          version: 1,
          id: "TestOwner:Skill:test-key:1",
        });
      });
    });

    it("should handle empty version input by defaulting to 1", async () => {
      render(<EntityDefinitionSection />);

      const versionInput = screen.getByDisplayValue("1");
      fireEvent.change(versionInput, { target: { value: "" } });

      await waitFor(() => {
        expect(mockUpdateEntityDefinition).toHaveBeenCalledWith({
          ...mockSkillData,
          version: 1,
          id: "TestOwner:Skill:test-key:1",
        });
      });
    });
  });

  describe("Generated ID Functionality", () => {
    it("should display generated ID based on current values", () => {
      render(<EntityDefinitionSection />);

      const idInput = screen.getByDisplayValue("TestOwner:Skill:test-key:1");
      expect(idInput).toBeInTheDocument();
      expect(idInput).toHaveAttribute("readOnly");
    });

    it("should update generated ID when owner changes", () => {
      const { rerender } = render(<EntityDefinitionSection />);

      // Simulate store update with new owner
      const updatedSkillData = {
        ...mockSkillData,
        owner: "NewOwner",
        id: "NewOwner:Skill:test-key:1",
      };

      (useSkillStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        skillData: updatedSkillData,
        updateEntityDefinition: mockUpdateEntityDefinition,
      });

      rerender(<EntityDefinitionSection />);

      expect(
        screen.getByDisplayValue("NewOwner:Skill:test-key:1"),
      ).toBeInTheDocument();
    });

    it("should update generated ID when key changes", () => {
      const { rerender } = render(<EntityDefinitionSection />);

      // Simulate store update with new key
      const updatedSkillData = {
        ...mockSkillData,
        key: "new-key",
        id: "TestOwner:Skill:new-key:1",
      };

      (useSkillStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        skillData: updatedSkillData,
        updateEntityDefinition: mockUpdateEntityDefinition,
      });

      rerender(<EntityDefinitionSection />);

      expect(
        screen.getByDisplayValue("TestOwner:Skill:new-key:1"),
      ).toBeInTheDocument();
    });

    it("should update generated ID when version changes", () => {
      const { rerender } = render(<EntityDefinitionSection />);

      // Simulate store update with new version
      const updatedSkillData = {
        ...mockSkillData,
        version: 3,
        id: "TestOwner:Skill:test-key:3",
      };

      (useSkillStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        skillData: updatedSkillData,
        updateEntityDefinition: mockUpdateEntityDefinition,
      });

      rerender(<EntityDefinitionSection />);

      expect(
        screen.getByDisplayValue("TestOwner:Skill:test-key:3"),
      ).toBeInTheDocument();
    });
  });

  describe("Form Integration", () => {
    it("should preserve all entity data when updating owner", async () => {
      render(<EntityDefinitionSection />);

      const ownerInput = screen.getByDisplayValue("TestOwner");
      fireEvent.change(ownerInput, { target: { value: "UpdatedOwner" } });

      await waitFor(() => {
        expect(mockUpdateEntityDefinition).toHaveBeenCalledWith({
          ...mockSkillData,
          owner: "UpdatedOwner",
          id: "UpdatedOwner:Skill:test-key:1",
        });
      });

      // Verify other fields are preserved
      const call = mockUpdateEntityDefinition.mock.calls[0][0];
      expect(call.type).toBe(EntityType.Skill);
      expect(call.key).toBe("test-key");
      expect(call.version).toBe(1);
      expect(call.entity).toEqual(mockSkillData.entity);
    });

    it("should handle rapid successive updates", async () => {
      render(<EntityDefinitionSection />);

      const ownerInput = screen.getByDisplayValue("TestOwner");

      // Simulate rapid changes
      fireEvent.change(ownerInput, { target: { value: "Owner1" } });
      fireEvent.change(ownerInput, { target: { value: "Owner2" } });
      fireEvent.change(ownerInput, { target: { value: "Owner3" } });

      await waitFor(() => {
        expect(mockUpdateEntityDefinition).toHaveBeenCalledTimes(3);
        expect(mockUpdateEntityDefinition).toHaveBeenLastCalledWith({
          ...mockSkillData,
          owner: "Owner3",
          id: "Owner3:Skill:test-key:1",
        });
      });
    });
  });

  describe("Input Configuration", () => {
    it("should have correct input field configurations", () => {
      render(<EntityDefinitionSection />);

      const ownerInput = screen.getByDisplayValue("TestOwner");
      const keyInput = screen.getByDisplayValue("test-key");
      const versionInput = screen.getByDisplayValue("1");
      const idInput = screen.getByDisplayValue("TestOwner:Skill:test-key:1");

      expect(ownerInput).toHaveAttribute(
        "placeholder",
        "Entity owner (e.g., Octoio)",
      );
      expect(keyInput).toHaveAttribute(
        "placeholder",
        "Unique identifier for this skill",
      );
      expect(versionInput).toHaveAttribute("type", "number");
      expect(versionInput).toHaveAttribute("min", "1");
      expect(idInput).toHaveAttribute("readOnly");
    });

    it("should display current entity definition values", () => {
      render(<EntityDefinitionSection />);

      expect(screen.getByDisplayValue("TestOwner")).toBeInTheDocument();
      expect(screen.getByText("Skill")).toBeInTheDocument();
      expect(screen.getByDisplayValue("test-key")).toBeInTheDocument();
      expect(screen.getByDisplayValue("1")).toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    it("should render within a styled card", () => {
      render(<EntityDefinitionSection />);

      const cardTitle = screen.getByText("Entity Definition");
      expect(cardTitle).toBeInTheDocument();
    });

    it("should have proper form structure with labels", () => {
      render(<EntityDefinitionSection />);

      expect(screen.getByText("Owner")).toBeInTheDocument();
      expect(screen.getByText("Type")).toBeInTheDocument();
      expect(screen.getByText("Key")).toBeInTheDocument();
      expect(screen.getByText("Version")).toBeInTheDocument();
      expect(screen.getByText("Generated ID")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should handle store update failures gracefully for owner", async () => {
      // Mock console.error to prevent test output noise
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Intentionally empty - suppressing console.error
      });

      mockUpdateEntityDefinition.mockImplementationOnce(() => {
        throw new Error("Update failed");
      });

      render(<EntityDefinitionSection />);

      const ownerInput = screen.getByDisplayValue("TestOwner");

      // The component should handle the error gracefully without crashing
      expect(() => {
        fireEvent.change(ownerInput, { target: { value: "NewOwner" } });
      }).not.toThrow();

      // Component should still be rendered and functional after the error
      expect(screen.getByText("Entity Definition")).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it("should handle store update failures gracefully for key", async () => {
      // Mock console.error to prevent test output noise
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Intentionally empty - suppressing console.error
      });

      mockUpdateEntityDefinition.mockImplementationOnce(() => {
        throw new Error("Update failed");
      });

      render(<EntityDefinitionSection />);

      const keyInput = screen.getByDisplayValue("test-key");

      // The component should handle the error gracefully without crashing
      expect(() => {
        fireEvent.change(keyInput, { target: { value: "new-key" } });
      }).not.toThrow();

      // Component should still be rendered and functional after the error
      expect(screen.getByText("Entity Definition")).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it("should handle store update failures gracefully for version", async () => {
      // Mock console.error to prevent test output noise
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Intentionally empty - suppressing console.error
      });

      mockUpdateEntityDefinition.mockImplementationOnce(() => {
        throw new Error("Update failed");
      });

      render(<EntityDefinitionSection />);

      const versionInput = screen.getByDisplayValue("1");

      // The component should handle the error gracefully without crashing
      expect(() => {
        fireEvent.change(versionInput, { target: { value: "2" } });
      }).not.toThrow();

      // Component should still be rendered and functional after the error
      expect(screen.getByText("Entity Definition")).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long owner names", async () => {
      render(<EntityDefinitionSection />);

      const longOwner = "A".repeat(100);
      const ownerInput = screen.getByDisplayValue("TestOwner");
      fireEvent.change(ownerInput, { target: { value: longOwner } });

      await waitFor(() => {
        expect(mockUpdateEntityDefinition).toHaveBeenCalledWith({
          ...mockSkillData,
          owner: longOwner,
          id: `${longOwner}:Skill:test-key:1`,
        });
      });
    });

    it("should handle very long key names", async () => {
      render(<EntityDefinitionSection />);

      const longKey = "very-long-skill-key-" + "x".repeat(50);
      const keyInput = screen.getByDisplayValue("test-key");
      fireEvent.change(keyInput, { target: { value: longKey } });

      await waitFor(() => {
        expect(mockUpdateEntityDefinition).toHaveBeenCalledWith({
          ...mockSkillData,
          key: longKey,
          id: `TestOwner:Skill:${longKey}:1`,
        });
      });
    });

    it("should handle large version numbers", async () => {
      render(<EntityDefinitionSection />);

      const versionInput = screen.getByDisplayValue("1");
      fireEvent.change(versionInput, { target: { value: "999999" } });

      await waitFor(() => {
        expect(mockUpdateEntityDefinition).toHaveBeenCalledWith({
          ...mockSkillData,
          version: 999999,
          id: "TestOwner:Skill:test-key:999999",
        });
      });
    });

    it("should handle entity data with different initial values", () => {
      const customSkillData = {
        ...mockSkillData,
        owner: "CustomOwner",
        key: "custom-skill",
        version: 5,
        id: "CustomOwner:Skill:custom-skill:5",
      };

      (useSkillStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        skillData: customSkillData,
        updateEntityDefinition: mockUpdateEntityDefinition,
      });

      render(<EntityDefinitionSection />);

      expect(screen.getByDisplayValue("CustomOwner")).toBeInTheDocument();
      expect(screen.getByDisplayValue("custom-skill")).toBeInTheDocument();
      expect(screen.getByDisplayValue("5")).toBeInTheDocument();
      expect(
        screen.getByDisplayValue("CustomOwner:Skill:custom-skill:5"),
      ).toBeInTheDocument();
    });
  });
});
