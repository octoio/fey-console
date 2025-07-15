import { Button } from "antd";
import React from "react";
import { DeleteOutlined } from "@ant-design/icons";
import { EntityReferenceSelect } from "@components/common/entity-reference-select";
import { EntityReference, EntityType } from "@models/common.types";
import { NodeInteractive } from "./node-interactive";
import { NodeTable } from "./node-table";

interface TableColumn {
  title: string;
  dataIndex: string;
  key: string;
  render?: (
    text: string,
    record: EntityReference,
    index: number,
  ) => React.ReactNode;
}

interface NodeEntityReferencesProps {
  entityType: EntityType;
  title: string;
  values: EntityReference[];
  onChange: (entities: EntityReference[]) => void;
  extraColumns?: TableColumn[];
  keyField?: string;
}

export const NodeEntityReferences: React.FC<NodeEntityReferencesProps> = ({
  entityType,
  title,
  values = [],
  onChange,
  extraColumns = [],
  keyField = "key",
}) => {
  const handleAdd = () => {
    const newEntity = {
      id: "",
      key: "",
      owner: "Octoio",
      type: entityType,
      version: 1,
    };

    onChange([...values, newEntity]);
  };

  const handleRemove = (index: number) => {
    const updatedEntities = [...values];
    updatedEntities.splice(index, 1);
    onChange(updatedEntities);
  };

  // Create columns with entity key selection as the first column
  const columns = [
    {
      title: "Key",
      dataIndex: keyField,
      key: keyField,
      render: (text: string, _record: EntityReference, index: number) => (
        <NodeInteractive>
          <EntityReferenceSelect
            size="small"
            entityType={entityType}
            value={text}
            onChange={(entity) => {
              const updatedEntities = [...values];
              updatedEntities[index] = entity;
              onChange(updatedEntities);
            }}
          />
        </NodeInteractive>
      ),
    },
    ...extraColumns,
    {
      title: "",
      key: "action",
      width: 30,
      render: (_text: string, _record: EntityReference, index: number) => (
        <NodeInteractive>
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleRemove(index)}
          />
        </NodeInteractive>
      ),
    },
  ];

  return (
    <NodeTable<EntityReference>
      title={title}
      columns={columns}
      dataSource={values}
      onAdd={handleAdd}
    />
  );
};
