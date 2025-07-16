import {
  List,
  Card,
  Button,
  Input,
  Space,
  Tag,
  Typography,
  Dropdown,
  Modal,
} from "antd";
import React, { useState } from "react";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  SearchOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import {
  EntityType,
  SimpleEntity,
  getEntityDisplayTitle,
} from "@models/entity.types";
import { useEntityStore, useEntityActions } from "@store/entity.store";

const { Title, Text } = Typography;
const { Search } = Input;

export interface EntityListProps {
  entityType: EntityType;
  onEntitySelect?: (entity: SimpleEntity) => void;
  onEntityCreate?: (entityType: EntityType) => void;
  selectedEntityId?: string | null;
  showActions?: boolean;
  className?: string;
}

export const EntityList: React.FC<EntityListProps> = ({
  entityType,
  onEntitySelect,
  onEntityCreate,
  selectedEntityId,
  showActions = true,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<SimpleEntity | null>(
    null,
  );

  const actions = useEntityActions();
  const entities = useEntityStore((state) =>
    state.actions.getEntitiesByType(entityType),
  );

  const filteredEntities = searchQuery
    ? entities.filter(
        (entity) =>
          entity.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          getEntityDisplayTitle(entity)
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      )
    : entities;

  const handleEntityClick = (entity: SimpleEntity) => {
    onEntitySelect?.(entity);
  };

  const handleCreateEntity = () => {
    onEntityCreate?.(entityType);
  };

  const handleCloneEntity = (entity: SimpleEntity) => {
    if (entity.id) {
      const clonedId = actions.cloneEntity(entity.id, `${entity.key}_copy`);
      const clonedEntity = actions.getEntity(clonedId);
      if (clonedEntity) onEntitySelect?.(clonedEntity);
    }
  };

  const handleDeleteEntity = (entity: SimpleEntity) => {
    setEntityToDelete(entity);
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (entityToDelete?.id) {
      actions.deleteEntity(entityToDelete.id);
      setDeleteModalVisible(false);
      setEntityToDelete(null);
    }
  };

  const getActionMenuItems = (entity: SimpleEntity) => [
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Edit",
      onClick: () => handleEntityClick(entity),
    },
    {
      key: "clone",
      icon: <CopyOutlined />,
      label: "Clone",
      onClick: () => handleCloneEntity(entity),
    },
    {
      type: "divider" as const,
    },
    {
      key: "delete",
      icon: <DeleteOutlined />,
      label: "Delete",
      danger: true,
      onClick: () => handleDeleteEntity(entity),
    },
  ];

  const renderEntityItem = (entity: SimpleEntity) => (
    <List.Item
      key={entity.id}
      className={selectedEntityId === entity.id ? "selected-entity" : ""}
      style={{
        backgroundColor: selectedEntityId === entity.id ? "#e6f7ff" : "white",
        border:
          selectedEntityId === entity.id
            ? "1px solid #1890ff"
            : "1px solid #f0f0f0",
        borderRadius: "6px",
        marginBottom: "8px",
        padding: "12px",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onClick={() => handleEntityClick(entity)}
      actions={
        showActions
          ? [
              <Dropdown
                menu={{ items: getActionMenuItems(entity) }}
                trigger={["click"]}
                key="actions"
              >
                <Button
                  type="text"
                  icon={<MoreOutlined />}
                  onClick={(e) => e.stopPropagation()}
                />
              </Dropdown>,
            ]
          : undefined
      }
    >
      <List.Item.Meta
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>{getEntityDisplayTitle(entity)}</span>
            <Tag color="blue">{entity.key}</Tag>
          </div>
        }
        description={
          <Space direction="vertical" size={4}>
            <Text type="secondary">Owner: {entity.owner}</Text>
            <Text type="secondary">
              Modified: {entity.modifiedAt?.toLocaleDateString() || "Unknown"}
            </Text>
          </Space>
        }
      />
    </List.Item>
  );

  return (
    <div className={className}>
      <Card
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title level={4} style={{ margin: 0 }}>
              {entityType} Entities ({filteredEntities.length})
            </Title>
            {showActions && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateEntity}
                size="small"
              >
                Create New
              </Button>
            )}
          </div>
        }
        extra={
          <Search
            placeholder="Search entities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 250 }}
            prefix={<SearchOutlined />}
          />
        }
      >
        {filteredEntities.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <Text type="secondary">
              {searchQuery
                ? `No entities found matching "${searchQuery}"`
                : `No ${entityType} entities found`}
            </Text>
            {!searchQuery && showActions && (
              <div style={{ marginTop: 16 }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateEntity}
                >
                  Create Your First {entityType}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <List
            dataSource={filteredEntities}
            renderItem={renderEntityItem}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} entities`,
            }}
          />
        )}
      </Card>

      <Modal
        title="Confirm Delete"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete the entity "{entityToDelete?.key}"?
        </p>
        <p>This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default EntityList;
