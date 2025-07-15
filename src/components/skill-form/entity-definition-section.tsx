import { Form, Input, Select } from "antd";
import React, { useMemo } from "react";
import {
  StyledCard,
  ReadOnlyInput,
} from "@components/common/styled-components";
import { EntityType } from "@models/common.types";
import { useSkillStore } from "@store/skill.store";

const { Option } = Select;

export const EntityDefinitionSection: React.FC = () => {
  const { skillData, updateEntityDefinition } = useSkillStore();

  if (!skillData) return null;

  // Compute the ID based on current values in skillData
  const id = useMemo(() => {
    return `${skillData.owner}:${skillData.type}:${skillData.key}:${skillData.version}`;
  }, [skillData.owner, skillData.type, skillData.key, skillData.version]);

  const handleOwnerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      updateEntityDefinition({
        ...skillData,
        owner: e.target.value,
        id: `${e.target.value}:${skillData.type}:${skillData.key}:${skillData.version}`,
      });
    } catch (error) {
      console.error("Failed to update owner:", error);
    }
  };

  const handleTypeChange = (value: EntityType) => {
    try {
      updateEntityDefinition({
        ...skillData,
        type: value,
        id: `${skillData.owner}:${value}:${skillData.key}:${skillData.version}`,
      });
    } catch (error) {
      console.error("Failed to update type:", error);
    }
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      updateEntityDefinition({
        ...skillData,
        key: e.target.value,
        id: `${skillData.owner}:${skillData.type}:${e.target.value}:${skillData.version}`,
      });
    } catch (error) {
      console.error("Failed to update key:", error);
    }
  };

  const handleVersionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const parsedVersion = parseInt(e.target.value);
      const version = parsedVersion && parsedVersion > 0 ? parsedVersion : 1;
      updateEntityDefinition({
        ...skillData,
        version,
        id: `${skillData.owner}:${skillData.type}:${skillData.key}:${version}`,
      });
    } catch (error) {
      console.error("Failed to update version:", error);
    }
  };

  return (
    <StyledCard title="Entity Definition">
      <Form layout="vertical">
        <Form.Item label="Owner">
          <Input
            value={skillData.owner}
            onChange={handleOwnerChange}
            placeholder="Entity owner (e.g., Octoio)"
          />
        </Form.Item>

        <Form.Item label="Type">
          <Select
            value={skillData.type as EntityType}
            onChange={handleTypeChange}
            disabled // Skill type can't be changed
          >
            <Option value={EntityType.Skill}>Skill</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Key">
          <Input
            value={skillData.key}
            onChange={handleKeyChange}
            placeholder="Unique identifier for this skill"
          />
        </Form.Item>

        <Form.Item label="Version">
          <Input
            type="number"
            min={1}
            value={skillData.version}
            onChange={handleVersionChange}
          />
        </Form.Item>

        <Form.Item label="Generated ID">
          <ReadOnlyInput value={id} readOnly />
        </Form.Item>
      </Form>
    </StyledCard>
  );
};
