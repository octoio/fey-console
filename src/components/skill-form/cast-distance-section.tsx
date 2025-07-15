import { Form } from "antd";
import React from "react";
import {
  StyledCard,
  FullWidthInputNumber,
} from "@components/common/styled-components";
import { useSkillStore } from "@store/skill.store";

export const CastDistanceSection: React.FC = () => {
  const { skillData, updateCastDistance } = useSkillStore();

  if (!skillData) return null;
  const { entity } = skillData;

  const handleCastDistanceChange = (
    field: "min" | "max",
    value: number | string | null,
  ) => {
    try {
      const numValue =
        typeof value === "string" ? parseFloat(value) || 0 : value || 0;
      updateCastDistance(
        field === "min" ? numValue : entity.cast_distance.min,
        field === "max" ? numValue : entity.cast_distance.max,
      );
    } catch (error) {
      console.error("Failed to update cast distance:", error);
    }
  };

  return (
    <StyledCard title="Cast Distance">
      <Form.Item label="Minimum">
        <FullWidthInputNumber
          min={0}
          step={0.1}
          value={entity.cast_distance.min}
          onChange={(value) => handleCastDistanceChange("min", value)}
        />
      </Form.Item>

      <Form.Item label="Maximum">
        <FullWidthInputNumber
          min={0}
          step={0.1}
          value={entity.cast_distance.max}
          onChange={(value) => handleCastDistanceChange("max", value)}
        />
      </Form.Item>
    </StyledCard>
  );
};
