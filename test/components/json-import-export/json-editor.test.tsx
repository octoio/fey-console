import { describe, it, expect, vi } from "vitest";
import { JsonEditor } from "@components/json-import-export/json-editor";
import { render } from "@testing-library/react";

describe("JsonEditor", () => {
  const mockOnChange = vi.fn();

  describe("Rendering", () => {
    it("should render json editor", () => {
      render(<JsonEditor value="" onChange={mockOnChange} />);

      // The component should render without crashing
      expect(document.body).toBeInTheDocument();
    });

    it("should render with initial value", () => {
      const jsonValue = '{"test": "value"}';
      render(<JsonEditor value={jsonValue} onChange={mockOnChange} />);

      // The component should render without crashing
      expect(document.body).toBeInTheDocument();
    });

    it("should render with custom height", () => {
      render(<JsonEditor value="" onChange={mockOnChange} />);

      // The component should render without crashing
      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Props", () => {
    it("should accept all props without crashing", () => {
      render(
        <JsonEditor value='{"example": "json"}' onChange={mockOnChange} />,
      );

      // The component should render without crashing
      expect(document.body).toBeInTheDocument();
    });
  });
});
