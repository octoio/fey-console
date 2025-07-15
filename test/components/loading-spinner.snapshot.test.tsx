import { describe, it, expect } from "vitest";
import { LoadingSpinner } from "@components/loading-spinner";
import { render } from "@testing-library/react";

describe("LoadingSpinner Snapshots", () => {
  describe("Default Props Snapshots", () => {
    it("should match snapshot with default props", () => {
      const { container } = render(<LoadingSpinner />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe("Size Variations Snapshots", () => {
    it("should match snapshot with small size", () => {
      const { container } = render(<LoadingSpinner size="small" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with default size", () => {
      const { container } = render(<LoadingSpinner size="default" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with large size", () => {
      const { container } = render(<LoadingSpinner size="large" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe("Tip Text Variations Snapshots", () => {
    it("should match snapshot with custom tip", () => {
      const { container } = render(<LoadingSpinner tip="Please wait..." />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with empty tip", () => {
      const { container } = render(<LoadingSpinner tip="" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with special characters in tip", () => {
      const { container } = render(
        <LoadingSpinner tip="Loading... 🔄 (50%)" />,
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with long tip text", () => {
      const { container } = render(
        <LoadingSpinner tip="This is a very long loading message that might wrap to multiple lines" />,
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe("Height Variations Snapshots", () => {
    it("should match snapshot with custom pixel height", () => {
      const { container } = render(<LoadingSpinner height="600px" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with percentage height", () => {
      const { container } = render(<LoadingSpinner height="50%" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with viewport height", () => {
      const { container } = render(<LoadingSpinner height="100vh" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with calc height", () => {
      const { container } = render(
        <LoadingSpinner height="calc(100% - 50px)" />,
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with small height", () => {
      const { container } = render(<LoadingSpinner height="100px" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe("Combined Props Snapshots", () => {
    it("should match snapshot with small size and custom tip", () => {
      const { container } = render(
        <LoadingSpinner size="small" tip="Saving..." />,
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with all custom props", () => {
      const { container } = render(
        <LoadingSpinner
          size="default"
          tip="Processing data..."
          height="300px"
        />,
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with large size, long tip, and custom height", () => {
      const { container } = render(
        <LoadingSpinner
          size="large"
          tip="Loading large dataset, this may take a few moments..."
          height="500px"
        />,
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with minimal height and no tip", () => {
      const { container } = render(
        <LoadingSpinner size="small" tip="" height="50px" />,
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe("Edge Cases Snapshots", () => {
    it("should match snapshot with zero height", () => {
      const { container } = render(<LoadingSpinner height="0px" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with very large height", () => {
      const { container } = render(<LoadingSpinner height="9999px" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with numeric characters in tip", () => {
      const { container } = render(<LoadingSpinner tip="Loading 12345..." />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with special unicode characters", () => {
      const { container } = render(
        <LoadingSpinner tip="Загрузка... ☕ 読み込み中" />,
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe("Multiple Instances Snapshots", () => {
    it("should match snapshot with multiple different spinners", () => {
      const { container } = render(
        <div>
          <LoadingSpinner size="small" tip="Loading 1" height="200px" />
          <LoadingSpinner size="default" tip="Loading 2" height="300px" />
          <LoadingSpinner size="large" tip="Loading 3" height="400px" />
        </div>,
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with identical spinners", () => {
      const { container } = render(
        <div>
          <LoadingSpinner />
          <LoadingSpinner />
        </div>,
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe("Component Structure Snapshots", () => {
    it("should match snapshot showing complete component structure", () => {
      const { container } = render(
        <LoadingSpinner
          size="large"
          tip="Complete structure test"
          height="400px"
        />,
      );
      // Capture the entire component tree
      expect(container).toMatchSnapshot();
    });

    it("should match snapshot of wrapper div only", () => {
      const { container } = render(<LoadingSpinner />);
      // Focus on just the wrapper div
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
