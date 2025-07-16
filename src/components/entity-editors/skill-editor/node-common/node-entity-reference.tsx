import React from "react";
import { EntityReferenceSelect } from "@components/common/entity-reference-select";
import { EntityReference, EntityType } from "@models/common.types";
import { NodeField } from "./node-field";
import { NodeInteractive } from "./node-interactive";

interface NodeEntityReferenceProps {
  entityType: EntityType;
  value?: string;
  onChange: (entity: EntityReference) => void;
  label?: string;
  placeholder?: string;
  size?: "small" | "middle" | "large";
  allowClear?: boolean;
}

export const NodeEntityReference: React.FC<NodeEntityReferenceProps> = ({
  entityType,
  value,
  onChange,
  label,
  placeholder = "Select entity",
  size = "small",
  allowClear = true,
}) => {
  const selectComponent = (
    <NodeInteractive>
      <EntityReferenceSelect
        className="nodrag"
        entityType={entityType}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        size={size}
        allowClear={allowClear}
      />
    </NodeInteractive>
  );

  // If label is provided, wrap in NodeField, otherwise return just the select
  return label ? (
    <NodeField label={label}>{selectComponent}</NodeField>
  ) : (
    selectComponent
  );
};
