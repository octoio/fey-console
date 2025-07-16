import { Card } from "antd";
import React, { ReactNode } from "react";
import { Handle, Position } from "reactflow";
import styled from "@emotion/styled";

// Regular props without $ prefix since we'll handle filtering differently
interface NodeColorProps {
  backgroundColor: string;
  borderColor: string;
  width?: number;
}

interface NodeCardProps {
  title: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
  backgroundColor: string;
  borderColor: string;
  width?: number;
}

// Use shouldForwardProp to filter out custom props
const StyledCard = styled(Card, {
  shouldForwardProp: (prop) =>
    !["backgroundColor", "borderColor", "width"].includes(prop as string),
})(({ backgroundColor, borderColor, width = 320 }: NodeColorProps) => ({
  width: `${width}px`,
  backgroundColor: backgroundColor,
  borderColor: borderColor,
}));

export const NodeCard: React.FC<NodeCardProps> = ({
  title,
  extra,
  children,
  backgroundColor,
  borderColor,
  width = 320,
}) => {
  return (
    <StyledCard
      title={title}
      variant="outlined"
      size="small"
      extra={extra}
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      width={width}
    >
      <Handle type="target" position={Position.Top} />
      {children}
      <Handle type="source" position={Position.Bottom} />
    </StyledCard>
  );
};
