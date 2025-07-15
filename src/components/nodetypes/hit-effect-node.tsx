import { NodeProps } from "reactflow";
import {
  createNodeComponent,
  NODE_COLORS,
  HitEffectEditor,
} from "@components/node-common";
import { SkillActionNodeType } from "@models/skill.types";
import { createNodeDataHandler } from "@utils/node-operations";

export const HitEffectNode = createNodeComponent({
  nodeType: SkillActionNodeType.Hit,
  backgroundColor: NODE_COLORS.LIGHT_RED_BG,
  borderColor: NODE_COLORS.RED_BORDER,
  renderContent: ({ id, data }: NodeProps) => {
    const hitEffectHandler = createNodeDataHandler(
      id,
      data.hit_effect,
      "hit_effect",
    );

    return (
      <HitEffectEditor
        hitEffect={hitEffectHandler.data}
        onChange={hitEffectHandler.onChange}
      />
    );
  },
});
