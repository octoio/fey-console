import { Form, Select, Tag } from "antd";
import React from "react";
import {
  StyledCard,
  FullWidthInputNumber,
} from "@components/common/styled-components";
import {
  ALL_SKILL_CATEGORIES,
  ALL_SKILL_TARGET_TYPES,
  SkillCategory,
  SkillTargetType,
} from "@models/skill.types";
import { useSkillStore } from "@store/skill.store";

const { Option } = Select;

export const SkillPropertiesSection: React.FC = () => {
  const { skillData, updateBasicInfo, updateCost } = useSkillStore();

  if (!skillData) return null;
  const { entity } = skillData;

  const handleCategoriesChange = (value: SkillCategory[]) => {
    try {
      updateBasicInfo(
        entity.quality,
        value,
        entity.cooldown,
        entity.target_type,
      );
    } catch (error) {
      console.error("Failed to update categories:", error);
    }
  };

  const handleCooldownChange = (value: number | string | null) => {
    try {
      updateBasicInfo(
        entity.quality,
        entity.categories,
        typeof value === "string" ? parseFloat(value) || 0 : value || 0,
        entity.target_type,
      );
    } catch (error) {
      console.error("Failed to update cooldown:", error);
    }
  };

  const handleTargetTypeChange = (value: SkillTargetType) => {
    try {
      updateBasicInfo(
        entity.quality,
        entity.categories,
        entity.cooldown,
        value,
      );
    } catch (error) {
      console.error("Failed to update target type:", error);
    }
  };

  const handleManaChange = (value: number | string | null) => {
    try {
      updateCost(
        typeof value === "string" ? parseFloat(value) || 0 : value || 0,
      );
    } catch (error) {
      console.error("Failed to update mana cost:", error);
    }
  };

  return (
    <StyledCard title="Skill Properties">
      <Form.Item label="Categories">
        <Select
          id="categories-select"
          mode="multiple"
          value={entity.categories}
          onChange={handleCategoriesChange}
          aria-label="Categories"
          // eslint-disable-next-line react/prop-types
          tagRender={(props) => <Tag color="blue">{props.label}</Tag>}
        >
          {ALL_SKILL_CATEGORIES.map((category) => (
            <Option key={category} value={category}>
              {category}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="Target Type">
        <Select
          id="target-type-select"
          value={entity.target_type}
          onChange={handleTargetTypeChange}
          style={{ width: "100%" }}
          aria-label="Target Type"
        >
          {ALL_SKILL_TARGET_TYPES.map((type) => (
            <Option key={type} value={type}>
              {type}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="Mana Cost">
        <FullWidthInputNumber
          id="mana-cost-input"
          min={0}
          value={entity.cost?.mana || 0}
          onChange={handleManaChange}
          aria-label="Mana Cost"
        />
      </Form.Item>

      <Form.Item label="Cooldown (seconds)">
        <FullWidthInputNumber
          id="cooldown-input"
          min={0}
          step={0.1}
          value={entity.cooldown}
          onChange={handleCooldownChange}
          aria-label="Cooldown"
        />
      </Form.Item>
    </StyledCard>
  );
};
