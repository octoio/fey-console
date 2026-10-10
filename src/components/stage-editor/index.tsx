import {
  App as AntApp,
  Button,
  Card,
  Divider,
  Empty,
  Input,
  Select,
  Space,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import { EntityReferenceSelect } from "@components/common/entity-reference-select";
import {
  AnchorEntityDefinition,
  AnchorType,
  createDefaultAnchor,
} from "@models/anchor.types";
import { EntityReferences, EntityType } from "@models/common.types";
import {
  createDefaultObstacle,
  createDefaultStage,
  Obstacle,
  StageEntityDefinition,
} from "@models/stage.types";
import { useSkillStore } from "@store/skill.store";
import { FileInfo } from "@utils/entity-scanner";
import { fileUtils } from "@utils/file-utils";
import { AnchorCard } from "./anchor-card";
import { ColorInput, MetadataInput } from "./field-inputs";
import { ObstacleCard } from "./obstacle-card";
import {
  createAnchorDefinition,
  createStageDefinition,
  entityFilePath,
  referenceOf,
  serializeDefinition,
} from "./stage-file-utils";

const { Text } = Typography;

interface StageEditorProps {
  entityReferences: EntityReferences;
  files: FileInfo[];
  directoryHandle: FileSystemDirectoryHandle | null;
}

export const StageEditor: React.FC<StageEditorProps> = ({
  entityReferences,
  files,
  directoryHandle,
}) => {
  const { notification } = AntApp.useApp();
  const setEntityReferences = useSkillStore(
    (state) => state.setEntityReferences,
  );

  const [stageDefinition, setStageDefinition] =
    useState<StageEntityDefinition | null>(null);
  const [anchorDefinitions, setAnchorDefinitions] = useState<
    AnchorEntityDefinition[]
  >([]);
  const [unsavedKeys, setUnsavedKeys] = useState<Set<string>>(new Set());
  const [newStageKey, setNewStageKey] = useState("");
  const [newAnchorKey, setNewAnchorKey] = useState("");
  const [newAnchorType, setNewAnchorType] = useState<AnchorType>(
    AnchorType.Zone,
  );

  // EntityReferenceSelect reads references from the shared store
  useEffect(() => {
    setEntityReferences(entityReferences);
  }, [entityReferences, setEntityReferences]);

  const stageFiles = files.filter(
    (file) => file.entityType === EntityType.Stage,
  );

  const stage = stageDefinition?.entity;

  const updateStage = (entity: StageEntityDefinition["entity"]) => {
    if (stageDefinition) setStageDefinition({ ...stageDefinition, entity });
  };

  const loadStage = async (filePath: string) => {
    if (!directoryHandle) return;
    try {
      const definition: StageEntityDefinition = JSON.parse(
        await fileUtils.readFile(directoryHandle, filePath),
      );

      const anchors: AnchorEntityDefinition[] = [];
      const missing = new Set<string>();
      for (const reference of definition.entity.anchors) {
        try {
          const anchorPath = entityFilePath(
            files,
            EntityType.Anchor,
            reference.key,
          );
          anchors.push(
            JSON.parse(await fileUtils.readFile(directoryHandle, anchorPath)),
          );
        } catch {
          // Referenced anchor file does not exist yet; start from a default
          missing.add(reference.key);
          anchors.push(
            createAnchorDefinition(
              reference.key,
              createDefaultAnchor(AnchorType.SpawnPoint),
            ),
          );
        }
      }

      setStageDefinition(definition);
      setAnchorDefinitions(anchors);
      setUnsavedKeys(missing);
    } catch (error) {
      notification.error({
        message: "Failed to load stage",
        description: String(error),
      });
    }
  };

  const createStage = () => {
    const key = newStageKey.trim();
    if (!key) return;
    setStageDefinition(createStageDefinition(key, createDefaultStage()));
    setAnchorDefinitions([]);
    setUnsavedKeys(new Set());
    setNewStageKey("");
  };

  const addAnchor = () => {
    const key = newAnchorKey.trim();
    if (!key || !stage || !stageDefinition) return;
    if (anchorDefinitions.some((definition) => definition.key === key)) {
      notification.warning({ message: `Anchor ${key} is already in the stage` });
      return;
    }
    const definition = createAnchorDefinition(
      key,
      createDefaultAnchor(newAnchorType),
    );
    setAnchorDefinitions([...anchorDefinitions, definition]);
    setUnsavedKeys(new Set([...unsavedKeys, key]));
    updateStage({
      ...stage,
      anchors: [
        ...stage.anchors,
        referenceOf(definition, EntityType.Anchor),
      ],
    });
    setNewAnchorKey("");
  };

  const obstacles: Obstacle[] = stage?.obstacles ?? [];

  const setObstacles = (next: Obstacle[]) => {
    if (!stage) return;
    // An empty list is saved as no field at all (the ATD field is optional)
    updateStage({ ...stage, obstacles: next.length > 0 ? next : undefined });
  };

  const updateAnchor = (index: number, definition: AnchorEntityDefinition) => {
    const next = [...anchorDefinitions];
    next[index] = definition;
    setAnchorDefinitions(next);
  };

  const removeAnchor = (index: number) => {
    if (!stage) return;
    const removed = anchorDefinitions[index];
    setAnchorDefinitions(anchorDefinitions.filter((_, i) => i !== index));
    updateStage({
      ...stage,
      anchors: stage.anchors.filter(
        (reference) => reference.key !== removed.key,
      ),
    });
  };

  const saveStage = async () => {
    if (!stageDefinition || !directoryHandle) return;
    try {
      await fileUtils.writeFile(
        directoryHandle,
        entityFilePath(files, EntityType.Stage, stageDefinition.key),
        serializeDefinition(stageDefinition),
      );
      for (const definition of anchorDefinitions) {
        await fileUtils.writeFile(
          directoryHandle,
          entityFilePath(files, EntityType.Anchor, definition.key),
          serializeDefinition(definition),
        );
      }
      setUnsavedKeys(new Set());
      notification.success({
        message: `Saved ${stageDefinition.key}`,
        description: `Wrote the stage and ${anchorDefinitions.length} anchor(s). Run the fey-data pipeline to validate and regenerate indices.`,
      });
    } catch (error) {
      notification.error({
        message: "Failed to save stage",
        description: String(error),
      });
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card size="small" title="Stage selection">
        <Space wrap>
          <Select
            style={{ minWidth: 260 }}
            placeholder="Open stage file"
            aria-label="Stage file"
            value={undefined}
            onChange={(path: string) => loadStage(path)}
            options={stageFiles.map((file) => ({
              value: file.path,
              label: file.name,
            }))}
          />
          <Divider type="vertical" />
          <Input
            style={{ width: 200 }}
            placeholder="New stage key (e.g. TheSwamp)"
            value={newStageKey}
            onChange={(event) => setNewStageKey(event.target.value)}
          />
          <Button onClick={createStage} disabled={!newStageKey.trim()}>
            Create Stage
          </Button>
        </Space>
      </Card>

      {!stageDefinition || !stage ? (
        <Empty description="Open a stage file or create a new stage" />
      ) : (
        <>
          <Card size="small" title={`Stage: ${stageDefinition.key}`}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <MetadataInput
                value={stage.metadata}
                onChange={(metadata) => updateStage({ ...stage, metadata })}
              />
              <Input
                prefix={<Text strong>scene</Text>}
                placeholder="Scenes/TheSwamp/TheSwamp"
                value={stage.scene_name}
                aria-label="Scene name"
                onChange={(event) =>
                  updateStage({ ...stage, scene_name: event.target.value })
                }
              />
              <ColorInput
                label="theme color"
                value={stage.theme_color}
                onChange={(theme_color) =>
                  updateStage({ ...stage, theme_color })
                }
              />

              <Text strong>Thumbnail (optional)</Text>
              <EntityReferenceSelect
                entityType={EntityType.Image}
                value={stage.thumbnail_reference?.key}
                onChange={(reference) =>
                  updateStage({
                    ...stage,
                    thumbnail_reference: reference.key ? reference : undefined,
                  })
                }
              />

              <Text strong>Quest (optional)</Text>
              <EntityReferenceSelect
                entityType={EntityType.Quest}
                value={stage.quest?.key}
                onChange={(reference) =>
                  updateStage({
                    ...stage,
                    quest: reference.key ? reference : undefined,
                  })
                }
              />
            </Space>
          </Card>

          <Card
            size="small"
            title={`Anchors (${anchorDefinitions.length})`}
            extra={
              <Space>
                <Input
                  size="small"
                  style={{ width: 200 }}
                  placeholder="New anchor key"
                  value={newAnchorKey}
                  onChange={(event) => setNewAnchorKey(event.target.value)}
                />
                <Select
                  size="small"
                  style={{ width: 130 }}
                  value={newAnchorType}
                  aria-label="New anchor type"
                  onChange={setNewAnchorType}
                  options={Object.values(AnchorType).map((type) => ({
                    value: type,
                    label: type,
                  }))}
                />
                <Button
                  size="small"
                  onClick={addAnchor}
                  disabled={!newAnchorKey.trim()}
                >
                  Add Anchor
                </Button>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              {anchorDefinitions.length === 0 && (
                <Empty description="No anchors in this stage" />
              )}
              {anchorDefinitions.map((definition, index) => (
                <AnchorCard
                  key={definition.key}
                  definition={definition}
                  isNew={unsavedKeys.has(definition.key)}
                  onChange={(updated) => updateAnchor(index, updated)}
                  onRemove={() => removeAnchor(index)}
                />
              ))}
            </Space>
          </Card>

          <Card
            size="small"
            title={`Obstacles (${obstacles.length})`}
            extra={
              <Button
                size="small"
                onClick={() =>
                  setObstacles([...obstacles, createDefaultObstacle()])
                }
              >
                Add Obstacle
              </Button>
            }
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              {obstacles.length === 0 && (
                <Empty description="No obstacles: the stage is open ground" />
              )}
              {obstacles.map((obstacle, index) => (
                <ObstacleCard
                  key={index}
                  index={index}
                  obstacle={obstacle}
                  onChange={(updated) =>
                    setObstacles(
                      obstacles.map((o, i) => (i === index ? updated : o)),
                    )
                  }
                  onRemove={() =>
                    setObstacles(obstacles.filter((_, i) => i !== index))
                  }
                />
              ))}
            </Space>
          </Card>

          <Button type="primary" onClick={saveStage} disabled={!directoryHandle}>
            Save Stage & Anchors
          </Button>
        </>
      )}
    </Space>
  );
};
