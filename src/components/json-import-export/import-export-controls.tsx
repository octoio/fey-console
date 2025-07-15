import { Button, Space, Typography } from "antd";
import React from "react";
import styled from "@emotion/styled";
import { useSkillStore } from "@store/skill.store";

const { Title } = Typography;

const ControlsContainer = styled(Space)`
  margin-bottom: 16px;
`;

interface ImportExportControlsProps {
  handleExport: () => void;
  handleImport: () => void;
  jsonInput: string;
}

export const ImportExportControls: React.FC<ImportExportControlsProps> = ({
  handleExport,
  handleImport,
  jsonInput,
}) => {
  const { skillData } = useSkillStore();

  return (
    <>
      <Title level={5}>JSON Import/Export</Title>
      <ControlsContainer>
        <Button type="primary" onClick={handleExport} disabled={!skillData}>
          Export Current Skill
        </Button>
        <Button
          type="primary"
          onClick={handleImport}
          disabled={!jsonInput.trim()}
        >
          Import JSON
        </Button>
      </ControlsContainer>
    </>
  );
};
