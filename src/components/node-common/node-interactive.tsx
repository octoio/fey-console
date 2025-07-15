import React, { ReactNode } from "react";

interface NodeInteractiveProps {
  children: ReactNode;
  className?: string;
}

/**
 * A wrapper component that adds the nodrag class to prevent ReactFlow
 * from capturing mouse events on interactive elements
 */
export const NodeInteractive: React.FC<NodeInteractiveProps> = ({
  children,
  className = "",
}) => {
  return <div className={`nodrag ${className}`.trim()}>{children}</div>;
};
