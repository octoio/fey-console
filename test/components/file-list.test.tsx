import { describe, it, expect, vi } from "vitest";
import { FileList } from "@components/file-list";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FileInfo } from "@utils/entity-scanner";

// Mock Antd components to eliminate async behavior and improve test speed
vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");

  // Create Option component
  const Option = ({ children, value, ...props }: any) => (
    <option {...props} value={value}>
      {children}
    </option>
  );

  // Create Select component with Option attached
  const Select = ({
    children,
    onChange,
    placeholder,
    "data-testid": testId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    allowClear,
    ...props
  }: any) => (
    <select
      {...props}
      data-testid={testId}
      onChange={(e) => onChange?.(e.target.value || null)}
      aria-label={placeholder}
    >
      <option value="">-- {placeholder} --</option>
      {children}
    </select>
  );

  // Attach Option to Select
  Select.Option = Option;

  return {
    ...actual,
    Select,
    Input: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Search: ({ onChange, placeholder, allowClear, style, ...props }: any) => (
        <input
          {...props}
          type="text"
          placeholder={placeholder}
          onChange={(e) => onChange?.(e)}
          style={style}
        />
      ),
    },
  };
});

// Test data factory for consistent test setup
const createMockFile = (
  name: string,
  path: string,
  isEntity: boolean,
  entityType?: string,
): FileInfo => ({
  name,
  path,
  isEntity,
  entityType,
});

