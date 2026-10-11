import {
  App as AntApp,
  Alert,
  Button,
  Card,
  Divider,
  Empty,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import React, { useMemo, useState } from "react";
import { MetadataInput } from "@components/stage-editor/field-inputs";
import { ObstacleCard } from "@components/stage-editor/obstacle-card";
import {
  entityFilePath,
  serializeDefinition,
} from "@components/stage-editor/stage-file-utils";
import { EntityType } from "@models/common.types";
import {
  ALL_ANCHOR_SLOTS,
  ALL_GENERATOR_KINDS,
  AnchorSlot,
  GeneratorKind,
} from "@models/generator.types";
import { RoomPrefabEntityDefinition } from "@models/roomprefab.types";
import { ObstacleShape } from "@models/stage.types";
import { usePrefabStore } from "@store/prefab.store";
import { FileInfo } from "@utils/entity-scanner";
import { fileUtils } from "@utils/file-utils";
import { prefabProblems, prefabWarnings } from "@utils/mapgen-check";
import { PrefabCanvas } from "./prefab-canvas";

const { Text } = Typography;

interface PrefabEditorProps {
  files: FileInfo[];
  directoryHandle: FileSystemDirectoryHandle | null;
}

export const PrefabEditor: React.FC<PrefabEditorProps> = ({
  files,
  directoryHandle,
}) => {
  const { notification } = AntApp.useApp();
  const store = usePrefabStore();
  const { definition, selection, dirty } = store;
  const [newKey, setNewKey] = useState("");
  const [newKind, setNewKind] = useState<GeneratorKind>(GeneratorKind.Crypt);

  const prefabFiles = files.filter(
    (file) => file.entityType === EntityType.RoomPrefab,
  );
  const prefab = definition?.entity;
  const problems = useMemo(() => (prefab ? prefabProblems(prefab) : []), [prefab]);

  const warnings = useMemo(() => (prefab ? prefabWarnings(prefab) : []), [prefab]);

  const load = async (path: string) => {
    if (!directoryHandle) return;
    try {
      store.open(
        JSON.parse(
          await fileUtils.readFile(directoryHandle, path),
        ) as RoomPrefabEntityDefinition,
      );
    } catch (error) {
      notification.error({
        message: "Failed to load room prefab",
        description: String(error),
      });
    }
  };

  const save = async () => {
    if (!definition || !directoryHandle) return;
    try {
      await fileUtils.writeFile(
        directoryHandle,
        entityFilePath(files, EntityType.RoomPrefab, definition.key),
        serializeDefinition(definition),
      );
      store.markSaved();
      notification.success({
        message: `Saved ${definition.key}`,
        description: "Run the fey-data pipeline to validate and regenerate indices.",
      });
    } catch (error) {
      notification.error({
        message: "Failed to save room prefab",
        description: String(error),
      });
    }
  };

  const remove = async () => {
    if (!definition || !directoryHandle) return;
    const path = prefabFiles.find(
      (f) => f.name === `${definition.key.toLowerCase()}.roomprefab.json`,
    )?.path;
    try {
      if (path) await fileUtils.deleteFile(directoryHandle, path);
      notification.success({ message: `Deleted ${definition.key}` });
      store.close();
    } catch (error) {
      notification.error({
        message: "Failed to delete room prefab",
        description: String(error),
      });
    }
  };

  const selectedObstacle =
    selection?.kind === "obstacle" ? prefab?.obstacles?.[selection.index] : undefined;
  const selectedSlot =
    selection?.kind === "slot" ? prefab?.slots[selection.index] : undefined;

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card size="small" title="Room prefab selection">
        <Space wrap>
          <Select
            style={{ minWidth: 260 }}
            placeholder="Open room prefab file"
            aria-label="Room prefab file"
            value={undefined}
            onChange={(path: string) => load(path)}
            options={prefabFiles.map((file) => ({
              value: file.path,
              label: file.name,
            }))}
          />
          <Divider type="vertical" />
          <Input
            style={{ width: 200 }}
            placeholder="New prefab key (e.g. CryptHollowNest)"
            value={newKey}
            onChange={(event) => setNewKey(event.target.value)}
          />
          <Select
            style={{ width: 100 }}
            aria-label="New prefab generator"
            value={newKind}
            onChange={setNewKind}
            options={ALL_GENERATOR_KINDS.map((k) => ({ value: k, label: k }))}
          />
          <Button
            disabled={!newKey.trim()}
            onClick={() => {
              store.create(newKey.trim(), newKind);
              setNewKey("");
            }}
          >
            Create Prefab
          </Button>
        </Space>
      </Card>

      {!definition || !prefab ? (
        <Empty description="Open a room prefab file or create a new prefab" />
      ) : (
        <>
          <Card
            size="small"
            title={
              <Space>
                <Text strong>{`Room prefab: ${definition.key}`}</Text>
                {dirty && <Tag color="orange">unsaved</Tag>}
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <MetadataInput
                value={prefab.metadata}
                onChange={(metadata) => store.updatePrefab({ metadata })}
              />
              <Space wrap>
                <Text strong>generator</Text>
                <Select
                  size="small"
                  style={{ width: 100 }}
                  aria-label="Prefab generator"
                  value={prefab.generator}
                  onChange={(generator) => store.updatePrefab({ generator })}
                  options={ALL_GENERATOR_KINDS.map((k) => ({ value: k, label: k }))}
                />
                <Input
                  size="small"
                  style={{ width: 260 }}
                  prefix={<Text strong>prefab_id</Text>}
                  aria-label="Prefab id"
                  value={prefab.prefab_id}
                  onChange={(event) =>
                    store.updatePrefab({ prefab_id: event.target.value })
                  }
                />
              </Space>
              <Space wrap>
                <Text strong>size</Text>
                {(["x", "z"] as const).map((axis) => (
                  <InputNumber
                    key={axis}
                    size="small"
                    min={1}
                    prefix={<Text type="secondary">{axis}</Text>}
                    aria-label={`Room size ${axis}`}
                    value={prefab.size[axis]}
                    onChange={(v) =>
                      store.updatePrefab({
                        size: { ...prefab.size, [axis]: v ?? 1 },
                      })
                    }
                  />
                ))}
                <Text strong>door_band</Text>
                <InputNumber
                  size="small"
                  min={0}
                  step={0.5}
                  aria-label="Door band"
                  value={prefab.door_band}
                  onChange={(v) => store.updatePrefab({ door_band: v ?? 0 })}
                />
              </Space>
              {problems.map((problem) => (
                <Alert key={problem} type="error" showIcon message={problem} />
              ))}
              {warnings.map((warning) => (
                <Alert key={warning} type="warning" showIcon message={warning} />
              ))}
            </Space>
          </Card>

          <Card
            size="small"
            title="Room canvas"
            extra={
              <Space>
                <Button size="small" onClick={() => store.addObstacle(ObstacleShape.Circle)}>
                  Add Pillar
                </Button>
                <Button size="small" onClick={() => store.addObstacle(ObstacleShape.Box)}>
                  Add Wall
                </Button>
                <Button size="small" onClick={() => store.addSlot()}>
                  Add Slot
                </Button>
              </Space>
            }
          >
            <Space align="start" wrap size="large">
              <PrefabCanvas
                prefab={prefab}
                selection={selection}
                onSelect={store.select}
                onMove={store.moveTo}
              />
              <Space direction="vertical">
                <Text type="secondary">
                  Drag to move. +x right, +z up, centre 0, 0. Blue marks are doors, the pale band
                  is kept free of props.
                </Text>
                {selectedObstacle && selection?.kind === "obstacle" && (
                  <ObstacleCard
                    index={selection.index}
                    obstacle={selectedObstacle}
                    onChange={(o) => store.updateObstacle(selection.index, o)}
                    onRemove={() => store.removeObstacle(selection.index)}
                  />
                )}
                {selectedSlot && selection?.kind === "slot" && (
                  <Card
                    size="small"
                    title={<Text strong>{`slot ${selection.index}`}</Text>}
                    extra={
                      <Button danger size="small" onClick={() => store.removeSlot(selection.index)}>
                        Remove
                      </Button>
                    }
                  >
                    <Space wrap>
                      <Select
                        size="small"
                        style={{ width: 140 }}
                        aria-label="Slot kind"
                        value={selectedSlot.slot}
                        onChange={(slot: AnchorSlot) =>
                          store.updateSlot(selection.index, { ...selectedSlot, slot })
                        }
                        options={ALL_ANCHOR_SLOTS.map((s) => ({ value: s, label: s }))}
                      />
                      {(["x", "z"] as const).map((axis) => (
                        <InputNumber
                          key={axis}
                          size="small"
                          prefix={<Text type="secondary">{axis}</Text>}
                          aria-label={`slot ${axis}`}
                          value={selectedSlot[axis]}
                          onChange={(v) =>
                            store.updateSlot(selection.index, { ...selectedSlot, [axis]: v ?? 0 })
                          }
                        />
                      ))}
                      <InputNumber
                        size="small"
                        min={0}
                        prefix={<Text type="secondary">area</Text>}
                        aria-label="slot area"
                        value={selectedSlot.area}
                        onChange={(v) =>
                          store.updateSlot(selection.index, {
                            ...selectedSlot,
                            area: v === null || v === 0 ? undefined : v,
                          })
                        }
                      />
                    </Space>
                  </Card>
                )}
              </Space>
            </Space>
          </Card>

          <Space>
            <Button type="primary" onClick={save} disabled={!directoryHandle}>
              Save Room Prefab
            </Button>
            <Popconfirm title="Delete this room prefab file?" onConfirm={remove}>
              <Button danger disabled={!directoryHandle}>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        </>
      )}
    </Space>
  );
};
