import {
  Card,
  Button,
  Space,
  Divider,
  Typography,
  Tag,
  Alert,
  Row,
  Col,
  Collapse,
  Modal,
} from "antd";
import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
import {
  SaveOutlined,
  UndoOutlined,
  CopyOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  SimpleEntity,
  ENTITY_TYPE_DISPLAY_NAMES,
  getEntityDisplayTitle,
} from "@models/entity.types";
import { SkillEntityDefinition } from "@models/skill.types";
import { useEntityActions } from "@store/entity.store";
import { useSkillStore } from "@store/skill.store";
import { LoadingSpinner } from "../../loading-spinner";
import { SkillPropertiesForm } from "./skill-properties-form";

// Lazy load the execution tree editor
const ExecutionTreeEditor = lazy(() =>
  import("./execution-tree-editor").then((module) => ({
    default: module.ExecutionTreeEditor,
  })),
);

const { Title, Text } = Typography;

export interface SkillEntityEditorProps {
  entity: SimpleEntity;
  onSave?: (entity: SimpleEntity) => void;
  onCancel?: () => void;
  onDelete?: (entityId: string) => void;
  readonly?: boolean;
  className?: string;
}

export const SkillEntityEditor: React.FC<SkillEntityEditorProps> = ({
  entity,
  onSave,
  onCancel,
  onDelete,
  readonly = false,
  className,
}) => {
  const [isDirty, setIsDirty] = useState(false);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const actions = useEntityActions();
  const skillStore = useSkillStore();

  // Convert SimpleEntity to SkillEntityDefinition for the skill store
  const convertToSkillEntityDefinition = (
    entityData: SimpleEntity,
  ): SkillEntityDefinition => {
    const skillEntityData = entityData.data || {};
    
    // Check if there's a nested entity structure (common in saved skill files)
    const nestedEntity = skillEntityData.entity;
    const actualSkillData = nestedEntity || skillEntityData;
    
    // Ensure all required skill properties exist with defaults
    const completeSkillData = {
      metadata: {
        title: entityData.metadata?.title || actualSkillData.metadata?.title || "",
        description: entityData.metadata?.description || actualSkillData.metadata?.description || "",
      },
      quality: actualSkillData.quality || "Common",
      categories: actualSkillData.categories || [],
      cost: {
        mana: 0,
        ...actualSkillData.cost,
      },
      cooldown: actualSkillData.cooldown || 0,
      target_type: actualSkillData.target_type || "Enemy",
      execution_root: actualSkillData.execution_root || {
        type: "Parallel",
        name: "Root",
        children: [],
        loop: 1,
      },
      icon_reference: actualSkillData.icon_reference || {
        id: "Octoio:Image:DefaultIcon:1",
        type: "Image",
        owner: "Octoio",
        key: "DefaultIcon",
        version: 1,
      },
      indicators: actualSkillData.indicators || [],
      cast_distance: {
        min: 1,
        max: 1,
        ...actualSkillData.cast_distance,
      },
    };

    return {
      id: entityData.id || "",
      owner: entityData.owner,
      type: entityData.type,
      key: entityData.key,
      version: 1,
      entity: completeSkillData,
    };
  };

  useEffect(() => {
    // Convert entity to skill store format and populate skill store
    const skillEntityDefinition = convertToSkillEntityDefinition(entity);
    skillStore.setSkillData(skillEntityDefinition);
    setIsDirty(false);
  }, [entity]); // Remove skillStore from dependencies to prevent infinite loop

  // Track changes in skill store to update dirty state
  const originalEntityRef = useRef<SimpleEntity | null>(null);
  
  useEffect(() => {
    // Store the original entity data on first load
    if (!originalEntityRef.current || originalEntityRef.current.id !== entity.id) {
      originalEntityRef.current = entity;
      return;
    }

    const currentData = skillStore.skillData;
    if (currentData) {
      const originalData = convertToSkillEntityDefinition(originalEntityRef.current);
      const isChanged = JSON.stringify(originalData.entity) !== JSON.stringify(currentData.entity);
      setIsDirty(isChanged);
    }
  }, [skillStore.skillData]);

  const handleSave = async () => {
    try {
      // Get the updated skill data from the skill store
      const currentSkillData = skillStore.skillData;
      if (!currentSkillData) return;

      const updatedEntity: SimpleEntity = {
        ...entity,
        key: currentSkillData.key,
        owner: currentSkillData.owner,
        data: currentSkillData.entity,
        modifiedAt: new Date(),
        metadata: {
          title: currentSkillData.entity.metadata?.title || "",
          description: currentSkillData.entity.metadata?.description || "",
        },
      };

      if (entity.id) actions.updateEntity(entity.id, updatedEntity);

      onSave?.(updatedEntity);
      setIsDirty(false);
    } catch (error) {
      console.error("Failed to save skill:", error);
    }
  };

  const handleReset = () => {
    // Reset the skill store to original entity data
    const originalEntity = originalEntityRef.current || entity;
    const skillEntityDefinition = convertToSkillEntityDefinition(originalEntity);
    skillStore.setSkillData(skillEntityDefinition);
    setIsDirty(false);
  };

  const handleClone = () => {
    if (entity.id) {
      const clonedId = actions.cloneEntity(entity.id, `${entity.key}_copy`);
      const clonedEntity = actions.getEntity(clonedId);
      if (clonedEntity) onSave?.(clonedEntity);
    }
  };

  const handleDelete = () => {
    if (!entity.id) return;

    Modal.confirm({
      title: "Delete Skill",
      content: (
        <div>
          <p>Are you sure you want to delete this skill entity?</p>
          <p>
            <strong>Skill:</strong> {getEntityDisplayTitle(entity)}
          </p>
          <p>
            <strong>Key:</strong> {entity.key}
          </p>
          <p style={{ color: "#ff4d4f", fontWeight: "bold" }}>
            This action cannot be undone.
          </p>
        </div>
      ),
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        if (entity.id) {
          actions.deleteEntity(entity.id);
          onDelete?.(entity.id);
        }
      },
    });
  };

  const formatDataForPreview = () => {
    try {
      const currentSkillData = skillStore.skillData;
      if (!currentSkillData) return entity;

      return {
        id: entity.id,
        type: entity.type,
        key: currentSkillData.key,
        owner: currentSkillData.owner,
        data: currentSkillData.entity,
        createdAt: entity.createdAt,
        modifiedAt: new Date(),
        metadata: {
          title: currentSkillData.entity.metadata?.title || "",
          description: currentSkillData.entity.metadata?.description || "",
        },
      };
    } catch (error) {
      return entity;
    }
  };

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
            <Space>
              <Title level={4} style={{ margin: 0 }}>
                {getEntityDisplayTitle(entity)}
              </Title>
              <Tag color="blue">{ENTITY_TYPE_DISPLAY_NAMES[entity.type]}</Tag>
              {readonly && <Tag color="orange">Read Only</Tag>}
              {isDirty && <Tag color="red">Unsaved Changes</Tag>}
            </Space>
            <Space>
              <Button
                icon={<CopyOutlined />}
                onClick={() => setShowJsonPreview(!showJsonPreview)}
                type={showJsonPreview ? "primary" : "default"}
              >
                {showJsonPreview ? "Hide JSON" : "Show JSON"}
              </Button>
              {!readonly && (
                <>
                  <Button icon={<CopyOutlined />} onClick={handleClone}>
                    Clone
                  </Button>
                  <Button
                    icon={<DeleteOutlined />}
                    onClick={handleDelete}
                    danger
                  >
                    Delete
                  </Button>
                  <Button
                    icon={<UndoOutlined />}
                    onClick={handleReset}
                    disabled={!isDirty}
                  >
                    Reset
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    disabled={!isDirty}
                  >
                    Save
                  </Button>
                </>
              )}
              {onCancel && <Button onClick={onCancel}>Cancel</Button>}
            </Space>
          </div>
        }
      >
        <Row gutter={24}>
          <Col span={showJsonPreview ? 12 : 24}>
            <div>
              <Alert
                message="Editing Skill Entity"
                description="Use the comprehensive form below to edit all properties of this skill entity. Use the Execution Tree editor below for complex skill logic."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <SkillPropertiesForm />

              <Divider>Advanced Skill Configuration</Divider>

              <Collapse
                items={[
                  {
                    key: "execution-tree",
                    label: "Execution Tree Editor",
                    extra: <Tag color="purple">Advanced Tool</Tag>,
                    children: (
                      <>
                        <Alert
                          message="Execution Tree Editor"
                          description="Use the visual node editor below to design complex skill execution logic, combos, and effects."
                          type="info"
                          style={{ marginBottom: 16 }}
                        />
                        <Suspense
                          fallback={
                            <LoadingSpinner tip="Loading Execution Tree Editor..." />
                          }
                        >
                          <ExecutionTreeEditor />
                        </Suspense>
                      </>
                    ),
                  },
                ]}
              />

              <div style={{ fontSize: "12px", color: "#666", marginTop: 16 }}>
                <Text type="secondary">
                  <strong>Entity Info:</strong> Created{" "}
                  {entity.createdAt?.toLocaleDateString()}, Last Modified{" "}
                  {entity.modifiedAt?.toLocaleDateString()}
                  {entity.id && <span> • ID: {entity.id}</span>}
                </Text>
              </div>
            </div>
          </Col>

          {showJsonPreview && (
            <Col span={12}>
              <Card
                size="small"
                title="JSON Preview"
                style={{ height: "fit-content" }}
              >
                <pre
                  style={{
                    background: "#f5f5f5",
                    padding: "12px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    maxHeight: "400px",
                    overflow: "auto",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {JSON.stringify(formatDataForPreview(), null, 2)}
                </pre>
              </Card>
            </Col>
          )}
        </Row>
      </Card>
    </div>
  );
};

