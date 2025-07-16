import { describe, it, expect } from "vitest";
import { StatusMessages } from "@components/json-import-export/status-messages";
import { render, screen } from "@testing-library/react";

describe("StatusMessages", () => {
  describe("Rendering", () => {
    it("should render without error or success", () => {
      render(<StatusMessages error={null} success={null} />);

      // Should render without crashing (no messages)
      expect(document.body).toBeInTheDocument();
    });

    it("should render error message", () => {
      render(<StatusMessages error="Test error message" success={null} />);

      expect(screen.getByText("Test error message")).toBeInTheDocument();
    });

    it("should render success message", () => {
      render(<StatusMessages error={null} success="Test success message" />);

      expect(screen.getByText("Test success message")).toBeInTheDocument();
    });

    it("should render both messages", () => {
      render(
        <StatusMessages error="Error message" success="Success message" />,
      );

      expect(screen.getByText("Error message")).toBeInTheDocument();
      expect(screen.getByText("Success message")).toBeInTheDocument();
    });
  });

  describe("Props", () => {
    it("should handle null values gracefully", () => {
      render(<StatusMessages error={null} success={null} />);

      // Should render without crashing
      expect(document.body).toBeInTheDocument();
    });

    it("should handle empty strings", () => {
      render(<StatusMessages error="" success="" />);

      // Should render without crashing
      expect(document.body).toBeInTheDocument();
    });
  });
});
