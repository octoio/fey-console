import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ImportExportControls } from "@components/json-import-export/import-export-controls";
import { useSkillStore } from "@store/skill.store";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock the skill store
vi.mock("@store/skill.store", () => ({
  useSkillStore: vi.fn(),
}));

// Mock Ant Design components
vi.mock("antd", () => ({
  Button: vi.fn(({ children, onClick, disabled, type, ...props }) => (
    <button onClick={onClick} disabled={disabled} data-type={type} {...props}>
      {children}
    </button>
  )),
  Space: vi.fn(({ children, ...props }) => (
    <div data-testid="space" {...props}>
      {children}
    </div>
  )),
  Typography: {
    Title: vi.fn(({ children, level, ...props }) => (
      <h1 data-level={level} {...props}>
        {children}
      </h1>
    )),
  },
}));

// Mock styled-components to return a component wrapper that handles template literals
vi.mock("@emotion/styled", () => ({
  __esModule: true,
  default: vi.fn((Component) => {
    const styledWrapper = () => {
      const StyledComponent = React.forwardRef((props, ref) =>
        React.createElement(Component, { ...props, ref }),
      );
      StyledComponent.displayName = `Styled(${Component.displayName || Component.name || "Component"})`;
      return StyledComponent;
    };
    return styledWrapper;
  }),
}));

describe("ImportExportControls", () => {
  const mockHandleExport = vi.fn();
  const mockHandleImport = vi.fn();
  const mockUseSkillStore = vi.mocked(useSkillStore);

  const defaultProps = {
    handleExport: mockHandleExport,
    handleImport: mockHandleImport,
    jsonInput: "test json",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders title correctly", () => {
    mockUseSkillStore.mockReturnValue({
      skillData: null,
    } as ReturnType<typeof useSkillStore>);

    render(<ImportExportControls {...defaultProps} />);

    const title = screen.getByText("JSON Import/Export");
    expect(title).toBeInTheDocument();
    expect(title).toHaveAttribute("data-level", "5");
  });

  it("renders export and import buttons", () => {
    mockUseSkillStore.mockReturnValue({
      skillData: { name: "Test Skill" },
    } as ReturnType<typeof useSkillStore>);

    render(<ImportExportControls {...defaultProps} />);

    const exportButton = screen.getByText("Export Current Skill");
    const importButton = screen.getByText("Import JSON");

    expect(exportButton).toBeInTheDocument();
    expect(importButton).toBeInTheDocument();
    expect(exportButton).toHaveAttribute("data-type", "primary");
    expect(importButton).toHaveAttribute("data-type", "primary");
  });

  it("disables export button when no skill data", () => {
    mockUseSkillStore.mockReturnValue({
      skillData: null,
    } as ReturnType<typeof useSkillStore>);

    render(<ImportExportControls {...defaultProps} />);

    const exportButton = screen.getByText("Export Current Skill");
    expect(exportButton).toBeDisabled();
  });

  it("enables export button when skill data exists", () => {
    mockUseSkillStore.mockReturnValue({
      skillData: { name: "Test Skill" },
    } as ReturnType<typeof useSkillStore>);

    render(<ImportExportControls {...defaultProps} />);

    const exportButton = screen.getByText("Export Current Skill");
    expect(exportButton).not.toBeDisabled();
  });

  it("disables import button when no json input", () => {
    mockUseSkillStore.mockReturnValue({
      skillData: { name: "Test Skill" },
    } as ReturnType<typeof useSkillStore>);

    render(<ImportExportControls {...defaultProps} jsonInput="" />);

    const importButton = screen.getByText("Import JSON");
    expect(importButton).toBeDisabled();
  });

  it("disables import button when json input is only whitespace", () => {
    mockUseSkillStore.mockReturnValue({
      skillData: { name: "Test Skill" },
    } as ReturnType<typeof useSkillStore>);

    render(<ImportExportControls {...defaultProps} jsonInput="   " />);

    const importButton = screen.getByText("Import JSON");
    expect(importButton).toBeDisabled();
  });

  it("enables import button when json input is provided", () => {
    mockUseSkillStore.mockReturnValue({
      skillData: null,
    } as ReturnType<typeof useSkillStore>);

    render(<ImportExportControls {...defaultProps} jsonInput="valid json" />);

    const importButton = screen.getByText("Import JSON");
    expect(importButton).not.toBeDisabled();
  });

  it("calls handleExport when export button is clicked", () => {
    mockUseSkillStore.mockReturnValue({
      skillData: { name: "Test Skill" },
    } as ReturnType<typeof useSkillStore>);

    render(<ImportExportControls {...defaultProps} />);

    const exportButton = screen.getByText("Export Current Skill");
    fireEvent.click(exportButton);

    expect(mockHandleExport).toHaveBeenCalledTimes(1);
  });

  it("calls handleImport when import button is clicked", () => {
    mockUseSkillStore.mockReturnValue({
      skillData: null,
    } as ReturnType<typeof useSkillStore>);

    render(<ImportExportControls {...defaultProps} jsonInput="valid json" />);

    const importButton = screen.getByText("Import JSON");
    fireEvent.click(importButton);

    expect(mockHandleImport).toHaveBeenCalledTimes(1);
  });

  it("renders controls container with space component", () => {
    mockUseSkillStore.mockReturnValue({
      skillData: null,
    } as ReturnType<typeof useSkillStore>);

    render(<ImportExportControls {...defaultProps} />);

    const spaceContainer = screen.getByTestId("space");
    expect(spaceContainer).toBeInTheDocument();
  });

  it("handles edge case with undefined skillData", () => {
    mockUseSkillStore.mockReturnValue({
      skillData: undefined,
    } as ReturnType<typeof useSkillStore>);

    render(<ImportExportControls {...defaultProps} />);

    const exportButton = screen.getByText("Export Current Skill");
    expect(exportButton).toBeDisabled();
  });

  it("handles edge case with falsy skillData", () => {
    mockUseSkillStore.mockReturnValue({
      skillData: false,
    } as ReturnType<typeof useSkillStore>);

    render(<ImportExportControls {...defaultProps} />);

    const exportButton = screen.getByText("Export Current Skill");
    expect(exportButton).toBeDisabled();
  });
});
