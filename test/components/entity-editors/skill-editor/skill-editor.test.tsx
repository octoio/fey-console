import { describe, it, expect, vi, beforeEach } from "vitest";
import { SkillEditor } from "@components/entity-editors/skill-editor/skill-editor";
import { EntityType, EntityReferences } from "@models/common.types";
import { render, screen, fireEvent } from "@testing-library/react";
import { FileInfo } from "@utils/entity-scanner";

// Mock the store
const mockSetEntityReferences = vi.fn();
vi.mock("@store/skill.store", () => ({
  useSkillStore: vi.fn((selector) => {
    if (typeof selector === "function")
      return selector({ setEntityReferences: mockSetEntityReferences });

    return { setEntityReferences: mockSetEntityReferences };
  }),
}));

// Mock lazy loaded components to avoid complex async loading in tests
vi.mock(
  "@components/entity-editors/skill-editor/execution-tree-editor",
  () => ({
    ExecutionTreeEditor: () => (
      <div data-testid="execution-tree-editor">Execution Tree Editor Mock</div>
    ),
  }),
);

vi.mock("@components/json-import-export", () => ({
  JsonImportExport: ({ files }: any) => (
    <div data-testid="json-import-export" data-files-count={files.length}>
      JSON Import Export Mock
    </div>
  ),
}));

vi.mock(
  "@components/entity-editors/skill-editor/skill-properties-form",
  () => ({
    SkillPropertiesForm: () => (
      <div data-testid="skill-properties-form">Skill Properties Form Mock</div>
    ),
  }),
);

