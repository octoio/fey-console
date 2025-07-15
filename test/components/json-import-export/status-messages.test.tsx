import { describe, it, expect } from "vitest";
import { StatusMessages } from "@components/json-import-export/status-messages";
import { render, screen } from "@testing-library/react";

describe("StatusMessages", () => {
  describe("Error Messages", () => {
    it("should render error message when error prop is provided", () => {
      const errorMessage = "Failed to save file";
      render(<StatusMessages error={errorMessage} success={null} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveClass("ant-alert-error");
    });

    it("should not render error message when error prop is null", () => {
      render(<StatusMessages error={null} success={null} />);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("should not render error message when error prop is empty string", () => {
      render(<StatusMessages error="" success={null} />);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("Success Messages", () => {
    it("should render success message when success prop is provided", () => {
      const successMessage = "File saved successfully";
      render(<StatusMessages error={null} success={successMessage} />);

      expect(screen.getByText(successMessage)).toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveClass("ant-alert-success");
    });

    it("should not render success message when success prop is null", () => {
      render(<StatusMessages error={null} success={null} />);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("should not render success message when success prop is empty string", () => {
      render(<StatusMessages error={null} success="" />);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("Both Messages", () => {
    it("should render both error and success messages when both props are provided", () => {
      const errorMessage = "Failed to save file";
      const successMessage = "File loaded successfully";

      render(<StatusMessages error={errorMessage} success={successMessage} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText(successMessage)).toBeInTheDocument();

      const alerts = screen.getAllByRole("alert");
      expect(alerts).toHaveLength(2);
      expect(alerts[0]).toHaveClass("ant-alert-error");
      expect(alerts[1]).toHaveClass("ant-alert-success");
    });

    it("should render no messages when both props are null", () => {
      render(<StatusMessages error={null} success={null} />);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("should render no messages when both props are empty strings", () => {
      render(<StatusMessages error="" success="" />);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    it("should have proper alert attributes", () => {
      const errorMessage = "Test error";
      const successMessage = "Test success";

      render(<StatusMessages error={errorMessage} success={successMessage} />);

      const alerts = screen.getAllByRole("alert");

      // Error alert
      expect(alerts[0]).toHaveAttribute(
        "class",
        expect.stringContaining("ant-alert"),
      );
      expect(alerts[0]).toHaveAttribute(
        "class",
        expect.stringContaining("ant-alert-error"),
      );

      // Success alert
      expect(alerts[1]).toHaveAttribute(
        "class",
        expect.stringContaining("ant-alert"),
      );
      expect(alerts[1]).toHaveAttribute(
        "class",
        expect.stringContaining("ant-alert-success"),
      );
    });

    it("should render fragment as root element", () => {
      const { container } = render(
        <StatusMessages error="test" success="test" />,
      );

      // Fragment doesn't create a wrapper element, so container should have the alerts directly
      expect(container.children).toHaveLength(2);
      expect(container.firstChild).toHaveClass("ant-alert");
    });
  });

  describe("Edge Cases", () => {
    it("should handle long error messages", () => {
      const longMessage =
        "This is a very long error message that contains many words and should still be rendered properly without breaking the component layout or functionality";

      render(<StatusMessages error={longMessage} success={null} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it("should handle long success messages", () => {
      const longMessage =
        "This is a very long success message that contains many words and should still be rendered properly without breaking the component layout or functionality";

      render(<StatusMessages error={null} success={longMessage} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it("should handle special characters in messages", () => {
      const specialMessage = "Error: File 'test@file#.json' not found! (404)";

      render(<StatusMessages error={specialMessage} success={null} />);

      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });

    it("should handle HTML-like strings in messages", () => {
      const htmlLikeMessage = "<script>alert('test')</script>";

      render(<StatusMessages error={htmlLikeMessage} success={null} />);

      expect(screen.getByText(htmlLikeMessage)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes for error alerts", () => {
      render(<StatusMessages error="Test error" success={null} />);

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute("role", "alert");
    });

    it("should have proper ARIA attributes for success alerts", () => {
      render(<StatusMessages error={null} success="Test success" />);

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute("role", "alert");
    });

    it("should maintain accessibility with multiple alerts", () => {
      render(<StatusMessages error="Test error" success="Test success" />);

      const alerts = screen.getAllByRole("alert");
      expect(alerts).toHaveLength(2);
      alerts.forEach((alert) => {
        expect(alert).toHaveAttribute("role", "alert");
      });
    });
  });
});
