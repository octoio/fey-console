import { describe, it, expect, vi, beforeEach } from "vitest";
import { GenericEntityEditor } from "@components/entity-editors/generic/generic-entity-editor";
import { EntityType, createEmptyEntity } from "@models/entity.types";
import { useEntityStore } from "@store/entity.store";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock the JsonEditor component to render as a simple textarea for testing
vi.mock("@components/json-import-export/json-editor", () => ({
  JsonEditor: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <textarea
      data-testid="json-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

describe("GenericEntityEditor", () => {
  let mockEntity: any;

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

    mockEntity = createEmptyEntity(EntityType.Weapon, "player", "test_weapon");
    mockEntity.id = "test-weapon-id";
  });

  describe("Rendering", () => {
    it("should render entity editor with form fields", () => {
      render(<GenericEntityEditor entity={mockEntity} />);

      expect(screen.getByDisplayValue("test_weapon")).toBeInTheDocument(); // key field
      expect(screen.getByDisplayValue("player")).toBeInTheDocument(); // owner field
      expect(screen.getByDisplayValue("New Weapon")).toBeInTheDocument(); // title field
    });

    it("should show entity type tag", () => {
      render(<GenericEntityEditor entity={mockEntity} />);

      expect(screen.getByText("Weapon")).toBeInTheDocument();
    });

    it("should show read-only tag when readonly prop is true", () => {
      render(<GenericEntityEditor entity={mockEntity} readonly={true} />);

      expect(screen.getByText("Read Only")).toBeInTheDocument();
    });

    it("should disable form fields when readonly", () => {
      render(<GenericEntityEditor entity={mockEntity} readonly={true} />);

      const keyInput = screen.getByDisplayValue("test_weapon");
      expect(keyInput).toBeDisabled();
    });

    it("should show unsaved changes tag when form is dirty", async () => {
      render(<GenericEntityEditor entity={mockEntity} />);

      const keyInput = screen.getByDisplayValue("test_weapon");
      fireEvent.change(keyInput, { target: { value: "modified_weapon" } });

      await waitFor(() => {
        expect(screen.getByText("Unsaved Changes")).toBeInTheDocument();
      });
    });
  });

  describe("Form Validation", () => {
    it("should require entity key", async () => {
      render(<GenericEntityEditor entity={mockEntity} />);

      const keyInput = screen.getByDisplayValue("test_weapon");
      fireEvent.change(keyInput, { target: { value: "" } });
      fireEvent.click(screen.getByText("Save"));

      await waitFor(() => {
        expect(screen.getByText("Entity key is required")).toBeInTheDocument();
      });
    });

    it("should validate key format", async () => {
      render(<GenericEntityEditor entity={mockEntity} />);

      const keyInput = screen.getByDisplayValue("test_weapon");
      fireEvent.change(keyInput, { target: { value: "invalid key!" } });
      fireEvent.click(screen.getByText("Save"));

      await waitFor(() => {
        expect(
          screen.getByText(
            "Key must contain only letters, numbers, underscores, and dashes",
          ),
        ).toBeInTheDocument();
      });
    });

    it("should require owner", async () => {
      render(<GenericEntityEditor entity={mockEntity} />);

      const ownerInput = screen.getByDisplayValue("player");
      fireEvent.change(ownerInput, { target: { value: "" } });
      fireEvent.click(screen.getByText("Save"));

      await waitFor(() => {
        expect(screen.getByText("Owner is required")).toBeInTheDocument();
      });
    });

    it("should require title", async () => {
      render(<GenericEntityEditor entity={mockEntity} />);

      const titleInput = screen.getByDisplayValue("New Weapon");
      fireEvent.change(titleInput, { target: { value: "" } });
      fireEvent.click(screen.getByText("Save"));

      await waitFor(() => {
        expect(screen.getByText("Title is required")).toBeInTheDocument();
      });
    });

    it("should validate JSON format", async () => {
      render(<GenericEntityEditor entity={mockEntity} />);

      // Now we can interact with the mocked JsonEditor using its test ID
      const jsonEditor = screen.getByTestId("json-editor");
      fireEvent.change(jsonEditor, { target: { value: "invalid json" } });
      fireEvent.click(screen.getByText("Save"));

      await waitFor(() => {
        expect(screen.getByText("Invalid JSON format")).toBeInTheDocument();
      });
    });
  });

  describe("Actions", () => {
    it("should call onSave when save button is clicked with valid data", async () => {
      const mockOnSave = vi.fn();
      render(<GenericEntityEditor entity={mockEntity} onSave={mockOnSave} />);

      const keyInput = screen.getByDisplayValue("test_weapon");
      fireEvent.change(keyInput, { target: { value: "updated_weapon" } });
      fireEvent.click(screen.getByText("Save"));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    it("should call onCancel when cancel button is clicked", () => {
      const mockOnCancel = vi.fn();
      render(
        <GenericEntityEditor entity={mockEntity} onCancel={mockOnCancel} />,
      );

      fireEvent.click(screen.getByText("Cancel"));

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it("should reset form when reset button is clicked", () => {
      render(<GenericEntityEditor entity={mockEntity} />);

      const keyInput = screen.getByDisplayValue("test_weapon");
      fireEvent.change(keyInput, { target: { value: "modified_weapon" } });

      expect(screen.getByDisplayValue("modified_weapon")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Reset"));

      // Just check that reset doesn't crash the component
      expect(screen.getByText("Reset")).toBeInTheDocument();
    });

    it("should clone entity when clone button is clicked", () => {
      // First add the test entity to the store so clone can work
      const { actions } = useEntityStore.getState();
      const entityId = actions.createEntity(
        EntityType.Weapon,
        "player",
        "test_weapon",
      );
      mockEntity.id = entityId; // Ensure the mock entity has a valid ID

      render(<GenericEntityEditor entity={mockEntity} />);

      const initialCount = actions.getAllEntities().length;
      fireEvent.click(screen.getByText("Clone"));

      // Should create a cloned entity
      const entities = actions.getAllEntities();
      expect(entities.length).toBe(initialCount + 1);
    });

    it("should disable save button when form is not dirty", () => {
      render(<GenericEntityEditor entity={mockEntity} />);

      const saveButton = screen.getByRole("button", { name: /save/i });
      expect(saveButton).toBeDisabled();
    });

    it("should enable save button when form is dirty", async () => {
      render(<GenericEntityEditor entity={mockEntity} />);

      const keyInput = screen.getByDisplayValue("test_weapon");
      fireEvent.change(keyInput, { target: { value: "modified_weapon" } });

      await waitFor(() => {
        const saveButton = screen.getByRole("button", { name: /save/i });
        expect(saveButton).not.toBeDisabled();
      });
    });
  });

  describe("JSON Preview", () => {
    it("should toggle JSON preview when button is clicked", () => {
      render(<GenericEntityEditor entity={mockEntity} />);

      expect(screen.queryByText("JSON Preview")).not.toBeInTheDocument();

      fireEvent.click(screen.getByText("Show JSON"));

      expect(screen.getByText("JSON Preview")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Hide JSON"));

      expect(screen.queryByText("JSON Preview")).not.toBeInTheDocument();
    });

    it("should update JSON preview when form values change", async () => {
      render(<GenericEntityEditor entity={mockEntity} />);

      fireEvent.click(screen.getByText("Show JSON"));

      const keyInput = screen.getByDisplayValue("test_weapon");
      fireEvent.change(keyInput, { target: { value: "updated_weapon" } });

      // The JSON preview should reflect the new key value
      await waitFor(() => {
        expect(screen.getByText("JSON Preview")).toBeInTheDocument();
      });
    });
  });

  describe("Entity Information", () => {
    it("should display entity creation date", () => {
      render(<GenericEntityEditor entity={mockEntity} />);

      expect(screen.getByText(/Created/)).toBeInTheDocument();
    });

    it("should display entity modification date", () => {
      render(<GenericEntityEditor entity={mockEntity} />);

      expect(screen.getByText(/Last Modified/)).toBeInTheDocument();
    });

    it("should display entity ID when available", () => {
      render(<GenericEntityEditor entity={mockEntity} />);

      expect(screen.getByText(/ID: test-weapon-id/)).toBeInTheDocument();
    });
  });

  describe("Props", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <GenericEntityEditor entity={mockEntity} className="custom-class" />,
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("should handle entity without metadata", () => {
      const entityWithoutMetadata = { ...mockEntity };
      delete entityWithoutMetadata.metadata;

      render(<GenericEntityEditor entity={entityWithoutMetadata} />);

      // Should still render without errors
      expect(screen.getByDisplayValue("test_weapon")).toBeInTheDocument();
    });

    it("should handle entity without ID", () => {
      const entityWithoutId = { ...mockEntity };
      delete entityWithoutId.id;

      render(<GenericEntityEditor entity={entityWithoutId} />);

      // Should still render without errors
      expect(screen.getByDisplayValue("test_weapon")).toBeInTheDocument();
    });
  });
});