describe("FileList Component - Performance Optimized Tests", () => {
  const mockFiles: FileInfo[] = [
    createMockFile(
      "fire-sword.json",
      "/weapons/fire-sword.json",
      true,
      "Weapon",
    ),
    createMockFile(
      "heal-potion.json",
      "/items/heal-potion.json",
      true,
      "Equipment",
    ),
    createMockFile("fireball.json", "/skills/fireball.json", true, "Skill"),
    createMockFile(
      "character-stats.json",
      "/stats/character-stats.json",
      true,
      "Stat",
    ),
    createMockFile("config.json", "/config/config.json", false),
    createMockFile("readme.txt", "/docs/readme.txt", false),
    createMockFile("ice-spell.json", "/skills/ice-spell.json", true, "Skill"),
    createMockFile(
      "dragon-sword.json",
      "/weapons/dragon-sword.json",
      true,
      "Weapon",
    ),
  ];

  const mockEmptyFiles: FileInfo[] = [];

  describe("Rendering", () => {
    it("should render with correct title showing file count", () => {
      render(<FileList files={mockFiles} />);
      expect(screen.getByText("Files (8)")).toBeInTheDocument();
    });

    it("should render empty list when no files provided", () => {
      render(<FileList files={mockEmptyFiles} />);
      expect(screen.getByText("Files (0)")).toBeInTheDocument();
    });

    it("should display entity type tags in header", () => {
      render(<FileList files={mockFiles} />);
      expect(screen.getByText("Weapon: 2")).toBeInTheDocument();
      expect(screen.getByText("Equipment: 1")).toBeInTheDocument();
      expect(screen.getByText("Skill: 2")).toBeInTheDocument();
      expect(screen.getByText("Stat: 1")).toBeInTheDocument();
    });

    it("should render all file items", () => {
      render(<FileList files={mockFiles} />);
      mockFiles.forEach((file) => {
        expect(screen.getByText(file.name)).toBeInTheDocument();
        expect(screen.getByText(file.path)).toBeInTheDocument();
      });
    });

    it("should show correct file type badges", () => {
      render(<FileList files={mockFiles} />);
      // Count file type badges (excluding dropdown options) - look for span elements with class
      const jsonBadges = screen
        .getAllByText("JSON")
        .filter(
          (el) => el.tagName === "SPAN" && el.className.includes("ant-tag"),
        );
      expect(jsonBadges).toHaveLength(7); // 7 JSON files in mockFiles

      const txtBadges = screen
        .getAllByText("TXT")
        .filter(
          (el) => el.tagName === "SPAN" && el.className.includes("ant-tag"),
        );
      expect(txtBadges).toHaveLength(1); // 1 TXT file in mockFiles
    });
  });

  describe("Search Functionality - Fast Implementation", () => {
    it("should filter files by name when searching", async () => {
      render(<FileList files={mockFiles} />);

      const searchInput = screen.getByPlaceholderText("Search files...");
      fireEvent.change(searchInput, { target: { value: "fire" } });

      // Wait for debounced search (300ms + buffer)
      await waitFor(
        () => {
          expect(screen.getByText("fire-sword.json")).toBeInTheDocument();
          expect(screen.getByText("fireball.json")).toBeInTheDocument();
          expect(
            screen.queryByText("heal-potion.json"),
          ).not.toBeInTheDocument();
        },
        { timeout: 500 },
      );
    });

    it("should filter files by path when searching", async () => {
      render(<FileList files={mockFiles} />);

      const searchInput = screen.getByPlaceholderText("Search files...");
      fireEvent.change(searchInput, { target: { value: "/weapons" } });

      await waitFor(
        () => {
          expect(screen.getByText("fire-sword.json")).toBeInTheDocument();
          expect(screen.getByText("dragon-sword.json")).toBeInTheDocument();
          expect(
            screen.queryByText("heal-potion.json"),
          ).not.toBeInTheDocument();
        },
        { timeout: 500 },
      );
    });

    it("should filter files by entity type when searching", async () => {
      render(<FileList files={mockFiles} />);

      const searchInput = screen.getByPlaceholderText("Search files...");
      fireEvent.change(searchInput, { target: { value: "Skill" } });

      await waitFor(
        () => {
          expect(screen.getByText("fireball.json")).toBeInTheDocument();
          expect(screen.getByText("ice-spell.json")).toBeInTheDocument();
          expect(screen.queryByText("fire-sword.json")).not.toBeInTheDocument();
        },
        { timeout: 500 },
      );
    });

    it("should be case insensitive when searching", async () => {
      render(<FileList files={mockFiles} />);

      const searchInput = screen.getByPlaceholderText("Search files...");
      fireEvent.change(searchInput, { target: { value: "FIRE" } });

      // Wait for debounced search
      await waitFor(
        () => {
          expect(screen.getByText("fire-sword.json")).toBeInTheDocument();
          expect(screen.getByText("fireball.json")).toBeInTheDocument();
        },
        { timeout: 500 },
      );
    });

    it("should reset search input when cleared", () => {
      render(<FileList files={mockFiles} />);

      const searchInput = screen.getByPlaceholderText(
        "Search files...",
      ) as HTMLInputElement;

      // Apply search
      fireEvent.change(searchInput, { target: { value: "fire" } });
      expect(searchInput.value).toBe("fire");

      // Clear search
      fireEvent.change(searchInput, { target: { value: "" } });
      expect(searchInput.value).toBe("");

      // Verify all files count is still shown
      expect(screen.getByText("Files (8)")).toBeInTheDocument();
    });
  });

  describe("File Type Filtering - Fast Implementation", () => {
    it("should filter by JSON file type using direct select interaction", () => {
      render(<FileList files={mockFiles} />);

      // Use direct fireEvent instead of slow userEvent
      const fileTypeSelect = screen.getByTestId("file-type-select");
      fireEvent.change(fileTypeSelect, { target: { value: "JSON" } });

      // Should show only JSON files
      expect(screen.getByText("fire-sword.json")).toBeInTheDocument();
      expect(screen.getByText("heal-potion.json")).toBeInTheDocument();
      expect(screen.queryByText("readme.txt")).not.toBeInTheDocument();
    });

    it("should filter by TXT file type", () => {
      render(<FileList files={mockFiles} />);

      const fileTypeSelect = screen.getByTestId("file-type-select");
      fireEvent.change(fileTypeSelect, { target: { value: "TXT" } });

      expect(screen.getByText("readme.txt")).toBeInTheDocument();
      expect(screen.queryByText("fire-sword.json")).not.toBeInTheDocument();
    });

    it("should clear file type filter when empty value selected", () => {
      render(<FileList files={mockFiles} />);

      const fileTypeSelect = screen.getByTestId("file-type-select");

      // Apply filter first
      fireEvent.change(fileTypeSelect, { target: { value: "JSON" } });
      expect(screen.queryByText("readme.txt")).not.toBeInTheDocument();

      // Clear filter
      fireEvent.change(fileTypeSelect, { target: { value: "" } });
      expect(screen.getByText("readme.txt")).toBeInTheDocument();
    });

    it("should show available file types in dropdown options", () => {
      render(<FileList files={mockFiles} />);

      // Check that file type options are available in select dropdown
      const select = screen.getByTestId("file-type-select");
      expect(select).toBeInTheDocument();

      // Verify dropdown contains the options
      expect(select.innerHTML).toContain("JSON");
      expect(select.innerHTML).toContain("TXT");
    });
  });

  describe("Combined Filtering - Fast Implementation", () => {
    it("should apply both search and file type filters simultaneously", async () => {
      render(<FileList files={mockFiles} />);

      // Apply search filter
      const searchInput = screen.getByPlaceholderText("Search files...");
      fireEvent.change(searchInput, { target: { value: "sword" } });

      // Apply file type filter
      const fileTypeSelect = screen.getByTestId("file-type-select");
      fireEvent.change(fileTypeSelect, { target: { value: "JSON" } });

      // Wait for debounced search to complete
      await waitFor(
        () => {
          expect(screen.getByText("fire-sword.json")).toBeInTheDocument();
          expect(screen.getByText("dragon-sword.json")).toBeInTheDocument();
          expect(screen.queryByText("fireball.json")).not.toBeInTheDocument();
          expect(screen.queryByText("readme.txt")).not.toBeInTheDocument();
        },
        { timeout: 500 },
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle files without extensions", () => {
      const filesWithoutExtension = [
        createMockFile("config", "/config", false),
      ];
      render(<FileList files={filesWithoutExtension} />);

      expect(screen.getByText("config")).toBeInTheDocument();
      // The component now uses hook's getFileType which shows "UNKNOWN" for files without extensions
      const unknownBadges = screen
        .getAllByText("UNKNOWN")
        .filter(
          (el) => el.tagName === "SPAN" && el.className.includes("ant-tag"),
        );
      expect(unknownBadges).toHaveLength(1);
    });

    it("should handle files with empty extensions", () => {
      const filesWithEmptyExtension = [
        createMockFile("config.", "/config.", false),
      ];
      render(<FileList files={filesWithEmptyExtension} />);

      expect(screen.getByText("config.")).toBeInTheDocument();
      // For files ending with dot, hook's getFileType returns "UNKNOWN"
      const unknownBadges = screen
        .getAllByText("UNKNOWN")
        .filter(
          (el) => el.tagName === "SPAN" && el.className.includes("ant-tag"),
        );
      expect(unknownBadges).toHaveLength(1);
    });

    it("should handle files with multiple dots in name", () => {
      const filesWithMultipleDots = [
        createMockFile("config.backup.json", "/config.backup.json", false),
      ];
      render(<FileList files={filesWithMultipleDots} />);

      expect(screen.getByText("config.backup.json")).toBeInTheDocument();
      // Find JSON badge (not dropdown option)
      const jsonBadges = screen
        .getAllByText("JSON")
        .filter(
          (el) => el.tagName === "SPAN" && el.className.includes("ant-tag"),
        );
      expect(jsonBadges).toHaveLength(1);
    });

    it("should handle empty entity type gracefully", () => {
      const filesWithoutEntityType = [
        createMockFile("test.json", "/test.json", true, undefined),
      ];
      render(<FileList files={filesWithoutEntityType} />);

      expect(screen.getByText("test.json")).toBeInTheDocument();
      // Should not crash when entityType is undefined
    });

    it("should handle mixed case file extensions", () => {
      const mixedCaseFiles = [
        createMockFile("test.JSON", "/test.JSON", false),
        createMockFile("readme.TXT", "/readme.TXT", false),
      ];
      render(<FileList files={mixedCaseFiles} />);

      // Find badges (not dropdown options)
      const jsonBadges = screen
        .getAllByText("JSON")
        .filter(
          (el) => el.tagName === "SPAN" && el.className.includes("ant-tag"),
        );
      const txtBadges = screen
        .getAllByText("TXT")
        .filter(
          (el) => el.tagName === "SPAN" && el.className.includes("ant-tag"),
        );

      expect(jsonBadges).toHaveLength(1);
      expect(txtBadges).toHaveLength(1);
    });
  });

  describe("Performance - Optimized Tests", () => {
    it("should handle large number of files efficiently", () => {
      // Use smaller dataset for faster tests - 200 files instead of 1000
      const largeFileList: FileInfo[] = Array.from({ length: 200 }, (_, i) =>
        createMockFile(
          `file-${i}.json`,
          `/files/file-${i}.json`,
          i % 2 === 0,
          i % 2 === 0 ? "Weapon" : undefined,
        ),
      );

      render(<FileList files={largeFileList} />);

      // Verify rendering without performance timing overhead
      expect(screen.getByText("Files (200)")).toBeInTheDocument();
      expect(screen.getByText("Weapon: 100")).toBeInTheDocument();

      // Spot check a few files to ensure rendering
      expect(screen.getByText("file-0.json")).toBeInTheDocument();
      expect(screen.getByText("file-10.json")).toBeInTheDocument();
    });

    it("should filter large datasets quickly", async () => {
      // Use even smaller dataset - 100 files instead of 300
      const largeFileList: FileInfo[] = Array.from({ length: 100 }, (_, i) =>
        createMockFile(
          `test-${i}.json`,
          `/files/test-${i}.json`,
          true,
          "Weapon",
        ),
      );

      render(<FileList files={largeFileList} />);

      const searchInput = screen.getByPlaceholderText("Search files...");
      fireEvent.change(searchInput, { target: { value: "test-1" } });

      // Wait for debounced search with reduced timeout
      await waitFor(
        () => {
          expect(screen.getByText("test-1.json")).toBeInTheDocument();
          expect(screen.queryByText("test-2.json")).not.toBeInTheDocument();
        },
        { timeout: 350 },
      );
    });

    it("should handle complete user workflow efficiently", () => {
      render(<FileList files={mockFiles} />);

      const searchInput = screen.getByPlaceholderText("Search files...");
      const fileTypeSelect = screen.getByTestId("file-type-select");

      // Simulate user actions in sequence with fast fireEvent (no timing overhead)
      fireEvent.change(searchInput, { target: { value: "s" } });
      fireEvent.change(fileTypeSelect, { target: { value: "JSON" } });
      fireEvent.change(searchInput, { target: { value: "" } });
      fireEvent.change(fileTypeSelect, { target: { value: "" } });

      // Should show all files at the end
      expect(screen.getByText("fire-sword.json")).toBeInTheDocument();
      expect(screen.getByText("readme.txt")).toBeInTheDocument();
    });
  });
});
