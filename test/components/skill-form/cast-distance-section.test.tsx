import { describe, it, expect, beforeEach, vi } from "vitest";
import { CastDistanceSection } from "@components/skill-form/cast-distance-section";
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

describe("CastDistanceSection", () => {
  const mockUpdateCastDistance = vi.fn();

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
      updateCastDistance: mockUpdateCastDistance,
    });
  });

  describe("Component Rendering", () => {
    it("should render the cast distance section with all fields", () => {
      render(<CastDistanceSection />);

      expect(screen.getByText("Cast Distance")).toBeInTheDocument();
      expect(screen.getByText("Minimum")).toBeInTheDocument();
      expect(screen.getByText("Maximum")).toBeInTheDocument();
    });

    it("should render with correct initial values", () => {
      render(<CastDistanceSection />);

      const minInput = screen.getByDisplayValue("1.0");
      const maxInput = screen.getByDisplayValue("5.0");

      expect(minInput).toBeInTheDocument();
      expect(maxInput).toBeInTheDocument();
    });

    it("should return null when skillData is not available", () => {
      (useSkillStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        skillData: null,
        updateCastDistance: mockUpdateCastDistance,
      });

      const { container } = render(<CastDistanceSection />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Minimum Distance Field Interactions", () => {
    it("should update minimum distance when input changes", async () => {
      render(<CastDistanceSection />);

      const minInput = screen.getByDisplayValue("1.0");
      fireEvent.change(minInput, { target: { value: "2.5" } });

      await waitFor(() => {
        expect(mockUpdateCastDistance).toHaveBeenCalledWith(2.5, 5.0);
      });
    });

    it("should handle decimal values for minimum distance", async () => {
      render(<CastDistanceSection />);

      const minInput = screen.getByDisplayValue("1.0");
      fireEvent.change(minInput, { target: { value: "1.75" } });

      await waitFor(() => {
        expect(mockUpdateCastDistance).toHaveBeenCalledWith(1.75, 5.0);
      });
    });

    it("should handle zero minimum distance", async () => {
      render(<CastDistanceSection />);

      const minInput = screen.getByDisplayValue("1.0");
      fireEvent.change(minInput, { target: { value: "0" } });

      await waitFor(() => {
        expect(mockUpdateCastDistance).toHaveBeenCalledWith(0, 5.0);
      });
    });

    it("should handle empty minimum distance input", async () => {
      render(<CastDistanceSection />);

      const minInput = screen.getByDisplayValue("1.0");
      fireEvent.change(minInput, { target: { value: "" } });

      await waitFor(() => {
        expect(mockUpdateCastDistance).toHaveBeenCalledWith(0, 5.0);
      });
    });

    it("should handle invalid minimum distance input", async () => {
      render(<CastDistanceSection />);

      const minInput = screen.getByDisplayValue("1.0");

      // When invalid input is entered, Ant Design InputNumber doesn't call onChange
      // It maintains the invalid value in the display but doesn't trigger updates
      fireEvent.change(minInput, { target: { value: "invalid" } });

      // The component should still be rendered and functional after invalid input
      expect(screen.getByText("Cast Distance")).toBeInTheDocument();

      // The mock should not have been called due to invalid input
      expect(mockUpdateCastDistance).not.toHaveBeenCalled();
    });
  });

  describe("Maximum Distance Field Interactions", () => {
    it("should update maximum distance when input changes", async () => {
      render(<CastDistanceSection />);

      const maxInput = screen.getByDisplayValue("5.0");
      fireEvent.change(maxInput, { target: { value: "10.0" } });

      await waitFor(() => {
        expect(mockUpdateCastDistance).toHaveBeenCalledWith(1.0, 10.0);
      });
    });

    it("should handle decimal values for maximum distance", async () => {
      render(<CastDistanceSection />);

      const maxInput = screen.getByDisplayValue("5.0");
      fireEvent.change(maxInput, { target: { value: "7.25" } });

      await waitFor(() => {
        expect(mockUpdateCastDistance).toHaveBeenCalledWith(1.0, 7.25);
      });
    });

    it("should handle large maximum distance values", async () => {
      render(<CastDistanceSection />);

      const maxInput = screen.getByDisplayValue("5.0");
      fireEvent.change(maxInput, { target: { value: "100" } });

      await waitFor(() => {
        expect(mockUpdateCastDistance).toHaveBeenCalledWith(1.0, 100);
      });
    });

    it("should handle empty maximum distance input", async () => {
      render(<CastDistanceSection />);

      const maxInput = screen.getByDisplayValue("5.0");
      fireEvent.change(maxInput, { target: { value: "" } });

      await waitFor(() => {
        expect(mockUpdateCastDistance).toHaveBeenCalledWith(1.0, 0);
      });
    });

    it("should handle invalid maximum distance input", async () => {
      render(<CastDistanceSection />);

      const maxInput = screen.getByDisplayValue("5.0");

      // When invalid input is entered, Ant Design InputNumber doesn't call onChange
      // It maintains the invalid value in the display but doesn't trigger updates
      fireEvent.change(maxInput, { target: { value: "abc" } });

      // The component should still be rendered and functional after invalid input
      expect(screen.getByText("Cast Distance")).toBeInTheDocument();

      // The mock should not have been called due to invalid input
      expect(mockUpdateCastDistance).not.toHaveBeenCalled();
    });
  });

  describe("Form Integration", () => {
    it("should preserve all skill data when updating minimum distance", async () => {
      render(<CastDistanceSection />);

      const minInput = screen.getByDisplayValue("1.0");
      fireEvent.change(minInput, { target: { value: "3" } });

      await waitFor(() => {
        expect(mockUpdateCastDistance).toHaveBeenCalledWith(3, 5.0);
      });

      // Verify maximum distance is preserved
      expect(mockUpdateCastDistance).not.toHaveBeenCalledWith(3, 0);
    });

    it("should preserve all skill data when updating maximum distance", async () => {
      render(<CastDistanceSection />);

      const maxInput = screen.getByDisplayValue("5.0");
      fireEvent.change(maxInput, { target: { value: "8" } });

      await waitFor(() => {
        expect(mockUpdateCastDistance).toHaveBeenCalledWith(1.0, 8);
      });

      // Verify minimum distance is preserved
      expect(mockUpdateCastDistance).not.toHaveBeenCalledWith(0, 8);
    });

    it("should handle rapid successive updates", async () => {
      render(<CastDistanceSection />);

      const minInput = screen.getByDisplayValue("1.0");

      // Simulate rapid changes
      fireEvent.change(minInput, { target: { value: "2" } });
      fireEvent.change(minInput, { target: { value: "3" } });
      fireEvent.change(minInput, { target: { value: "4" } });

      await waitFor(() => {
        expect(mockUpdateCastDistance).toHaveBeenCalledTimes(3);
        expect(mockUpdateCastDistance).toHaveBeenLastCalledWith(4, 5.0);
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle store update failures gracefully", async () => {
      // Mock console.error to prevent test output noise
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Intentionally empty - suppressing console.error
      });

      mockUpdateCastDistance.mockImplementationOnce(() => {
        throw new Error("Update failed");
      });

      render(<CastDistanceSection />);

      const minInput = screen.getByDisplayValue("1.0");

      // The component should handle the error gracefully without crashing
      expect(() => {
        fireEvent.change(minInput, { target: { value: "2" } });
      }).not.toThrow();

      // Component should still be rendered and functional after the error
      expect(screen.getByText("Cast Distance")).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it("should handle null value gracefully", async () => {
      render(<CastDistanceSection />);

      const minInput = screen.getByDisplayValue("1.0");

      // Simulate null value (can happen with InputNumber)
      fireEvent.change(minInput, { target: { value: null } });

      await waitFor(() => {
        expect(mockUpdateCastDistance).toHaveBeenCalledWith(0, 5.0);
      });
    });
  });

  describe("Input Configuration", () => {
    it("should have correct number of input fields", () => {
      render(<CastDistanceSection />);

      const inputs = screen.getAllByRole("spinbutton");

      expect(inputs).toHaveLength(2);
    });

    it("should display current cast distance values", () => {
      render(<CastDistanceSection />);

      expect(screen.getByDisplayValue("1.0")).toBeInTheDocument();
      expect(screen.getByDisplayValue("5.0")).toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    it("should render within a styled card", () => {
      render(<CastDistanceSection />);

      const cardTitle = screen.getByText("Cast Distance");
      expect(cardTitle).toBeInTheDocument();
    });

    it("should have proper form structure with labels", () => {
      render(<CastDistanceSection />);

      expect(screen.getByText("Minimum")).toBeInTheDocument();
      expect(screen.getByText("Maximum")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero distance configuration", () => {
      const skillDataWithZeroDistance = {
        ...mockSkillData,
        entity: {
          ...mockSkillData.entity,
          cast_distance: {
            min: 0,
            max: 0,
          },
        },
      };

      (useSkillStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        skillData: skillDataWithZeroDistance,
        updateCastDistance: mockUpdateCastDistance,
      });

      render(<CastDistanceSection />);

      // Both inputs will have value "0.0", so we need to check they both exist
      const zeroInputs = screen.getAllByDisplayValue("0.0");
      expect(zeroInputs).toHaveLength(2);
    });

    it("should handle large distance values", () => {
      const skillDataWithLargeDistance = {
        ...mockSkillData,
        entity: {
          ...mockSkillData.entity,
          cast_distance: {
            min: 50.5,
            max: 999.9,
          },
        },
      };

      (useSkillStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        skillData: skillDataWithLargeDistance,
        updateCastDistance: mockUpdateCastDistance,
      });

      render(<CastDistanceSection />);

      expect(screen.getByDisplayValue("50.5")).toBeInTheDocument();
      expect(screen.getByDisplayValue("999.9")).toBeInTheDocument();
    });

    it("should handle very precise decimal values", () => {
      const skillDataWithPreciseDistance = {
        ...mockSkillData,
        entity: {
          ...mockSkillData.entity,
          cast_distance: {
            min: 1.123456,
            max: 5.987654,
          },
        },
      };

      (useSkillStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        skillData: skillDataWithPreciseDistance,
        updateCastDistance: mockUpdateCastDistance,
      });

      render(<CastDistanceSection />);

      // Should display the precise values
      expect(screen.getByDisplayValue("1.123456")).toBeInTheDocument();
      expect(screen.getByDisplayValue("5.987654")).toBeInTheDocument();
    });
  });
});
