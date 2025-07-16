import { Select, Card, Typography, Row, Col, Badge } from "antd";
import React from "react";
import {
  EntityType,
  ENTITY_TYPE_DISPLAY_NAMES,
  ENTITY_TYPE_DESCRIPTIONS,
} from "@models/entity.types";
import { useEntityStore } from "@store/entity.store";

const { Option } = Select;
const { Title, Text } = Typography;

export interface EntitySelectorProps {
  onEntityTypeSelect?: (entityType: EntityType) => void;
  selectedEntityType?: EntityType | null;
  showDescription?: boolean;
  layout?: "compact" | "detailed";
  className?: string;
}

export const EntitySelector: React.FC<EntitySelectorProps> = ({
  onEntityTypeSelect,
  selectedEntityType,
  showDescription = true,
  layout = "detailed",
  className,
}) => {
  const entityCount = useEntityStore((state) =>
    selectedEntityType
      ? state.actions.getEntityCount(selectedEntityType)
      : state.entities.size,
  );

  const handleEntityTypeChange = (entityType: EntityType) => {
    onEntityTypeSelect?.(entityType);
  };

  const entityTypes = Object.values(EntityType);

  if (layout === "compact") {
    return (
      <div className={className}>
        <Select
          placeholder="Select entity type"
          value={selectedEntityType}
          onChange={handleEntityTypeChange}
          style={{ width: "100%" }}
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            option?.children
              ?.toString()
              .toLowerCase()
              .includes(input.toLowerCase()) ?? false
          }
        >
          {entityTypes.map((entityType) => (
            <Option key={entityType} value={entityType}>
              {ENTITY_TYPE_DISPLAY_NAMES[entityType]}
            </Option>
          ))}
        </Select>
      </div>
    );
  }

  return (
    <div className={className}>
      <Card title="Entity Types" style={{ width: "100%" }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Select
              placeholder="Select entity type to manage"
              value={selectedEntityType}
              onChange={handleEntityTypeChange}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children
                  ?.toString()
                  .toLowerCase()
                  .includes(input.toLowerCase()) ?? false
              }
              size="large"
            >
              {entityTypes.map((entityType) => (
                <Option key={entityType} value={entityType}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{ENTITY_TYPE_DISPLAY_NAMES[entityType]}</span>
                    <Badge
                      count={useEntityStore
                        .getState()
                        .actions.getEntityCount(entityType)}
                      style={{ backgroundColor: "#52c41a" }}
                    />
                  </div>
                </Option>
              ))}
            </Select>
          </Col>

          {selectedEntityType && showDescription && (
            <Col span={24}>
              <Card size="small" style={{ backgroundColor: "#f6f8fa" }}>
                <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                  {ENTITY_TYPE_DISPLAY_NAMES[selectedEntityType]}
                </Title>
                <Text type="secondary">
                  {ENTITY_TYPE_DESCRIPTIONS[selectedEntityType]}
                </Text>
                <div style={{ marginTop: 8 }}>
                  <Badge
                    count={entityCount}
                    style={{ backgroundColor: "#1890ff" }}
                    text={`${entityCount} entities`}
                  />
                </div>
              </Card>
            </Col>
          )}
        </Row>
      </Card>
    </div>
  );
};

export default EntitySelector;
