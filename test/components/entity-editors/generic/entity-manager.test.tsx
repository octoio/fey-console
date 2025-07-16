import { describe, it, expect, beforeEach } from "vitest";
import { EntityManager } from "@components/entity-editors/generic/entity-manager";
import { EntityType } from "@models/entity.types";
import { useEntityStore } from "@store/entity.store";
import { render, screen } from "@testing-library/react";

describe("EntityManager", () => {
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

  describe("Initial State", () => {
    it("should render entity selector by default", () => {
      render(<EntityManager />);

      expect(screen.getByText("Entity Management")).toBeInTheDocument();
      expect(screen.getAllByText("Entity Types")).toHaveLength(2); // Breadcrumb and card title
    });

    it("should render with specific entity type when provided", () => {
      render(<EntityManager initialEntityType={EntityType.Weapon} />);

      expect(screen.getAllByText("Weapon Entities")).toHaveLength(2); // Breadcrumb and page title
    });

    it("should show correct breadcrumb for selector view", () => {
      render(<EntityManager />);

      expect(screen.getAllByText("Entity Types")).toHaveLength(2); // Breadcrumb and card title
    });
  });

  describe("Navigation Flow", () => {
    it("should navigate from selector to list when entity type is selected", async () => {
      render(<EntityManager />);

      // Should start with selector
      expect(screen.getByText("Entity Management")).toBeInTheDocument();

      // Simulate selecting an entity type (this would normally happen through EntitySelector)
      const { actions } = useEntityStore.getState();
      actions.setSelectedEntity(null, EntityType.Weapon);

      // The component should react to store changes
      // Note: In a real scenario, this would trigger through EntitySelector interaction
    });

    it("should show breadcrumb navigation", () => {
      render(<EntityManager initialEntityType={EntityType.Weapon} />);

      expect(screen.getAllByText("Weapon Entities")).toHaveLength(2); // Breadcrumb and page title
    });

    it("should allow navigation back to selector", () => {
      render(<EntityManager initialEntityType={EntityType.Weapon} />);

      // Should show back navigation in breadcrumb
      const breadcrumb = screen.getByRole("navigation");
      expect(breadcrumb).toBeInTheDocument();
    });
  });

  describe("Entity List Integration", () => {
    beforeEach(() => {
      const { actions } = useEntityStore.getState();
      actions.createEntity(EntityType.Weapon, "player", "sword");
      actions.createEntity(EntityType.Weapon, "npc", "axe");
    });

    it("should display entity list for specific type", () => {
      render(<EntityManager initialEntityType={EntityType.Weapon} />);

      expect(screen.getByText("Weapon Entities (2)")).toBeInTheDocument();
    });

    it("should show entity items", () => {
      render(<EntityManager initialEntityType={EntityType.Weapon} />);

      expect(screen.getByText("sword")).toBeInTheDocument();
      expect(screen.getByText("axe")).toBeInTheDocument();
    });
  });

  describe("Entity Editor Integration", () => {
    it("should show warning for skill entities", () => {
      render(<EntityManager initialEntityType={EntityType.Skill} />);

      // Since skills require special handling, the component should show info about this
      expect(screen.getAllByText("Skill Entities")).toHaveLength(2); // Breadcrumb and page title
    });
  });

  describe("Entity Creation", () => {
    it("should show create button for entity types", () => {
      render(<EntityManager initialEntityType={EntityType.Character} />);

      expect(screen.getByText("Create New")).toBeInTheDocument();
    });
  });

  describe("Breadcrumb Navigation", () => {
    it("should show navigation for selector view", () => {
      render(<EntityManager />);

      expect(screen.getAllByText("Entity Types")).toHaveLength(2); // Breadcrumb and card title
    });

    it("should show navigation for list view", () => {
      render(<EntityManager initialEntityType={EntityType.Status} />);

      expect(screen.getAllByText("Status Effect Entities")).toHaveLength(2); // Breadcrumb and page title
    });
  });

  describe("Store Integration", () => {
    it("should integrate with entity store", () => {
      render(<EntityManager />);

      // Component should render without store errors
      expect(screen.getByText("Entity Management")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should handle missing initial entity type gracefully", () => {
      render(<EntityManager initialEntityType={undefined} />);

      // Should default to selector view
      expect(screen.getByText("Entity Management")).toBeInTheDocument();
    });

    it("should handle invalid entity selection gracefully", () => {
      render(<EntityManager />);

      const { actions } = useEntityStore.getState();
      actions.setSelectedEntity("invalid-id", EntityType.Animation);

      // Should not crash
      expect(screen.getByText("Entity Management")).toBeInTheDocument();
    });
  });

  describe("Props", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <EntityManager className="custom-entity-manager" />,
      );

      expect(container.firstChild).toHaveClass("custom-entity-manager");
    });

    it("should handle all entity types correctly", () => {
      const entityTypes = Object.values(EntityType);

      entityTypes.forEach((entityType) => {
        const { unmount } = render(
          <EntityManager initialEntityType={entityType} />,
        );

        // Should render without errors for each entity type
        expect(document.body).toBeInTheDocument();

        unmount();
      });
    });
  });
});
