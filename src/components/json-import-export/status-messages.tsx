import { Alert } from "antd";
import React from "react";
import styled from "@emotion/styled";

const StyledAlert = styled(Alert)`
  margin-bottom: 16px;
`;

interface StatusMessagesProps {
  error: string | null;
  success: string | null;
}

export const StatusMessages: React.FC<StatusMessagesProps> = ({
  error,
  success,
}) => {
  return (
    <>
      {error && <StyledAlert message={error} type="error" showIcon />}
      {success && <StyledAlert message={success} type="success" showIcon />}
    </>
  );
};
