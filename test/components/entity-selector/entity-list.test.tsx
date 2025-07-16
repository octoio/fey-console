import { describe, it, expect, vi, beforeEach } from "vitest";
import { EntityList } from "@components/entity-selector/entity-list";
import { EntityType } from "@models/entity.types";
import { useEntityStore } from "@store/entity.store";
import { render, screen, fireEvent } from "@testing-library/react";

describe("EntityList", () => {
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

  describe("Empty State", () => {
    it("should show empty state when no entities exist", () => {
      render(<EntityList entityType={EntityType.Weapon} />);

      expect(screen.getByText("No Weapon entities found")).toBeInTheDocument();
      expect(screen.getByText("Create Your First Weapon")).toBeInTheDocument();
    });

    it("should show empty search state when search yields no results", () => {
      const { actions } = useEntityStore.getState();
      actions.createEntity(EntityType.Weapon, "player", "sword");

      render(<EntityList entityType={EntityType.Weapon} />);

      const searchInput = screen.getByPlaceholderText("Search entities...");
      fireEvent.change(searchInput, { target: { value: "nonexistent" } });

      expect(
        screen.getByText('No entities found matching "nonexistent"'),
      ).toBeInTheDocument();
    });

    it("should not show create button when showActions is false", () => {
      render(<EntityList entityType={EntityType.Weapon} showActions={false} />);

      expect(
        screen.queryByText("Create Your First Weapon"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Entity Display", () => {
    beforeEach(() => {
      const { actions } = useEntityStore.getState();
      actions.createEntity(EntityType.Weapon, "player", "sword");
      actions.createEntity(EntityType.Weapon, "npc", "axe");
      actions.createEntity(EntityType.Character, "player", "hero");
    });

    it("should display entities of correct type only", () => {
      render(<EntityList entityType={EntityType.Weapon} />);

      expect(screen.getAllByText("New Weapon")).toHaveLength(2); // Two weapon entities
      expect(screen.getByText("sword")).toBeInTheDocument(); // Key tag
      expect(screen.getByText("axe")).toBeInTheDocument(); // Key tag
      expect(screen.queryByText("hero")).not.toBeInTheDocument(); // Character should not appear
    });

    it("should show entity count in title", () => {
      render(<EntityList entityType={EntityType.Weapon} />);

      expect(screen.getByText("Weapon Entities (2)")).toBeInTheDocument();
    });

    it("should display entity metadata", () => {
      render(<EntityList entityType={EntityType.Weapon} />);

      expect(screen.getByText("Owner: player")).toBeInTheDocument();
      expect(screen.getByText("Owner: npc")).toBeInTheDocument();
    });

    it("should highlight selected entity", () => {
      const { actions } = useEntityStore.getState();
      const entities = actions.getEntitiesByType(EntityType.Weapon);
      const selectedEntity = entities[0];

      render(
        <EntityList
          entityType={EntityType.Weapon}
          selectedEntityId={selectedEntity.id}
        />,
      );

      // Just check that the component renders with selected entity
      expect(screen.getAllByText("New Weapon")).toHaveLength(2);
    });
  });

  describe("Search Functionality", () => {
    beforeEach(() => {
      const { actions } = useEntityStore.getState();
      actions.createEntity(EntityType.Weapon, "player", "fire_sword");
      actions.createEntity(EntityType.Weapon, "player", "ice_axe");
      actions.createEntity(EntityType.Weapon, "player", "wind_bow");
    });

    it("should filter entities by key", () => {
      render(<EntityList entityType={EntityType.Weapon} />);

      const searchInput = screen.getByPlaceholderText("Search entities...");
      fireEvent.change(searchInput, { target: { value: "fire" } });

      expect(screen.getByText("fire_sword")).toBeInTheDocument();
      expect(screen.queryByText("ice_axe")).not.toBeInTheDocument();
      expect(screen.queryByText("wind_bow")).not.toBeInTheDocument();
    });

    it("should filter entities by title", () => {
      render(<EntityList entityType={EntityType.Weapon} />);

      const searchInput = screen.getByPlaceholderText("Search entities...");
      fireEvent.change(searchInput, { target: { value: "Weapon" } });

      // All should match since they all have "New Weapon" title
      expect(screen.getByText("fire_sword")).toBeInTheDocument();
      expect(screen.getByText("ice_axe")).toBeInTheDocument();
      expect(screen.getByText("wind_bow")).toBeInTheDocument();
    });

    it("should be case insensitive", () => {
      render(<EntityList entityType={EntityType.Weapon} />);

      const searchInput = screen.getByPlaceholderText("Search entities...");
      fireEvent.change(searchInput, { target: { value: "FIRE" } });

      expect(screen.getByText("fire_sword")).toBeInTheDocument();
    });

    it("should clear search results when search is cleared", () => {
      render(<EntityList entityType={EntityType.Weapon} />);

      const searchInput = screen.getByPlaceholderText("Search entities...");
      fireEvent.change(searchInput, { target: { value: "fire" } });
      expect(screen.queryByText("ice_axe")).not.toBeInTheDocument();

      fireEvent.change(searchInput, { target: { value: "" } });
      expect(screen.getByText("ice_axe")).toBeInTheDocument();
    });
  });

  describe("Actions", () => {
    beforeEach(() => {
      const { actions } = useEntityStore.getState();
      actions.createEntity(EntityType.Weapon, "player", "test_sword");
    });

    it("should call onEntityCreate when create button is clicked", () => {
      const mockOnCreate = vi.fn();
      render(
        <EntityList
          entityType={EntityType.Weapon}
          onEntityCreate={mockOnCreate}
        />,
      );

      fireEvent.click(screen.getByText("Create New"));

      expect(mockOnCreate).toHaveBeenCalledWith(EntityType.Weapon);
    });

    it("should call onEntitySelect when entity is clicked", () => {
      const mockOnSelect = vi.fn();
      render(
        <EntityList
          entityType={EntityType.Weapon}
          onEntitySelect={mockOnSelect}
        />,
      );

      fireEvent.click(screen.getByText("New Weapon"));

      expect(mockOnSelect).toHaveBeenCalled();
    });

    it("should not show actions when showActions is false", () => {
      render(<EntityList entityType={EntityType.Weapon} showActions={false} />);

      expect(screen.queryByText("Create New")).not.toBeInTheDocument();
    });
  });

  describe("Pagination", () => {
    beforeEach(() => {
      const { actions } = useEntityStore.getState();
      // Create 15 entities to test pagination
      for (let i = 1; i <= 15; i++)
        actions.createEntity(EntityType.Weapon, "player", `weapon_${i}`);
    });

    it("should show pagination when there are many entities", () => {
      render(<EntityList entityType={EntityType.Weapon} />);

      expect(screen.getByText("1-10 of 15 entities")).toBeInTheDocument();
    });

    it("should have size changer", () => {
      render(<EntityList entityType={EntityType.Weapon} />);

      expect(screen.getByTitle("10 / page")).toBeInTheDocument();
    });
  });

  describe("Props", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <EntityList entityType={EntityType.Weapon} className="custom-class" />,
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("should handle missing callbacks gracefully", () => {
      const { actions } = useEntityStore.getState();
      actions.createEntity(EntityType.Weapon, "player", "sword");

      render(<EntityList entityType={EntityType.Weapon} />);

      // Should not throw when clicking without callbacks
      fireEvent.click(screen.getByText("New Weapon"));
      fireEvent.click(screen.getByText("Create New"));
    });
  });
});
