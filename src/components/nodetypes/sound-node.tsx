import { NodeProps } from "reactflow";
import {
  createNodeComponent,
  NODE_COLORS,
  NodeEntityReference,
} from "@components/node-common";
import { EntityReference, EntityType } from "@models/common.types";
import { SkillActionNodeType } from "@models/skill.types";
import { createNodeDataHandler } from "@utils/node-operations";

export const SoundNode = createNodeComponent({
  nodeType: SkillActionNodeType.Sound,
  backgroundColor: NODE_COLORS.LIGHT_YELLOW_BG,
  borderColor: NODE_COLORS.YELLOW_BORDER,
  renderContent: ({ id, data }: NodeProps) => {
    const soundHandler = createNodeDataHandler(id, data.sound, "sound");

    const handleSoundKeyChange = (entity: EntityReference) => {
      soundHandler.onChange(entity);
    };

    return (
      <NodeEntityReference
        entityType={EntityType.Sound}
        value={data.sound?.key || ""}
        onChange={handleSoundKeyChange}
        label="Sound"
        placeholder="Select sound"
        size="small"
      />
    );
  },
});
