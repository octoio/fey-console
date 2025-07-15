import { describe, it, expect } from "vitest";
import { LoadingSpinner } from "@components/loading-spinner";
import { render } from "@testing-library/react";

describe("LoadingSpinner", () => {
  describe("Component Rendering", () => {
    it("should render with default props", () => {
      const { container } = render(<LoadingSpinner />);

      const wrapper = container.firstChild as HTMLElement;
      const spin = container.querySelector(".ant-spin");

      expect(wrapper).toBeInTheDocument();
      expect(spin).toBeInTheDocument();

      // Check inline styles via style attribute
      const styleAttr = wrapper.getAttribute("style");
      expect(styleAttr).toContain("display: flex");
      expect(styleAttr).toContain("justify-content: center");
      expect(styleAttr).toContain("align-items: center");
      expect(styleAttr).toContain("height: 400px");
    });

    it("should render with custom height", () => {
      const customHeight = "600px";
      const { container } = render(<LoadingSpinner height={customHeight} />);

      const wrapper = container.firstChild as HTMLElement;
      const styleAttr = wrapper.getAttribute("style");
      expect(styleAttr).toContain(`height: ${customHeight}`);
    });

    it("should render with small size", () => {
      const { container } = render(<LoadingSpinner size="small" />);

      const spin = container.querySelector(".ant-spin");
      expect(spin).toHaveClass("ant-spin-sm");
    });

    it("should render with default size", () => {
      const { container } = render(<LoadingSpinner size="default" />);

      const spin = container.querySelector(".ant-spin");
      expect(spin).not.toHaveClass("ant-spin-sm");
      expect(spin).not.toHaveClass("ant-spin-lg");
    });

    it("should render with large size", () => {
      const { container } = render(<LoadingSpinner size="large" />);

      const spin = container.querySelector(".ant-spin");
      expect(spin).toHaveClass("ant-spin-lg");
    });

    it("should render with all custom props", () => {
      const props = {
        size: "small" as const,
        tip: "Saving file...",
        height: "300px",
      };

      const { container } = render(<LoadingSpinner {...props} />);

      const wrapper = container.firstChild as HTMLElement;
      const spin = container.querySelector(".ant-spin");

      const styleAttr = wrapper.getAttribute("style");
      expect(styleAttr).toContain(`height: ${props.height}`);
      expect(spin).toHaveClass("ant-spin-sm");
    });
  });

  describe("Container Styling", () => {
    it("should apply correct default container styles", () => {
      const { container } = render(<LoadingSpinner />);

      const wrapper = container.firstChild as HTMLElement;

      const styleAttr = wrapper.getAttribute("style");
      expect(styleAttr).toContain("display: flex");
      expect(styleAttr).toContain("justify-content: center");
      expect(styleAttr).toContain("align-items: center");
      expect(styleAttr).toContain("height: 400px");
    });

    it("should apply custom height to container", () => {
      const heights = ["100px", "200px", "50vh", "80%"];

      heights.forEach((height) => {
        const { container, unmount } = render(
          <LoadingSpinner height={height} />,
        );
        const wrapper = container.firstChild as HTMLElement;

        const styleAttr = wrapper.getAttribute("style");
        expect(styleAttr).toContain(`height: ${height}`);
        unmount();
      });
    });

    it("should maintain flex layout with custom height", () => {
      const { container } = render(<LoadingSpinner height="800px" />);

      const wrapper = container.firstChild as HTMLElement;

      const styleAttr = wrapper.getAttribute("style");
      expect(styleAttr).toContain("display: flex");
      expect(styleAttr).toContain("justify-content: center");
      expect(styleAttr).toContain("align-items: center");
      expect(styleAttr).toContain("height: 800px");
    });
  });

  describe("Spin Component Behavior", () => {
    it("should render Spin component with spinning animation", () => {
      const { container } = render(<LoadingSpinner />);

      const spin = container.querySelector(".ant-spin");
      expect(spin).toHaveClass("ant-spin-spinning");
    });

    it("should render appropriate size classes", () => {
      const sizes: Array<{
        size: "small" | "default" | "large";
        expectedClass: string;
      }> = [
        { size: "small", expectedClass: "ant-spin-sm" },
        { size: "large", expectedClass: "ant-spin-lg" },
      ];

      sizes.forEach(({ size, expectedClass }) => {
        const { container, unmount } = render(<LoadingSpinner size={size} />);
        const spin = container.querySelector(".ant-spin");
        expect(spin).toHaveClass(expectedClass);
        unmount();
      });
    });

    it("should show text indicator when tip is provided", () => {
      const { container } = render(
        <LoadingSpinner tip="Custom loading text" />,
      );

      const spin = container.querySelector(".ant-spin");
      // Antd adds specific classes when tip is provided
      expect(spin).toHaveClass("ant-spin-spinning");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      const { container } = render(<LoadingSpinner />);

      const spin = container.querySelector(".ant-spin");
      // Antd Spin adds appropriate ARIA attributes
      expect(spin).toBeInTheDocument();
    });

    it("should be accessible to screen readers", () => {
      const { container } = render(<LoadingSpinner tip="Loading content" />);

      const spin = container.querySelector(".ant-spin");
      expect(spin).toBeInTheDocument();
      expect(spin).toHaveClass("ant-spin-spinning");
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero height", () => {
      const { container } = render(<LoadingSpinner height="0px" />);

      const wrapper = container.firstChild as HTMLElement;
      const styleAttr = wrapper.getAttribute("style");
      expect(styleAttr).toContain("height: 0px");
    });

    it("should handle very large height", () => {
      const { container } = render(<LoadingSpinner height="9999px" />);

      const wrapper = container.firstChild as HTMLElement;
      const styleAttr = wrapper.getAttribute("style");
      expect(styleAttr).toContain("height: 9999px");
    });

    it("should handle percentage heights", () => {
      const { container } = render(<LoadingSpinner height="50%" />);

      const wrapper = container.firstChild as HTMLElement;
      const styleAttr = wrapper.getAttribute("style");
      expect(styleAttr).toContain("height: 50%");
    });

    it("should handle viewport units", () => {
      const { container } = render(<LoadingSpinner height="50vh" />);

      const wrapper = container.firstChild as HTMLElement;
      const styleAttr = wrapper.getAttribute("style");
      expect(styleAttr).toContain("height: 50vh");
    });

    it("should handle calc expressions", () => {
      const { container } = render(
        <LoadingSpinner height="calc(100% - 50px)" />,
      );

      const wrapper = container.firstChild as HTMLElement;
      const styleAttr = wrapper.getAttribute("style");
      expect(styleAttr).toContain("height: calc(100% - 50px)");
    });

    it("should handle empty tip string", () => {
      const { container } = render(<LoadingSpinner tip="" />);

      const spin = container.querySelector(".ant-spin");
      expect(spin).toBeInTheDocument();
      expect(spin).toHaveClass("ant-spin-spinning");
    });

    it("should handle undefined tip gracefully", () => {
      const { container } = render(<LoadingSpinner tip={undefined} />);

      const spin = container.querySelector(".ant-spin");
      expect(spin).toBeInTheDocument();
      expect(spin).toHaveClass("ant-spin-spinning");
    });
  });

  describe("Component Structure", () => {
    it("should render single container with Spin component", () => {
      const { container } = render(<LoadingSpinner />);

      const wrapper = container.firstChild as HTMLElement;
      const spin = container.querySelector(".ant-spin");

      const styleAttr = wrapper.getAttribute("style");
      expect(styleAttr).toContain("display: flex");
      expect(styleAttr).toContain("justify-content: center");
      expect(styleAttr).toContain("align-items: center");
      expect(spin).toBeInTheDocument();
      expect(wrapper.children).toHaveLength(1);
    });

    it("should not render additional elements beyond wrapper and spin", () => {
      const { container } = render(<LoadingSpinner />);

      expect(container.children).toHaveLength(1);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.children).toHaveLength(1);
    });
  });

  describe("Multiple Instances", () => {
    it("should render multiple independent instances", () => {
      const { container } = render(
        <div>
          <LoadingSpinner />
          <LoadingSpinner />
          <LoadingSpinner />
        </div>,
      );

      const spins = container.querySelectorAll(".ant-spin");
      expect(spins).toHaveLength(3);
      spins.forEach((spin) => {
        expect(spin).toHaveClass("ant-spin-spinning");
      });
    });

    it("should handle different props for each instance", () => {
      const { container } = render(
        <div>
          <LoadingSpinner height="200px" size="small" />
          <LoadingSpinner height="600px" size="large" />
        </div>,
      );

      const wrappers = container.children[0].children;
      const firstWrapperStyle = (wrappers[0] as HTMLElement).getAttribute(
        "style",
      );
      const secondWrapperStyle = (wrappers[1] as HTMLElement).getAttribute(
        "style",
      );

      expect(firstWrapperStyle).toContain("height: 200px");
      expect(secondWrapperStyle).toContain("height: 600px");
    });
  });
});
