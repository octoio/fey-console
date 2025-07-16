import { Button, List, Typography } from "antd";
import React from "react";
import { PlusOutlined } from "@ant-design/icons";
import {
  HeaderContainer,
  ListItemContainer,
} from "@components/common/styled-components";
import styled from "@emotion/styled";
import { NodeInteractive } from "./node-interactive";

const { Text } = Typography;

interface TableColumn<T = Record<string, unknown>> {
  title: string;
  dataIndex?: string;
  key: string;
  render?: (text: string, record: T, index: number) => React.ReactNode;
  width?: number;
}

interface NodeTableProps<T = Record<string, unknown>> {
  title: string;
  columns: TableColumn<T>[];
  dataSource: T[];
  onAdd?: () => void;
  addButtonText?: string;
}

const TableHeader = styled(HeaderContainer)`
  margin-bottom: 4px;
`;

const ScrollableList = styled(List)`
  max-height: 200px;
  overflow: auto;
`;

export const NodeTable = <
  T extends Record<string, unknown> = Record<string, unknown>,
>({
  title,
  columns,
  dataSource,
  onAdd,
  addButtonText = "Add",
}: NodeTableProps<T>) => {
  // Function to render the content for each item based on columns configuration
  const renderItem = (item: unknown, index: number) => {
    const record = item as T;
    return (
      <List.Item key={index} style={{ padding: "4px 8px" }}>
        <ListItemContainer>
          {columns.map((column, colIndex) => (
            <div
              key={colIndex}
              style={{ flex: column.width ? `0 0 ${column.width}px` : 1 }}
            >
              {column.render
                ? column.render(
                    String(record[column.dataIndex || ""]),
                    record,
                    index,
                  )
                : String(record[column.dataIndex || ""])}
            </div>
          ))}
        </ListItemContainer>
      </List.Item>
    );
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <TableHeader>
        <Text>{title}</Text>
        {onAdd && (
          <NodeInteractive>
            <Button
              type="link"
              size="small"
              icon={<PlusOutlined />}
              onClick={onAdd}
            >
              {addButtonText}
            </Button>
          </NodeInteractive>
        )}
      </TableHeader>

      <ScrollableList
        size="small"
        bordered
        dataSource={dataSource}
        renderItem={renderItem}
        locale={{ emptyText: "No data" }}
      />
    </div>
  );
};
