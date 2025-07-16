import { NodeProps } from "reactflow";
import { SkillActionNodeType } from "@models/skill.types";
import { createNodeDataHandler } from "@utils/node-operations";
import {
  createNodeComponent,
  NODE_COLORS,
  StatusEffectEditor,
} from "../node-common";

export const StatusNode = createNodeComponent({
  nodeType: SkillActionNodeType.Status,
  backgroundColor: NODE_COLORS.LIGHT_BLUE_BG,
  borderColor: NODE_COLORS.BLUE_BORDER,
  renderContent: ({ id, data }: NodeProps) => {
    const statusEffectHandler = createNodeDataHandler(
      id,
      data.status_effect,
      "status_effect",
    );

    return (
      <StatusEffectEditor
        statusEffect={statusEffectHandler.data}
        onChange={statusEffectHandler.onChange}
      />
    );
  },
});
