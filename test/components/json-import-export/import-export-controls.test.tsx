import { describe, it, expect, vi } from "vitest";
import { ImportExportControls } from "@components/json-import-export/import-export-controls";
import { render, screen } from "@testing-library/react";

describe("ImportExportControls", () => {
  const mockHandleExport = vi.fn();
  const mockHandleImport = vi.fn();

  describe("Rendering", () => {
    it("should render import export controls", () => {
      render(
        <ImportExportControls
          handleExport={mockHandleExport}
          handleImport={mockHandleImport}
          jsonInput=""
        />,
      );

      // Should render without crashing
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should render with json input", () => {
      render(
        <ImportExportControls
          handleExport={mockHandleExport}
          handleImport={mockHandleImport}
          jsonInput='{"test": "data"}'
        />,
      );

      // Should render without crashing
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe("Props", () => {
    it("should accept all props without crashing", () => {
      render(
        <ImportExportControls
          handleExport={mockHandleExport}
          handleImport={mockHandleImport}
          jsonInput='{"example": "json"}'
        />,
      );

      // Should render without crashing
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
