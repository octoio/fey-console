import { Input } from "antd";
import React from "react";
import { NodeProps } from "reactflow";
import { SkillActionNodeType } from "@models/skill.types";
import { useNodeOperations } from "@utils/node-operations";
import { NodeCard } from "./node-card";
import { NodeField } from "./node-field";
import { NodeHeader } from "./node-header";
import { NodeInteractive } from "./node-interactive";

// Node styling constants with descriptive color names
export const NODE_COLORS = {
  // Background colors
  PALE_BLUE_BG: "#f5f5ff", // For Sequence nodes
  LIGHT_GREEN_BG: "#f6ffed", // For Parallel nodes
  LIGHT_PINK_BG: "#fff0f6", // For Delay nodes
  LIGHT_PURPLE_BG: "#f9f0ff", // For Animation nodes
  LIGHT_YELLOW_BG: "#fffbe6", // For Sound nodes
  LIGHT_RED_BG: "#fff1f0", // For Hit Effect nodes
  LIGHT_BLUE_BG: "#e6f7ff", // For Status nodes
  PALE_GREEN_BG: "#fafff0", // For Summon nodes
  LIGHT_CYAN_BG: "#e6fffb", // For Requirement nodes

  // Border colors
  GRAY_BLUE_BORDER: "#ccd", // For Sequence nodes
  GREEN_BORDER: "#95de64", // For Parallel nodes
  PINK_BORDER: "#ffadd2", // For Delay nodes
  PURPLE_BORDER: "#d3adf7", // For Animation nodes
  YELLOW_BORDER: "#ffe58f", // For Sound nodes
  RED_BORDER: "#ffa39e", // For Hit Effect nodes
  BLUE_BORDER: "#91d5ff", // For Status nodes
  LIME_BORDER: "#b7eb8f", // For Summon nodes
  CYAN_BORDER: "#87e8de", // For Requirement nodes
};

type BaseNodeProps = {
  id: string;
  data: any;
  title: string;
  backgroundColor: string;
  borderColor: string;
  children?: React.ReactNode;
  menuItems?: { key: string; label: string; onClick: () => void }[];
};

export const BaseNode: React.FC<BaseNodeProps> = ({
  id,
  data,
  title,
  backgroundColor,
  borderColor,
  children,
  menuItems,
}) => {
  const { handleNameChange, handleNodeDelete } = useNodeOperations(id);

  return (
    <NodeCard
      title={
        <NodeHeader
          title={title}
          onDelete={handleNodeDelete}
          addMenuItems={menuItems}
        />
      }
      backgroundColor={backgroundColor}
      borderColor={borderColor}
    >
      <NodeField label="Name">
        <NodeInteractive>
          <Input
            value={data.name}
            onChange={handleNameChange}
            placeholder="Node name"
            size="small"
          />
        </NodeInteractive>
      </NodeField>

      {children}
    </NodeCard>
  );
};

// Add display name to the component
BaseNode.displayName = "BaseNode";

// Updated createNodeComponent with props pattern
export type NodeComponentProps = {
  nodeType: SkillActionNodeType;
  backgroundColor: string;
  borderColor: string;
  renderContent: (props: NodeProps) => React.ReactNode;
  getMenuItems?: (
    props: NodeProps,
  ) => { key: string; label: string; onClick: () => void }[];
};

export const createNodeComponent = ({
  nodeType,
  backgroundColor,
  borderColor,
  renderContent,
  getMenuItems,
}: NodeComponentProps) => {
  const NodeComponent = ({ id, data }: NodeProps) => (
    <BaseNode
      id={id}
      data={data}
      title={nodeType}
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      menuItems={
        getMenuItems ? getMenuItems({ id, data } as NodeProps) : undefined
      }
    >
      {renderContent({ id, data } as NodeProps)}
    </BaseNode>
  );

  // Add display name to the created component
  NodeComponent.displayName = `${nodeType}Node`;

  return NodeComponent;
};
