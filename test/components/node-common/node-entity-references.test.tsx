import { describe, it, expect, vi, beforeEach } from "vitest";
import { NodeEntityReferences } from "@components/node-common/node-entity-references";
import { EntityType, EntityReference } from "@models/common.types";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock Ant Design components
vi.mock("antd", () => ({
  Button: vi.fn(({ children, onClick, type, danger, size, icon, ...props }) => (
    <button
      onClick={onClick}
      data-type={type}
      data-danger={danger}
      data-size={size}
      data-testid="button"
      {...props}
    >
      {icon}
      {children}
    </button>
  )),
  List: Object.assign(
    vi.fn(({ dataSource, renderItem, size, bordered, locale, ...props }) => (
      <div
        data-testid="list"
        data-size={size}
        data-bordered={bordered}
        {...props}
      >
        {dataSource && dataSource.length > 0 ? (
          dataSource.map((item: EntityReference, index: number) => (
            <div key={index} data-testid={`list-item-${index}`}>
              {renderItem && renderItem(item, index)}
            </div>
          ))
        ) : (
          <div data-testid="empty-list">{locale?.emptyText || "No data"}</div>
        )}
      </div>
    )),
    {
      Item: vi.fn(({ children, style, ...props }) => (
        <div data-testid="list-item" style={style} {...props}>
          {children}
        </div>
      )),
    },
  ),
  Typography: {
    Text: vi.fn(({ children, ...props }) => (
      <span data-testid="text" {...props}>
        {children}
      </span>
    )),
    Title: vi.fn(({ children, level, ...props }) => (
      <h1 data-level={level} {...props}>
        {children}
      </h1>
    )),
  },
  Collapse: Object.assign(
    vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
    {
      Panel: vi.fn(({ children, ...props }) => (
        <div {...props}>{children}</div>
      )),
    },
  ),
  Card: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  Input: vi.fn((props) => <input {...props} />),
  InputNumber: vi.fn((props) => <input type="number" {...props} />),
  Select: vi.fn(({ children, ...props }) => (
    <select {...props}>{children}</select>
  )),
  Space: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  Tag: vi.fn(({ children, ...props }) => <span {...props}>{children}</span>),
  Badge: vi.fn(({ children, ...props }) => <span {...props}>{children}</span>),
}));

// Mock Ant Design icons
vi.mock("@ant-design/icons", () => ({
  DeleteOutlined: vi.fn(() => <span data-testid="delete-icon">🗑️</span>),
  PlusOutlined: vi.fn(() => <span data-testid="plus-icon">➕</span>),
}));

// Mock components
vi.mock("@components/common/entity-reference-select", () => ({
  EntityReferenceSelect: vi.fn(
    ({ entityType, value, onChange, size, ...props }) => (
      <select
        data-testid="entity-reference-select"
        data-entity-type={entityType}
        data-size={size}
        value={value}
        onChange={(e) =>
          onChange &&
          onChange({
            id: e.target.value,
            key: e.target.value,
            owner: "Octoio",
            type: entityType,
            version: 1,
          })
        }
        {...props}
      >
        <option value="">Select...</option>
        <option value="test-item-1">Test Item 1</option>
        <option value="test-item-2">Test Item 2</option>
      </select>
    ),
  ),
}));

vi.mock("./node-interactive", () => ({
  NodeInteractive: vi.fn(({ children }) => (
    <div data-testid="node-interactive" className="nodrag">
      {children}
    </div>
  )),
}));

describe("NodeEntityReferences", () => {
  const defaultProps = {
    entityType: EntityType.Equipment,
    title: "Test Items",
    values: [],
    onChange: vi.fn(),
  };

  const mockEntityReference: EntityReference = {
    id: "test-item-1",
    key: "test-item-1",
    owner: "Octoio",
    type: EntityType.Equipment,
    version: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render the title", () => {
      render(<NodeEntityReferences {...defaultProps} />);

      expect(screen.getByTestId("text")).toHaveTextContent("Test Items");
    });

    it("should render add button", () => {
      render(<NodeEntityReferences {...defaultProps} />);

      const addButton = screen.getByTestId("button");
      expect(addButton).toBeInTheDocument();
      expect(addButton).toHaveTextContent("Add");
    });

    it("should render empty list when no values", () => {
      render(<NodeEntityReferences {...defaultProps} />);

      expect(screen.getByTestId("list")).toBeInTheDocument();
      expect(screen.getByTestId("empty-list")).toHaveTextContent("No data");
    });

    it("should render list items when values provided", () => {
      const props = {
        ...defaultProps,
        values: [mockEntityReference],
      };

      render(<NodeEntityReferences {...props} />);

      expect(screen.getByTestId("list-item-0")).toBeInTheDocument();
    });
  });

  describe("Adding Entities", () => {
    it("should call onChange with new entity when add button is clicked", () => {
      const onChange = vi.fn();
      const props = {
        ...defaultProps,
        onChange,
      };

      render(<NodeEntityReferences {...props} />);

      fireEvent.click(screen.getByTestId("button"));

      expect(onChange).toHaveBeenCalledWith([
        {
          id: "",
          key: "",
          owner: "Octoio",
          type: EntityType.Equipment,
          version: 1,
        },
      ]);
    });

    it("should add entity to existing values", () => {
      const onChange = vi.fn();
      const props = {
        ...defaultProps,
        values: [mockEntityReference],
        onChange,
      };

      render(<NodeEntityReferences {...props} />);

      // Click the add button (first button, which has the plus icon)
      const addButton = screen.getAllByTestId("button")[0];
      fireEvent.click(addButton);

      expect(onChange).toHaveBeenCalledWith([
        mockEntityReference,
        {
          id: "",
          key: "",
          owner: "Octoio",
          type: EntityType.Equipment,
          version: 1,
        },
      ]);
    });
  });

  describe("Entity Selection", () => {
    it("should render EntityReferenceSelect within list items", () => {
      const props = {
        ...defaultProps,
        values: [{ ...mockEntityReference, key: "" }],
      };

      render(<NodeEntityReferences {...props} />);

      expect(screen.getByTestId("entity-reference-select")).toBeInTheDocument();
    });

    it("should wrap EntityReferenceSelect in NodeInteractive", () => {
      const props = {
        ...defaultProps,
        values: [{ ...mockEntityReference, key: "" }],
      };

      render(<NodeEntityReferences {...props} />);

      // Check for elements with the nodrag class, which is what NodeInteractive adds
      const nodeInteractiveElements = screen.getAllByText(
        (_content, element) => {
          return element?.classList.contains("nodrag") || false;
        },
      );
      expect(nodeInteractiveElements.length).toBeGreaterThan(0);
    });
  });

  describe("Entity Types", () => {
    it("should work with different entity types", () => {
      const entityTypes = [
        EntityType.Equipment,
        EntityType.Weapon,
        EntityType.Status,
      ];

      entityTypes.forEach((entityType) => {
        const props = {
          ...defaultProps,
          entityType,
          values: [{ ...mockEntityReference, type: entityType, key: "" }],
        };

        const { unmount } = render(<NodeEntityReferences {...props} />);

        const select = screen.getByTestId("entity-reference-select");
        expect(select).toHaveAttribute("data-entity-type", entityType);

        unmount();
      });
    });
  });
});
