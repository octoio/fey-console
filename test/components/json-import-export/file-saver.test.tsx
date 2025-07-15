import React from "react";
import { describe, it, expect, vi } from "vitest";
import { FileSaver } from "@components/json-import-export/file-saver";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock styled-components - handle both styled.div and styled(Component)
vi.mock("@emotion/styled", () => {
  const mockStyled = (component: React.ComponentType) => () => component;
  mockStyled.div = () => "div";
  return { default: mockStyled };
});

// Mock antd components simply
vi.mock("antd", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children?: React.ReactNode;
  }) => React.createElement("button", props, children),
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) =>
    React.createElement("input", props),
}));

describe("FileSaver", () => {
  const defaultProps = {
    destinationFile: "",
    selectedFile: "test.skill.json",
    onChange: vi.fn(),
    onSave: vi.fn(),
    disabled: false,
  };

  it("should render save button and input", () => {
    render(<FileSaver {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: /save to file/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("should call onChange when input value changes", async () => {
    const mockOnChange = vi.fn();
    const user = userEvent.setup();

    render(<FileSaver {...defaultProps} onChange={mockOnChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "new-file.json");

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("should call onSave when save button is clicked", async () => {
    const mockOnSave = vi.fn();
    const user = userEvent.setup();

    render(<FileSaver {...defaultProps} onSave={mockOnSave} />);

    const saveButton = screen.getByRole("button", { name: /save to file/i });
    await user.click(saveButton);

    expect(mockOnSave).toHaveBeenCalled();
  });

  it("should display destinationFile when provided", () => {
    render(<FileSaver {...defaultProps} destinationFile="custom-file.json" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("custom-file.json");
  });

  it("should display selectedFile when destinationFile is empty", () => {
    render(<FileSaver {...defaultProps} destinationFile="" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("test.skill.json");
  });

  it("should disable save button when disabled prop is true", () => {
    render(<FileSaver {...defaultProps} disabled={true} />);

    const saveButton = screen.getByRole("button", { name: /save to file/i });
    expect(saveButton).toBeDisabled();
  });

  it("should enable save button when disabled prop is false", () => {
    render(<FileSaver {...defaultProps} disabled={false} />);

    const saveButton = screen.getByRole("button", { name: /save to file/i });
    expect(saveButton).not.toBeDisabled();
  });
});
