import { InputNumber, Select, Space } from "antd";
import { NodeProps } from "reactflow";
import {
  createNodeComponent,
  NODE_COLORS,
  NodeEntityReference,
  NodeField,
  NodeInteractive,
} from "@components/node-common";
import { EntityReference, EntityType } from "@models/common.types";
import {
  ALL_PROJECTILE_SPAWN_POSITION_TYPES,
  ProjectileSpawnPositionType,
  SkillActionNodeType,
} from "@models/skill.types";
import {
  createNodeDataHandler,
  useNodeOperations,
} from "@utils/node-operations";

export const ProjectileNode = createNodeComponent({
  nodeType: SkillActionNodeType.Projectile,
  backgroundColor: NODE_COLORS.PALE_ORANGE_BG,
  borderColor: NODE_COLORS.ORANGE_BORDER,
  renderContent: ({ id, data }: NodeProps) => {
    const { updateNodeData } = useNodeOperations(id);
    const projectileHandler = createNodeDataHandler(
      id,
      data.projectile,
      "projectile",
    );

    const handleProjectileChange = (entity: EntityReference) => {
      projectileHandler.onChange(entity);
    };

    const handleSpawnPositionTypeChange = (
      value: ProjectileSpawnPositionType,
    ) => {
      const spawn_position = {
        ...data.spawn_position,
        type: value,
      };
      updateNodeData({ spawn_position });
    };

    const handleSpawnPositionChange = (
      axis: "x" | "y" | "z",
      value: number | null,
    ) => {
      const spawn_position = {
        ...data.spawn_position,
        position: {
          ...data.spawn_position.position,
          [axis]: value || 0,
        },
      };
      updateNodeData({ spawn_position });
    };

    const handleSpawnOffsetChange = (
      axis: "x" | "y" | "z",
      value: number | null,
    ) => {
      const spawn_position = {
        ...data.spawn_position,
        offset: {
          ...data.spawn_position.offset,
          [axis]: value || 0,
        },
      };
      updateNodeData({ spawn_position });
    };

    const handleDirectionChange = (
      axis: "x" | "y" | "z",
      value: number | null,
    ) => {
      const direction = {
        ...data.direction,
        [axis]: value || 0,
      };
      updateNodeData({ direction });
    };

    return (
      <>
        <NodeEntityReference
          entityType={EntityType.Projectile}
          value={data.projectile?.key || ""}
          onChange={handleProjectileChange}
          label="Projectile"
          placeholder="Select projectile"
        />

        <NodeField label="Spawn Position Type">
          <NodeInteractive>
            <Select
              size="small"
              value={data.spawn_position?.type || ProjectileSpawnPositionType.Character}
              onChange={handleSpawnPositionTypeChange}
              style={{ width: "100%" }}
              options={ALL_PROJECTILE_SPAWN_POSITION_TYPES.map((type) => ({
                label: type,
                value: type,
              }))}
            />
          </NodeInteractive>
        </NodeField>

        <NodeField label="Spawn Position">
          <Space direction="vertical" style={{ width: "100%" }}>
            <NodeInteractive>
              <InputNumber
                addonBefore="X"
                size="small"
                value={data.spawn_position?.position?.x || 0}
                onChange={(value) => handleSpawnPositionChange("x", value)}
                style={{ width: "100%" }}
                step={0.5}
              />
            </NodeInteractive>
            <NodeInteractive>
              <InputNumber
                addonBefore="Y"
                size="small"
                value={data.spawn_position?.position?.y || 0}
                onChange={(value) => handleSpawnPositionChange("y", value)}
                style={{ width: "100%" }}
                step={0.5}
              />
            </NodeInteractive>
            <NodeInteractive>
              <InputNumber
                addonBefore="Z"
                size="small"
                value={data.spawn_position?.position?.z || 0}
                onChange={(value) => handleSpawnPositionChange("z", value)}
                style={{ width: "100%" }}
                step={0.5}
              />
            </NodeInteractive>
          </Space>
        </NodeField>

        <NodeField label="Spawn Offset">
          <Space direction="vertical" style={{ width: "100%" }}>
            <NodeInteractive>
              <InputNumber
                addonBefore="X"
                size="small"
                value={data.spawn_position?.offset?.x || 0}
                onChange={(value) => handleSpawnOffsetChange("x", value)}
                style={{ width: "100%" }}
                step={0.5}
              />
            </NodeInteractive>
            <NodeInteractive>
              <InputNumber
                addonBefore="Y"
                size="small"
                value={data.spawn_position?.offset?.y || 0}
                onChange={(value) => handleSpawnOffsetChange("y", value)}
                style={{ width: "100%" }}
                step={0.5}
              />
            </NodeInteractive>
            <NodeInteractive>
              <InputNumber
                addonBefore="Z"
                size="small"
                value={data.spawn_position?.offset?.z || 0}
                onChange={(value) => handleSpawnOffsetChange("z", value)}
                style={{ width: "100%" }}
                step={0.5}
              />
            </NodeInteractive>
          </Space>
        </NodeField>

        <NodeField label="Direction">
          <Space direction="vertical" style={{ width: "100%" }}>
            <NodeInteractive>
              <InputNumber
                addonBefore="X"
                size="small"
                value={data.direction?.x || 0}
                onChange={(value) => handleDirectionChange("x", value)}
                style={{ width: "100%" }}
                step={0.1}
              />
            </NodeInteractive>
            <NodeInteractive>
              <InputNumber
                addonBefore="Y"
                size="small"
                value={data.direction?.y || 0}
                onChange={(value) => handleDirectionChange("y", value)}
                style={{ width: "100%" }}
                step={0.1}
              />
            </NodeInteractive>
            <NodeInteractive>
              <InputNumber
                addonBefore="Z"
                size="small"
                value={data.direction?.z || 1}
                onChange={(value) => handleDirectionChange("z", value)}
                style={{ width: "100%" }}
                step={0.1}
              />
            </NodeInteractive>
          </Space>
        </NodeField>
      </>
    );
  },
});
