import { Typography, Breadcrumb, Space } from "antd";
import React, { useState, useEffect } from "react";
import {
  HomeOutlined,
  DatabaseOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { EntityList } from "@components/entity-selector/entity-list";
import { EntitySelector } from "@components/entity-selector/entity-selector";
import { LoadingSpinner } from "@components/loading-spinner";
import {
  EntityType,
  SimpleEntity,
  ENTITY_TYPE_DISPLAY_NAMES,
} from "@models/entity.types";
import { useEntityActions } from "@store/entity.store";
import { GenericEntityEditor } from "./generic-entity-editor";

const { Title } = Typography;

export interface EntityManagerProps {
  initialEntityType?: EntityType;
  className?: string;
}

type ViewMode = "selector" | "list" | "editor";

export const EntityManager: React.FC<EntityManagerProps> = ({
  initialEntityType,
  className,
}) => {
  const [selectedEntityType, setSelectedEntityType] =
    useState<EntityType | null>(initialEntityType || null);
  const [selectedEntity, setSelectedEntity] = useState<SimpleEntity | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<ViewMode>("selector");

  const actions = useEntityActions();

  useEffect(() => {
    if (initialEntityType) {
      setSelectedEntityType(initialEntityType);
      setViewMode("list");
      // Reset entity selection when switching to a different entity type tab
      setSelectedEntity(null);
    }
  }, [initialEntityType]);

  const handleEntityTypeSelect = (entityType: EntityType) => {
    setSelectedEntityType(entityType);
    setSelectedEntity(null);
    setViewMode("list");
    // Don't update global store - keep selection local to this tab
  };

  const handleEntitySelect = (entity: SimpleEntity) => {
    setSelectedEntity(entity);
    setViewMode("editor");
    // Don't update global store - keep selection local to this tab
  };

  const handleEntityCreate = (entityType: EntityType) => {
    const newEntityId = actions.createEntity(
      entityType,
      "player",
      `new_${entityType.toLowerCase()}`,
    );
    const newEntity = actions.getEntity(newEntityId);
    if (newEntity) handleEntitySelect(newEntity);
  };

  const handleBackToList = () => {
    setSelectedEntity(null);
    setViewMode("list");
    // Don't update global store - keep selection local to this tab
  };

  const handleBackToSelector = () => {
    setSelectedEntityType(null);
    setSelectedEntity(null);
    setViewMode("selector");
    // Don't update global store - keep selection local to this tab
  };

  const renderBreadcrumb = () => {
    const items = [
      {
        title: (
          <Space>
            <HomeOutlined />
            <span onClick={handleBackToSelector} style={{ cursor: "pointer" }}>
              Entity Types
            </span>
          </Space>
        ),
      },
    ];

    if (selectedEntityType) {
      items.push({
        title: (
          <Space>
            <DatabaseOutlined />
            <span onClick={handleBackToList} style={{ cursor: "pointer" }}>
              {ENTITY_TYPE_DISPLAY_NAMES[selectedEntityType]} Entities
            </span>
          </Space>
        ),
      });
    }

    if (selectedEntity) {
      items.push({
        title: (
          <Space>
            <EditOutlined />
            <span>{selectedEntity.key}</span>
          </Space>
        ),
      });
    }

    return <Breadcrumb items={items} style={{ marginBottom: 16 }} />;
  };

  const renderContent = () => {
    switch (viewMode) {
      case "selector":
        return (
          <EntitySelector
            selectedEntityType={selectedEntityType}
            onEntityTypeSelect={handleEntityTypeSelect}
            layout="detailed"
          />
        );

      case "list":
        if (!selectedEntityType) return null;
        return (
          <EntityList
            entityType={selectedEntityType}
            onEntitySelect={handleEntitySelect}
            onEntityCreate={handleEntityCreate}
            selectedEntityId={selectedEntity?.id || null}
          />
        );

      case "editor":
        if (!selectedEntity) return null;

        // Check if this is a Skill - Skills use the specialized editor
        if (selectedEntity.type === EntityType.Skill) {
          const SkillEntityEditor = React.lazy(() =>
            import("../skill-editor/skill-entity-editor").then((module) => ({
              default: module.SkillEntityEditor,
            })),
          );

          return (
            <React.Suspense
              fallback={<LoadingSpinner tip="Loading Skill Editor..." />}
            >
              <SkillEntityEditor
                entity={selectedEntity}
                onSave={(updatedEntity) => {
                  setSelectedEntity(updatedEntity);
                }}
                onCancel={handleBackToList}
                onDelete={() => {
                  // Navigate back to list after deletion
                  handleBackToList();
                }}
              />
            </React.Suspense>
          );
        }

        return (
          <GenericEntityEditor
            entity={selectedEntity}
            onSave={(updatedEntity) => {
              setSelectedEntity(updatedEntity);
            }}
            onCancel={handleBackToList}
            onDelete={() => {
              // Navigate back to list after deletion
              handleBackToList();
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={className}>
      {renderBreadcrumb()}

      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>
          {viewMode === "selector" && "Entity Management"}
          {viewMode === "list" &&
            selectedEntityType &&
            `${ENTITY_TYPE_DISPLAY_NAMES[selectedEntityType]} Entities`}
          {viewMode === "editor" &&
            selectedEntity &&
            `Edit ${selectedEntity.key}`}
        </Title>
      </div>

      {renderContent()}
    </div>
  );
};

export default EntityManager;
