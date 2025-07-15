import { Select, Input, Form, Space, Typography } from "antd";
import React from "react";
import { EntityReference, EntityType } from "@models/common.types";
import { useSkillStore } from "@store/skill.store";

const { Option } = Select;

const { Text } = Typography;

interface EntityReferenceSelectProps {
  entityType: EntityType;
  value?: string;
  onChange: (entity: EntityReference) => void;
  placeholder?: string;
  size?: "small" | "middle" | "large";
  showSearch?: boolean;
  allowClear?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const EntityReferenceSelect: React.FC<EntityReferenceSelectProps> = ({
  entityType,
  value,
  onChange,
  placeholder = "Select entity",
  size = "small",
  showSearch = true,
  allowClear = true,
  className,
}) => {
  const { getEntityReferencesByType } = useSkillStore();
  const entityReferences = getEntityReferencesByType(entityType);

  // Find the current entity to display owner and version
  const currentEntity = entityReferences.find(
    (entity) => entity.key === value,
  ) || {
    id: "",
    key: value || "",
    owner: "Octoio",
    type: entityType,
    version: 1,
  };

  // Get all available versions for the selected key
  const availableVersions = entityReferences
    .filter((entity) => entity.key === currentEntity.key)
    .map((entity) => entity.version);

  const handleChange = (selectedKey: string) => {
    // Find the matching entity reference
    const selectedEntity = entityReferences.find(
      (entity) => entity.key === selectedKey,
    );

    // Update with selected entity or create a new one with just the key
    const entity = selectedEntity || {
      id: "",
      key: selectedKey,
      owner: "Octoio",
      type: entityType,
      version: 1,
    };

    onChange(entity);
  };

  const handleVersionChange = (version: number | null) => {
    const updatedEntity = {
      ...currentEntity,
      version: version || 1,
    };
    onChange(updatedEntity);
  };

  // Extended view with all fields
  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Form.Item style={{ marginBottom: 8 }}>
        <Input
          prefix={<Text strong>owner</Text>}
          value={currentEntity.owner}
          disabled
          size={size}
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: 8 }}>
        <Input
          prefix={<Text strong>type</Text>}
          value={currentEntity.type}
          disabled
          size={size}
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: 8 }}>
        <Select
          prefix={<Text strong>key</Text>}
          className={className}
          value={currentEntity.key}
          onChange={handleChange}
          placeholder={placeholder}
          size={size}
          showSearch={showSearch}
          allowClear={allowClear}
          optionFilterProp="children"
          style={{ width: "100%" }}
        >
          {entityReferences.map((entity) => (
            <Option key={entity.id} value={entity.key}>
              {entity.key}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {currentEntity.key && (
        <Form.Item>
          <Select
            prefix={<Text strong>version</Text>}
            value={currentEntity.version}
            onChange={(version) => handleVersionChange(version)}
            size={size}
            style={{ width: "100%" }}
          >
            {availableVersions.length > 0 ? (
              availableVersions.map((version) => (
                <Option key={version} value={version}>
                  {version}
                </Option>
              ))
            ) : (
              <Option value={1}>1</Option>
            )}
          </Select>
        </Form.Item>
      )}
    </Space>
  );
};
