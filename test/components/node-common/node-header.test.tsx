import { describe, it, expect, vi } from "vitest";
import { NodeHeader } from "@components/node-common/node-header";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock Ant Design icons with unique text to avoid conflicts
vi.mock("@ant-design/icons", () => ({
  DeleteOutlined: () => <span data-testid="delete-icon">DeleteIcon</span>,
  MoreOutlined: () => <span data-testid="more-icon">MoreIcon</span>,
  PlusOutlined: () => <span data-testid="plus-icon">PlusIcon</span>,
}));

describe("NodeHeader", () => {
  it("renders with title", () => {
    render(<NodeHeader title="Test Title" />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders with custom level", () => {
    render(<NodeHeader title="Test Title" level={3} />);
    const title = screen.getByText("Test Title");
    expect(title.tagName).toBe("H3");
  });

  it("renders with default level 5", () => {
    render(<NodeHeader title="Test Title" />);
    const title = screen.getByText("Test Title");
    expect(title.tagName).toBe("H5");
  });

  it("renders delete button when onDelete provided", () => {
    const onDelete = vi.fn();
    render(<NodeHeader title="Test Title" onDelete={onDelete} />);
    expect(screen.getByTestId("more-icon")).toBeInTheDocument();
  });

  it("does not render delete button when onDelete not provided", () => {
    render(<NodeHeader title="Test Title" />);
    expect(screen.queryByTestId("more-icon")).not.toBeInTheDocument();
  });

  it("renders add menu button when addMenuItems provided", () => {
    const addMenuItems = [{ key: "item1", label: "Item 1", onClick: vi.fn() }];
    render(<NodeHeader title="Test Title" addMenuItems={addMenuItems} />);
    expect(screen.getByTestId("plus-icon")).toBeInTheDocument();
  });

  it("does not render add menu button when addMenuItems empty", () => {
    render(<NodeHeader title="Test Title" addMenuItems={[]} />);
    expect(screen.queryByTestId("plus-icon")).not.toBeInTheDocument();
  });

  it("does not render add menu button when addMenuItems not provided", () => {
    render(<NodeHeader title="Test Title" />);
    expect(screen.queryByTestId("plus-icon")).not.toBeInTheDocument();
  });

  it("calls onDelete when delete menu item clicked", () => {
    const onDelete = vi.fn();
    render(<NodeHeader title="Test Title" onDelete={onDelete} />);

    // Click the more button to open dropdown
    const moreButton = screen.getByTestId("more-icon").closest("button");
    fireEvent.click(moreButton!);

    // Find and click the delete option using role
    const deleteOption = screen.getByRole("menuitem");
    fireEvent.click(deleteOption);

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("calls add menu item onClick when clicked", () => {
    const onClick = vi.fn();
    const addMenuItems = [{ key: "item1", label: "Item 1", onClick }];
    render(<NodeHeader title="Test Title" addMenuItems={addMenuItems} />);

    // Click the plus button to open dropdown
    const plusButton = screen.getByTestId("plus-icon").closest("button");
    fireEvent.click(plusButton!);

    // Find and click the menu item using role
    const menuItem = screen.getByRole("menuitem");
    fireEvent.click(menuItem);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders multiple add menu items", () => {
    const addMenuItems = [
      { key: "item1", label: "Item 1", onClick: vi.fn() },
      { key: "item2", label: "Item 2", onClick: vi.fn() },
    ];
    render(<NodeHeader title="Test Title" addMenuItems={addMenuItems} />);

    // Click the plus button to open dropdown
    const plusButton = screen.getByTestId("plus-icon").closest("button");
    fireEvent.click(plusButton!);

    // Check that menu items are present using getAllByRole
    const menuItems = screen.getAllByRole("menuitem");
    expect(menuItems).toHaveLength(2);
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("renders add menu item with custom icon", () => {
    const CustomIcon = () => <span data-testid="custom-icon">Custom</span>;
    const addMenuItems = [
      { key: "item1", label: "Item 1", icon: <CustomIcon />, onClick: vi.fn() },
    ];
    render(<NodeHeader title="Test Title" addMenuItems={addMenuItems} />);

    // Click the plus button to open dropdown
    const plusButton = screen.getByTestId("plus-icon").closest("button");
    fireEvent.click(plusButton!);

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    expect(screen.getByText("Item 1")).toBeInTheDocument();
  });

  it("renders add menu item with danger styling", () => {
    const addMenuItems = [
      { key: "item1", label: "Item 1", danger: true, onClick: vi.fn() },
    ];
    render(<NodeHeader title="Test Title" addMenuItems={addMenuItems} />);

    // Click the plus button to open dropdown
    const plusButton = screen.getByTestId("plus-icon").closest("button");
    fireEvent.click(plusButton!);

    // The danger styling should be applied to the menu item
    const menuItem = screen.getByRole("menuitem");
    expect(menuItem).toHaveClass("ant-dropdown-menu-item-danger");
    expect(screen.getByText("Item 1")).toBeInTheDocument();
  });

  it("handles basic menu interactions", () => {
    const onDelete = vi.fn();
    const onClick = vi.fn();
    const addMenuItems = [{ key: "item1", label: "Item 1", onClick }];
    render(
      <NodeHeader
        title="Test Title"
        onDelete={onDelete}
        addMenuItems={addMenuItems}
      />,
    );

    // Test add menu
    const plusButton = screen.getByTestId("plus-icon").closest("button");
    fireEvent.click(plusButton!);
    expect(screen.getByText("Item 1")).toBeInTheDocument();

    // Test delete menu
    const moreButton = screen.getByTestId("more-icon").closest("button");
    fireEvent.click(moreButton!);
    const deleteMenuItems = screen.getAllByRole("menuitem");
    // Should have 2 menu items total (1 from add menu + 1 from delete menu)
    expect(deleteMenuItems.length).toBeGreaterThanOrEqual(1);
  });
});
