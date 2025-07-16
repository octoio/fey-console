import { describe, it, expect } from "vitest";
import { LoadingSpinner } from "@components/loading-spinner";
import { render, screen } from "@testing-library/react";

describe("LoadingSpinner", () => {
  describe("Rendering", () => {
    it("should render with default props", () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByTestId("loading-spinner");
      expect(spinner).toBeInTheDocument();
    });

    it("should render with custom size", () => {
      render(<LoadingSpinner size="small" />);

      const spinner = screen.getByTestId("loading-spinner");
      expect(spinner).toBeInTheDocument();
    });

    it("should render with custom tip", () => {
      render(<LoadingSpinner tip="Processing..." />);

      const spinner = screen.getByTestId("loading-spinner");
      expect(spinner).toBeInTheDocument();
    });

    it("should render with custom height", () => {
      render(<LoadingSpinner height="200px" />);

      const spinner = screen.getByTestId("loading-spinner");
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("Props", () => {
    it("should apply all props together", () => {
      render(
        <LoadingSpinner size="large" tip="Custom loading..." height="300px" />,
      );

      const spinner = screen.getByTestId("loading-spinner");
      expect(spinner).toBeInTheDocument();
    });

    it("should handle all size variants", () => {
      const { rerender } = render(<LoadingSpinner size="small" />);
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

      rerender(<LoadingSpinner size="default" />);
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

      rerender(<LoadingSpinner size="large" />);
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("should have spinner container", () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByTestId("loading-spinner");
      expect(spinner).toBeInTheDocument();
    });
  });
});
