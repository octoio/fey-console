import {
  Form,
  Card,
  Select,
  Button,
  Space,
  InputNumber,
  Empty,
  Row,
  Col,
} from "antd";
import React, { useState } from "react";
import { EntityReferenceSelect } from "@components/common/entity-reference-select";
import { StyledCard } from "@components/common/styled-components";
import styled from "@emotion/styled";
import { EntityReference, EntityType } from "@models/common.types";
import {
  ALL_SKILL_INDICATOR_POSITIONS,
  SkillIndicator,
  SkillIndicatorPosition,
} from "@models/skill.types";
import { useSkillStore } from "@store/skill.store";

const { Option } = Select;

const IndicatorCard = styled(Card)`
  margin-bottom: 10px;
`;

const ScaleContainer = styled(Space)`
  display: flex;
  justify-content: space-between;
`;

export const IndicatorsSection: React.FC = () => {
  const { skillData, setIndicators } = useSkillStore();
  const [selectedModel, setSelectedModel] = useState<EntityReference | null>(
    null,
  );

  if (!skillData) return null;
  const { entity } = skillData;

  const handleModelSelect = (entityRef: EntityReference) => {
    setSelectedModel(entityRef);
  };

  const handleAddIndicator = () => {
    try {
      if (!selectedModel || !selectedModel.key) return;

      // Check if indicator with this model already exists
      const indicatorExists = entity.indicators.some(
        (indicator: SkillIndicator) =>
          indicator.model_reference.key === selectedModel.key,
      );

      if (!indicatorExists) {
        // Create a new indicator with default values
        const newIndicator = {
          model_reference: selectedModel,
          position: SkillIndicatorPosition.Character,
          scale: { x: 1, y: 1, z: 1 },
        };

        setIndicators([...entity.indicators, newIndicator]);
        setSelectedModel(null); // Clear the selection after adding
      }
    } catch (error) {
      console.error("Failed to add indicator:", error);
    }
  };

  const handleRemoveIndicator = (index: number) => {
    try {
      const updatedIndicators = [...entity.indicators];
      updatedIndicators.splice(index, 1);
      setIndicators(updatedIndicators);
    } catch (error) {
      console.error("Failed to remove indicator:", error);
    }
  };

  const handleUpdateIndicatorPosition = (
    index: number,
    position: SkillIndicatorPosition,
  ) => {
    try {
      const updatedIndicators = [...entity.indicators];
      updatedIndicators[index] = {
        ...updatedIndicators[index],
        position,
      };
      setIndicators(updatedIndicators);
    } catch (error) {
      console.error("Failed to update indicator position:", error);
    }
  };

  const handleUpdateIndicatorScale = (
    index: number,
    axis: "x" | "y" | "z",
    value: number,
  ) => {
    try {
      const updatedIndicators = [...entity.indicators];
      updatedIndicators[index] = {
        ...updatedIndicators[index],
        scale: {
          ...updatedIndicators[index].scale,
          [axis]: value,
        },
      };
      setIndicators(updatedIndicators);
    } catch (error) {
      console.error("Failed to update indicator scale:", error);
    }
  };

  return (
    <StyledCard title="Indicators">
      <Form.Item label="Add Indicator Model">
        <Row gutter={8} align="middle">
          <Col flex="auto">
            <EntityReferenceSelect
              entityType={EntityType.Model}
              placeholder="Select model to add as indicator"
              onChange={handleModelSelect}
              size="middle"
              value={selectedModel?.key || ""}
            />
          </Col>
          <Col>
            <Button
              type="primary"
              onClick={handleAddIndicator}
              disabled={!selectedModel}
              size="middle"
            >
              Add
            </Button>
          </Col>
        </Row>
      </Form.Item>

      {entity.indicators.length > 0 ? (
        entity.indicators.map((indicator: SkillIndicator, index: number) => (
          <IndicatorCard
            key={index}
            size="small"
            title={indicator.model_reference.key}
            extra={
              <Button
                type="text"
                danger
                size="small"
                onClick={() => handleRemoveIndicator(index)}
              >
                Remove
              </Button>
            }
          >
            <Form.Item label="Position">
              <Select
                value={indicator.position}
                onChange={(value) =>
                  handleUpdateIndicatorPosition(
                    index,
                    value as SkillIndicatorPosition,
                  )
                }
                style={{ width: "100%" }}
              >
                {ALL_SKILL_INDICATOR_POSITIONS.map((position) => (
                  <Option key={position} value={position}>
                    {position}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Scale">
              <ScaleContainer>
                <InputNumber
                  min={0.1}
                  step={0.1}
                  value={indicator.scale.x}
                  onChange={(value) =>
                    handleUpdateIndicatorScale(index, "x", Number(value) || 1)
                  }
                  addonBefore="X"
                />
                <InputNumber
                  min={0.1}
                  step={0.1}
                  value={indicator.scale.y}
                  onChange={(value) =>
                    handleUpdateIndicatorScale(index, "y", Number(value) || 1)
                  }
                  addonBefore="Y"
                />
                <InputNumber
                  min={0.1}
                  step={0.1}
                  value={indicator.scale.z}
                  onChange={(value) =>
                    handleUpdateIndicatorScale(index, "z", Number(value) || 1)
                  }
                  addonBefore="Z"
                />
              </ScaleContainer>
            </Form.Item>
          </IndicatorCard>
        ))
      ) : (
        <Empty description="No indicators added" />
      )}
    </StyledCard>
  );
};
