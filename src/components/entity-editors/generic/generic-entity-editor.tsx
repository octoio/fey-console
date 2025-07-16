import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Divider,
  Typography,
  Tag,
  Alert,
  Row,
  Col,
  Modal,
} from "antd";
import React, { useState, useEffect } from "react";
import {
  SaveOutlined,
  UndoOutlined,
  CopyOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { JsonEditor } from "@components/json-import-export/json-editor";
import {
  SimpleEntity,
  ENTITY_TYPE_DISPLAY_NAMES,
  getEntityDisplayTitle,
} from "@models/entity.types";
import { useEntityActions } from "@store/entity.store";

const { Title, Text } = Typography;
const { TextArea } = Input;

export interface GenericEntityEditorProps {
  entity: SimpleEntity;
  onSave?: (entity: SimpleEntity) => void;
  onCancel?: () => void;
  onDelete?: (entityId: string) => void;
  readonly?: boolean;
  className?: string;
}

export const GenericEntityEditor: React.FC<GenericEntityEditorProps> = ({
  entity,
  onSave,
  onCancel,
  onDelete,
  readonly = false,
  className,
}) => {
  const [form] = Form.useForm();
  const [isDirty, setIsDirty] = useState(false);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [jsonEditorKey, setJsonEditorKey] = useState(0); // Force JsonEditor re-render
  const actions = useEntityActions();

  useEffect(() => {
    // Reset form and force JsonEditor to re-render with new entity data
    form.resetFields();
    form.setFieldsValue({
      key: entity.key,
      owner: entity.owner,
      title: entity.metadata?.title || "",
      description: entity.metadata?.description || "",
      data: JSON.stringify(entity.data, null, 2),
    });
    setIsDirty(false);
    setJsonEditorKey((prev) => prev + 1); // Force JsonEditor to re-render
  }, [entity, form]);

  const handleValuesChange = () => {
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // Parse the JSON data
      let parsedData;
      try {
        parsedData = JSON.parse(values.data || "{}");
      } catch (error) {
        form.setFields([
          {
            name: "data",
            errors: ["Invalid JSON format"],
          },
        ]);
        return;
      }

      const updatedEntity: SimpleEntity = {
        ...entity,
        key: values.key,
        owner: values.owner,
        data: parsedData,
        modifiedAt: new Date(),
        metadata: {
          title: values.title,
          description: values.description,
        },
      };

      if (entity.id) actions.updateEntity(entity.id, updatedEntity);

      onSave?.(updatedEntity);
      setIsDirty(false);
    } catch (error) {
      console.error("Failed to save entity:", error);
    }
  };

  const handleReset = () => {
    form.resetFields();
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
      title: "Delete Entity",
      content: (
        <div>
          <p>
            Are you sure you want to delete this{" "}
            {ENTITY_TYPE_DISPLAY_NAMES[entity.type].toLowerCase()} entity?
          </p>
          <p>
            <strong>Entity:</strong> {getEntityDisplayTitle(entity)}
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
      const values = form.getFieldsValue();
      return {
        id: entity.id,
        type: entity.type,
        key: values.key,
        owner: values.owner,
        data: JSON.parse(values.data || "{}"),
        createdAt: entity.createdAt,
        modifiedAt: new Date(),
        metadata: {
          title: values.title,
          description: values.description,
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
            <Form
              form={form}
              layout="vertical"
              onValuesChange={handleValuesChange}
              disabled={readonly}
            >
              <Alert
                message={`Editing ${ENTITY_TYPE_DISPLAY_NAMES[entity.type]} Entity`}
                description={`Use the form below to edit the properties of this ${entity.type} entity. Changes will be reflected in the JSON preview.`}
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Entity Key"
                    name="key"
                    rules={[
                      { required: true, message: "Entity key is required" },
                      {
                        pattern: /^[a-zA-Z0-9_-]+$/,
                        message:
                          "Key must contain only letters, numbers, underscores, and dashes",
                      },
                    ]}
                  >
                    <Input placeholder="unique_entity_key" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Owner"
                    name="owner"
                    rules={[{ required: true, message: "Owner is required" }]}
                  >
                    <Input placeholder="player, npc, admin, etc." />
                  </Form.Item>
                </Col>
              </Row>

              <Divider>Metadata</Divider>

              <Form.Item
                label="Title"
                name="title"
                rules={[{ required: true, message: "Title is required" }]}
              >
                <Input placeholder="Display title for this entity" />
              </Form.Item>

              <Form.Item label="Description" name="description">
                <TextArea
                  rows={3}
                  placeholder="Detailed description of this entity"
                />
              </Form.Item>

              <Divider>Entity Data</Divider>

              <Form.Item
                label="JSON Data"
                name="data"
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      try {
                        JSON.parse(value);
                        return Promise.resolve();
                      } catch (error) {
                        return Promise.reject(new Error("Invalid JSON format"));
                      }
                    },
                  },
                ]}
              >
                <JsonEditor
                  key={jsonEditorKey} // Force re-render when entity changes
                  value={JSON.stringify(entity.data, null, 2)}
                  onChange={(newValue) => {
                    form.setFieldValue("data", newValue);
                    setIsDirty(true);
                  }}
                />
              </Form.Item>

              <div style={{ fontSize: "12px", color: "#666", marginTop: 8 }}>
                <Text type="secondary">
                  <strong>Entity Info:</strong> Created{" "}
                  {entity.createdAt?.toLocaleDateString()}, Last Modified{" "}
                  {entity.modifiedAt?.toLocaleDateString()}
                  {entity.id && <span> • ID: {entity.id}</span>}
                </Text>
              </div>
            </Form>
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

export default GenericEntityEditor;
