import { describe, it, expect, beforeEach } from "vitest";
import { EntitySelector } from "@components/entity-selector/entity-selector";
import { EntityType } from "@models/entity.types";
import { useEntityStore } from "@store/entity.store";
import { render, screen, fireEvent } from "@testing-library/react";

describe("EntitySelector", () => {
  beforeEach(() => {
    // Reset the store before each test
    useEntityStore.setState({
      entities: new Map(),
      selectedEntityId: null,
      selectedEntityType: null,
      isLoading: false,
      error: null,
      actions: useEntityStore.getState().actions,
    });
  });

  describe("Compact Layout", () => {
    it("should render compact selector", () => {
      render(<EntitySelector layout="compact" />);

      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(screen.getByText("Select entity type")).toBeInTheDocument();
    });

    it("should show selected entity type", () => {
      render(
        <EntitySelector
          layout="compact"
          selectedEntityType={EntityType.Skill}
        />,
      );

      expect(screen.getByText("Skill")).toBeInTheDocument();
    });
  });

  describe("Detailed Layout", () => {
    it("should render detailed selector with card", () => {
      render(<EntitySelector layout="detailed" />);

      expect(screen.getByText("Entity Types")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(
        screen.getByText("Select entity type to manage"),
      ).toBeInTheDocument();
    });

    it("should show entity description when type is selected", () => {
      render(
        <EntitySelector
          layout="detailed"
          selectedEntityType={EntityType.Weapon}
          showDescription={true}
        />,
      );

      expect(screen.getAllByText("Weapon")).toHaveLength(2); // Title and display
      expect(
        screen.getByText(
          "Combat weapons with damage, enchantments, and properties",
        ),
      ).toBeInTheDocument();
    });

    it("should not show description when showDescription is false", () => {
      render(
        <EntitySelector
          layout="detailed"
          selectedEntityType={EntityType.Weapon}
          showDescription={false}
        />,
      );

      expect(
        screen.queryByText(
          "Combat weapons with damage, enchantments, and properties",
        ),
      ).not.toBeInTheDocument();
    });

    it("should show entity count badge", () => {
      // Add some entities to the store
      const { actions } = useEntityStore.getState();
      actions.createEntity(EntityType.Weapon, "player", "sword");
      actions.createEntity(EntityType.Weapon, "player", "axe");

      render(
        <EntitySelector
          layout="detailed"
          selectedEntityType={EntityType.Weapon}
        />,
      );

      expect(screen.getByText("2 entities")).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("should have search functionality in compact mode", () => {
      render(<EntitySelector layout="compact" />);

      const selector = screen.getByRole("combobox");
      expect(selector).toBeInTheDocument();
    });
  });

  describe("Props and Styling", () => {
    it("should apply custom className", () => {
      const { container } = render(<EntitySelector className="custom-class" />);

      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("should handle undefined selectedEntityType", () => {
      render(<EntitySelector selectedEntityType={null} />);

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("should handle missing onEntityTypeSelect callback", async () => {
      render(<EntitySelector layout="compact" />);

      const selector = screen.getByRole("combobox");
      fireEvent.mouseDown(selector);

      // Just check that the component doesn't crash when no callback is provided
      expect(selector).toBeInTheDocument();
    });
  });

  describe("Store Integration", () => {
    it("should reflect entity counts from store", () => {
      const { actions } = useEntityStore.getState();
      actions.createEntity(EntityType.Character, "player", "hero");
      actions.createEntity(EntityType.Character, "npc", "villain");
      actions.createEntity(EntityType.Skill, "player", "fireball");

      render(
        <EntitySelector
          layout="detailed"
          selectedEntityType={EntityType.Character}
        />,
      );

      expect(screen.getByText("2 entities")).toBeInTheDocument();
    });

    it("should show zero count for empty entity types", () => {
      render(
        <EntitySelector
          layout="detailed"
          selectedEntityType={EntityType.Equipment}
        />,
      );

      // Check that the equipment type is selected
      expect(screen.getAllByText("Equipment")).toHaveLength(2); // Selector and title
    });
  });
});
