import { InputNumber, Space } from "antd";
import { NodeProps } from "reactflow";
import {
  createNodeComponent,
  NODE_COLORS,
  NodeEntityReference,
  NodeField,
  NodeInteractive,
} from "@components/node-common";
import { EntityReference, EntityType } from "@models/common.types";
import { SkillActionNodeType } from "@models/skill.types";
import {
  createNodeDataHandler,
  useNodeOperations,
} from "@utils/node-operations";

export const SummonNode = createNodeComponent({
  nodeType: SkillActionNodeType.Summon,
  backgroundColor: NODE_COLORS.PALE_GREEN_BG,
  borderColor: NODE_COLORS.LIME_BORDER,
  renderContent: ({ id, data }: NodeProps) => {
    const { updateNodeData } = useNodeOperations(id);
    const summonEntityHandler = createNodeDataHandler(
      id,
      data.summon_entity,
      "summon_entity",
    );

    const handleCharacterChange = (entity: EntityReference) => {
      summonEntityHandler.onChange(entity);
    };

    const handlePositionOffsetChange = (
      axis: "x" | "y" | "z",
      value: number | null,
    ) => {
      const position_offset = {
        ...data.position_offset,
        [axis]: value || 0,
      };
      updateNodeData({ position_offset });
    };

    return (
      <>
        <NodeEntityReference
          entityType={EntityType.Character}
          value={data.summon_entity?.key || ""}
          onChange={handleCharacterChange}
          label="Character to Summon"
          placeholder="Select character"
        />

        <NodeField label="Position Offset">
          <Space direction="vertical" style={{ width: "100%" }}>
            <NodeInteractive>
              <InputNumber
                addonBefore="X"
                size="small"
                value={data.position_offset?.x || 0}
                onChange={(value) => handlePositionOffsetChange("x", value)}
                style={{ width: "100%" }}
                step={0.5}
              />
            </NodeInteractive>
            <NodeInteractive>
              <InputNumber
                addonBefore="Y"
                size="small"
                value={data.position_offset?.y || 0}
                onChange={(value) => handlePositionOffsetChange("y", value)}
                style={{ width: "100%" }}
                step={0.5}
              />
            </NodeInteractive>
            <NodeInteractive>
              <InputNumber
                addonBefore="Z"
                size="small"
                value={data.position_offset?.z || 0}
                onChange={(value) => handlePositionOffsetChange("z", value)}
                style={{ width: "100%" }}
                step={0.5}
              />
            </NodeInteractive>
          </Space>
        </NodeField>
      </>
    );
  },
});
