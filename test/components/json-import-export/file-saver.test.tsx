import { describe, it, expect, vi, beforeEach } from "vitest";
import { FileSaver } from "@components/json-import-export/file-saver";
import { render, screen, fireEvent } from "@testing-library/react";

describe("FileSaver", () => {
  const mockOnChange = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render file saver interface", () => {
      render(
        <FileSaver
          destinationFile=""
          selectedFile=""
          onChange={mockOnChange}
          onSave={mockOnSave}
          disabled={false}
        />,
      );

      expect(
        screen.getByPlaceholderText("Destination file path"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /save to file/i }),
      ).toBeInTheDocument();
    });

    it("should show destination file in input when provided", () => {
      render(
        <FileSaver
          destinationFile="custom-path.json"
          selectedFile="original.json"
          onChange={mockOnChange}
          onSave={mockOnSave}
          disabled={false}
        />,
      );

      expect(screen.getByDisplayValue("custom-path.json")).toBeInTheDocument();
    });

    it("should fallback to selected file when no destination file", () => {
      render(
        <FileSaver
          destinationFile=""
          selectedFile="fallback.json"
          onChange={mockOnChange}
          onSave={mockOnSave}
          disabled={false}
        />,
      );

      expect(screen.getByDisplayValue("fallback.json")).toBeInTheDocument();
    });

    it("should disable save button when disabled prop is true", () => {
      render(
        <FileSaver
          destinationFile=""
          selectedFile=""
          onChange={mockOnChange}
          onSave={mockOnSave}
          disabled={true}
        />,
      );

      const saveButton = screen.getByRole("button", { name: /save to file/i });
      expect(saveButton).toBeDisabled();
    });

    it("should enable save button when disabled prop is false", () => {
      render(
        <FileSaver
          destinationFile=""
          selectedFile=""
          onChange={mockOnChange}
          onSave={mockOnSave}
          disabled={false}
        />,
      );

      const saveButton = screen.getByRole("button", { name: /save to file/i });
      expect(saveButton).not.toBeDisabled();
    });
  });

  describe("Interactions", () => {
    it("should call onChange when input value changes", () => {
      render(
        <FileSaver
          destinationFile=""
          selectedFile=""
          onChange={mockOnChange}
          onSave={mockOnSave}
          disabled={false}
        />,
      );

      const input = screen.getByPlaceholderText("Destination file path");
      fireEvent.change(input, { target: { value: "new-file.json" } });

      expect(mockOnChange).toHaveBeenCalledWith("new-file.json");
    });

    it("should call onSave when save button is clicked", () => {
      render(
        <FileSaver
          destinationFile="test.json"
          selectedFile=""
          onChange={mockOnChange}
          onSave={mockOnSave}
          disabled={false}
        />,
      );

      const saveButton = screen.getByRole("button", { name: /save to file/i });
      fireEvent.click(saveButton);

      expect(mockOnSave).toHaveBeenCalled();
    });

    it("should not call onSave when button is disabled", () => {
      render(
        <FileSaver
          destinationFile=""
          selectedFile=""
          onChange={mockOnChange}
          onSave={mockOnSave}
          disabled={true}
        />,
      );

      const saveButton = screen.getByRole("button", { name: /save to file/i });
      fireEvent.click(saveButton);

      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty strings for all file paths", () => {
      render(
        <FileSaver
          destinationFile=""
          selectedFile=""
          onChange={mockOnChange}
          onSave={mockOnSave}
          disabled={false}
        />,
      );

      const input = screen.getByPlaceholderText("Destination file path");
      expect(input).toHaveValue("");
    });

    it("should prioritize destination file over selected file", () => {
      render(
        <FileSaver
          destinationFile="priority.json"
          selectedFile="secondary.json"
          onChange={mockOnChange}
          onSave={mockOnSave}
          disabled={false}
        />,
      );

      expect(screen.getByDisplayValue("priority.json")).toBeInTheDocument();
      expect(
        screen.queryByDisplayValue("secondary.json"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Props", () => {
    it("should handle missing callbacks gracefully", () => {
      render(
        <FileSaver
          destinationFile="test.json"
          selectedFile=""
          onChange={() => {}}
          onSave={async () => {}}
          disabled={false}
        />,
      );

      // Should render without errors
      expect(
        screen.getByPlaceholderText("Destination file path"),
      ).toBeInTheDocument();
    });
  });
});
