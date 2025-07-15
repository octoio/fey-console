import { Select } from "antd";
import React from "react";
import styled from "@emotion/styled";
import { FileInfo } from "@utils/entity-scanner";

const StyledSelect = styled(Select)`
  width: 220px;
  margin-bottom: 8px;
`;

interface FileSelectorProps {
  files: FileInfo[];
  onFileSelect: (value: string) => void;
}

export const FileSelector: React.FC<FileSelectorProps> = ({
  files,
  onFileSelect,
}) => {
  return (
    <StyledSelect
      showSearch
      placeholder="Load from scanned file"
      onChange={(value) => onFileSelect(value as string)}
      filterOption={(input, option) =>
        (option?.children as string).toLowerCase().includes(input.toLowerCase())
      }
      disabled={!files.length}
    >
      {files
        .filter((f) => f.isEntity && f.path.endsWith(".skill.json"))
        .map((f) => (
          <Select.Option key={f.path} value={f.path}>
            {f.name}
          </Select.Option>
        ))}
    </StyledSelect>
  );
};
