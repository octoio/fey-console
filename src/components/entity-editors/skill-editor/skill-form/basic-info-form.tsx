import { Form, Input, Select } from "antd";
import React from "react";
import {
  StyledCard,
  FullWidthSelect,
} from "@components/common/styled-components";
import { ALL_QUALITIES, QualityType } from "@models/quality.types";
import { useSkillStore } from "@store/skill.store";

const { TextArea } = Input;
const { Option } = Select;

export const BasicInfoForm: React.FC = () => {
  const { skillData, updateMetadata, updateBasicInfo } = useSkillStore();

  if (!skillData) return null;
  const { entity } = skillData;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      updateMetadata(e.target.value, entity.metadata.description);
    } catch (error) {
      console.error("Failed to update title:", error);
    }
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    try {
      updateMetadata(entity.metadata.title, e.target.value);
    } catch (error) {
      console.error("Failed to update description:", error);
    }
  };

  const handleQualityChange = (value: QualityType) => {
    try {
      updateBasicInfo(
        value,
        entity.categories,
        entity.cooldown,
        entity.target_type,
      );
    } catch (error) {
      console.error("Failed to update quality:", error);
    }
  };

  return (
    <StyledCard title="Basic Information">
      <Form.Item label="Title">
        <Input value={entity.metadata.title} onChange={handleTitleChange} />
      </Form.Item>

      <Form.Item label="Description">
        <TextArea
          rows={3}
          value={entity.metadata.description}
          onChange={handleDescriptionChange}
        />
      </Form.Item>

      <Form.Item label="Quality">
        <FullWidthSelect
          value={entity.quality}
          onChange={(value: unknown) =>
            handleQualityChange(value as QualityType)
          }
        >
          {ALL_QUALITIES.map((quality) => (
            <Option key={quality} value={quality}>
              {quality}
            </Option>
          ))}
        </FullWidthSelect>
      </Form.Item>
    </StyledCard>
  );
};
