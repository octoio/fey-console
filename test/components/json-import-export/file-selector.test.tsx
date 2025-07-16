import { describe, it, expect, vi } from "vitest";
import { FileSelector } from "@components/json-import-export/file-selector";
import { render, screen } from "@testing-library/react";

describe("FileSelector", () => {
  const mockOnFileSelect = vi.fn();
  const mockFiles = [
    {
      name: "test.skill.json",
      type: "skill",
      path: "/path/test.skill.json",
      isEntity: true,
    },
    {
      name: "weapon.weapon.json",
      type: "weapon",
      path: "/path/weapon.weapon.json",
      isEntity: true,
    },
  ];

  describe("Rendering", () => {
    it("should render file selector with files", () => {
      render(
        <FileSelector files={mockFiles} onFileSelect={mockOnFileSelect} />,
      );

      // Should render without crashing
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("should render with empty files array", () => {
      render(<FileSelector files={[]} onFileSelect={mockOnFileSelect} />);

      // Should render without crashing
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("should render with required props only", () => {
      render(
        <FileSelector files={mockFiles} onFileSelect={mockOnFileSelect} />,
      );

      // Should render without crashing
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });

  describe("Props", () => {
    it("should render with callback function", () => {
      render(
        <FileSelector files={mockFiles} onFileSelect={mockOnFileSelect} />,
      );

      // Should render without crashing
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });
});