vi.mock("@components/loading-spinner", () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

describe("SkillEditor", () => {
  const mockEntityReferences: EntityReferences = {
    [EntityType.Weapon]: [
      {
        id: "1",
        key: "sword",
        owner: "player",
        type: EntityType.Weapon,
        version: 1,
      },
    ],
    [EntityType.Character]: [],
    [EntityType.Skill]: [],
    [EntityType.Equipment]: [],
    [EntityType.Model]: [],
    [EntityType.Image]: [],
    [EntityType.AudioClip]: [],
    [EntityType.SoundBank]: [],
    [EntityType.Status]: [],
    [EntityType.Cursor]: [],
    [EntityType.Stat]: [],
    [EntityType.Quality]: [],
    [EntityType.DropTable]: [],
    [EntityType.Animation]: [],
    [EntityType.AnimationSource]: [],
    [EntityType.Sound]: [],
  };

  const mockFiles: FileInfo[] = [
    {
      name: "test1.json",
      path: "/test1.json",
      isEntity: true,
    },
    {
      name: "test2.json",
      path: "/test2.json",
      isEntity: true,
    },
  ];

  const mockDirectoryHandle = {} as FileSystemDirectoryHandle;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render skill editor with tabs", () => {
      render(
        <SkillEditor
          entityReferences={mockEntityReferences}
          files={mockFiles}
          directoryHandle={mockDirectoryHandle}
        />,
      );

      expect(
        screen.getByRole("tab", { name: "Properties" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: "Execution Tree" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "JSON" })).toBeInTheDocument();
    });

    it("should show Properties tab content by default", () => {
      render(
        <SkillEditor
          entityReferences={mockEntityReferences}
          files={mockFiles}
          directoryHandle={mockDirectoryHandle}
        />,
      );

      expect(screen.getByTestId("skill-properties-form")).toBeInTheDocument();
    });

    it("should have proper layout structure", () => {
      const { container } = render(
        <SkillEditor
          entityReferences={mockEntityReferences}
          files={mockFiles}
          directoryHandle={mockDirectoryHandle}
        />,
      );

      // Check for main layout elements
      expect(container.querySelector(".ant-layout")).toBeInTheDocument();
      expect(container.querySelector(".ant-card")).toBeInTheDocument();
    });
  });

  describe("Tab Navigation", () => {
    it("should switch to Execution Tree tab when clicked", () => {
      render(
        <SkillEditor
          entityReferences={mockEntityReferences}
          files={mockFiles}
          directoryHandle={mockDirectoryHandle}
        />,
      );

      fireEvent.click(screen.getByRole("tab", { name: "Execution Tree" }));
      // Tab should be active
      expect(
        screen.getByRole("tab", { name: "Execution Tree" }),
      ).toHaveAttribute("aria-selected", "true");
    });

    it("should switch to JSON tab when clicked", () => {
      render(
        <SkillEditor
          entityReferences={mockEntityReferences}
          files={mockFiles}
          directoryHandle={mockDirectoryHandle}
        />,
      );

      fireEvent.click(screen.getByRole("tab", { name: "JSON" }));
      // Tab should be active
      expect(screen.getByRole("tab", { name: "JSON" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });

    it("should pass correct props to JSON tab", () => {
      render(
        <SkillEditor
          entityReferences={mockEntityReferences}
          files={mockFiles}
          directoryHandle={mockDirectoryHandle}
        />,
      );

      fireEvent.click(screen.getByRole("tab", { name: "JSON" }));

      const jsonComponent = screen.getByTestId("json-import-export");
      expect(jsonComponent).toHaveAttribute("data-files-count", "2");
    });
  });

  describe("Store Integration", () => {
    it("should update entity references in store on mount", () => {
      render(
        <SkillEditor
          entityReferences={mockEntityReferences}
          files={mockFiles}
          directoryHandle={mockDirectoryHandle}
        />,
      );

      expect(mockSetEntityReferences).toHaveBeenCalledWith(
        mockEntityReferences,
      );
    });

    it("should update entity references when prop changes", () => {
      const { rerender } = render(
        <SkillEditor
          entityReferences={mockEntityReferences}
          files={mockFiles}
          directoryHandle={mockDirectoryHandle}
        />,
      );

      const newEntityReferences = {
        ...mockEntityReferences,
        [EntityType.Weapon]: [
          ...mockEntityReferences[EntityType.Weapon],
          {
            id: "2",
            key: "axe",
            owner: "npc",
            type: EntityType.Weapon,
            version: 1,
          },
        ],
      };

      rerender(
        <SkillEditor
          entityReferences={newEntityReferences}
          files={mockFiles}
          directoryHandle={mockDirectoryHandle}
        />,
      );

      expect(mockSetEntityReferences).toHaveBeenCalledWith(newEntityReferences);
    });
  });

  describe("Props Handling", () => {
    it("should handle empty files array", () => {
      render(
        <SkillEditor
          entityReferences={mockEntityReferences}
          files={[]}
          directoryHandle={mockDirectoryHandle}
        />,
      );

      fireEvent.click(screen.getByRole("tab", { name: "JSON" }));

      const jsonComponent = screen.getByTestId("json-import-export");
      expect(jsonComponent).toHaveAttribute("data-files-count", "0");
    });

    it("should handle null directory handle", () => {
      render(
        <SkillEditor
          entityReferences={mockEntityReferences}
          files={mockFiles}
          directoryHandle={null}
        />,
      );

      // Should render without errors
      expect(
        screen.getByRole("tab", { name: "Properties" }),
      ).toBeInTheDocument();
    });

    it("should handle empty entity references", () => {
      const emptyReferences: EntityReferences = {
        [EntityType.Weapon]: [],
        [EntityType.Character]: [],
        [EntityType.Skill]: [],
        [EntityType.Equipment]: [],
        [EntityType.Model]: [],
        [EntityType.Image]: [],
        [EntityType.AudioClip]: [],
        [EntityType.SoundBank]: [],
        [EntityType.Status]: [],
        [EntityType.Cursor]: [],
        [EntityType.Stat]: [],
        [EntityType.Quality]: [],
        [EntityType.DropTable]: [],
        [EntityType.Animation]: [],
        [EntityType.AnimationSource]: [],
        [EntityType.Sound]: [],
      };

      render(
        <SkillEditor
          entityReferences={emptyReferences}
          files={mockFiles}
          directoryHandle={mockDirectoryHandle}
        />,
      );

      expect(mockSetEntityReferences).toHaveBeenCalledWith(emptyReferences);
    });
  });

  describe("Lazy Loading", () => {
    it("should render tabs without immediately loading heavy components", () => {
      render(
        <SkillEditor
          entityReferences={mockEntityReferences}
          files={mockFiles}
          directoryHandle={mockDirectoryHandle}
        />,
      );

      // Properties should be visible immediately
      expect(screen.getByTestId("skill-properties-form")).toBeInTheDocument();

      // Heavy components should not be loaded until their tabs are clicked
      expect(
        screen.queryByTestId("execution-tree-editor"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("json-import-export"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper tab navigation structure", () => {
      render(
        <SkillEditor
          entityReferences={mockEntityReferences}
          files={mockFiles}
          directoryHandle={mockDirectoryHandle}
        />,
      );

      const tablist = screen.getByRole("tablist");
      expect(tablist).toBeInTheDocument();

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(3);
    });

    it("should maintain tab state correctly", () => {
      render(
        <SkillEditor
          entityReferences={mockEntityReferences}
          files={mockFiles}
          directoryHandle={mockDirectoryHandle}
        />,
      );

      const propertiesTab = screen.getByRole("tab", { name: "Properties" });
      const executionTreeTab = screen.getByRole("tab", {
        name: "Execution Tree",
      });

      expect(propertiesTab).toHaveAttribute("aria-selected", "true");
      expect(executionTreeTab).toHaveAttribute("aria-selected", "false");

      fireEvent.click(executionTreeTab);

      expect(propertiesTab).toHaveAttribute("aria-selected", "false");
      expect(executionTreeTab).toHaveAttribute("aria-selected", "true");
    });
  });
});
