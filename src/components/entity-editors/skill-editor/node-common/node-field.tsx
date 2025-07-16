import { Typography } from "antd";
import React, { ReactNode } from "react";
import styled from "@emotion/styled";

const { Text } = Typography;

interface NodeFieldProps {
  label: string;
  children: ReactNode;
  marginBottom?: number;
}

const FieldContainer = styled.div<{ marginBottom: number }>`
  margin-bottom: ${(props) => props.marginBottom}px;
`;

export const NodeField: React.FC<NodeFieldProps> = ({
  label,
  children,
  marginBottom = 12,
}) => {
  return (
    <FieldContainer marginBottom={marginBottom}>
      <Text>{label}</Text>
      <div style={{ marginTop: 4 }}>{children}</div>
    </FieldContainer>
  );
};
