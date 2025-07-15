import { Button, Input } from "antd";
import React from "react";
import styled from "@emotion/styled";

const SaveContainer = styled.div`
  margin-top: 8px;
  display: flex;
  gap: 8px;
  align-items: center;
`;

const PathInput = styled(Input)`
  width: 300px;
`;

interface FileSaverProps {
  destinationFile: string;
  selectedFile: string;
  onChange: (value: string) => void;
  onSave: () => Promise<void>;
  disabled: boolean;
}

export const FileSaver: React.FC<FileSaverProps> = ({
  destinationFile,
  selectedFile,
  onChange,
  onSave,
  disabled,
}) => {
  return (
    <SaveContainer>
      <PathInput
        placeholder="Destination file path"
        value={destinationFile || selectedFile}
        onChange={(e) => onChange(e.target.value)}
      />
      <Button type="primary" onClick={onSave} disabled={disabled}>
        Save to File
      </Button>
    </SaveContainer>
  );
};
