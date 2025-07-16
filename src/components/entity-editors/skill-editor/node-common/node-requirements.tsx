import {
  Select,
  Button,
  Collapse,
  Space,
  Typography,
  Divider,
  Card,
} from "antd";
import React, { useState } from "react";

import { PlusOutlined, DeleteOutlined, CloseOutlined } from "@ant-design/icons";
import {
  HeaderContainer,
  EmptyContainer,
  TransparentCollapse,
} from "@components/common/styled-components";
import styled from "@emotion/styled";
import { ALL_CHARACTER_TYPES, CharacterType } from "@models/character.types";
import {
  ALL_REQUIREMENT_OPERATORS,
  ALL_REQUIREMENT_TYPES,
  CharacterRequirement,
  Requirement,
  RequirementEvaluation,
  RequirementOperator,
  RequirementType,
  WeaponCategoryRequirement,
} from "@models/requirement.types";
import { ALL_WEAPON_CATEGORIES, WeaponCategory } from "@models/weapon.types";
import { NodeField } from "./node-field";
import { NodeInteractive } from "./node-interactive";

const { Panel } = Collapse;
const { Text } = Typography;

const RequirementCard = styled(Card)`
  margin-bottom: 8px;
  border: 1px solid #f0f0f0;
`;

const RequirementTypeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

interface NodeRequirementsProps {
  requirements?: RequirementEvaluation;
  onChange: (requirements: RequirementEvaluation | undefined) => void;
}

export const NodeRequirements: React.FC<NodeRequirementsProps> = ({
  requirements,
  onChange,
}) => {
  const [expanded, setExpanded] = useState<boolean>(!!requirements);

  // Function to add requirements section when there are none
  const handleAddRequirementsSection = () => {
    // Create default requirements structure
    const newRequirements: RequirementEvaluation = {
      operator: RequirementOperator.All,
      requirements: [],
    };
    onChange(newRequirements);
    setExpanded(true);
  };

  // Function to remove the entire requirements section
  const handleRemoveRequirementsSection = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent collapse toggle
    onChange(undefined);
    setExpanded(false);
  };

  // If there are no requirements yet, show an option to add them
  if (!requirements) {
    return (
      <EmptyContainer>
        <Space direction="vertical" align="center">
          <Text type="secondary">No requirements specified</Text>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={handleAddRequirementsSection}
          >
            Add Requirements
          </Button>
        </Space>
      </EmptyContainer>
    );
  }

  // Create default requirements if none exist (shouldn't reach this with UI changes)
  const currentRequirements = requirements;

  const handleOperatorChange = (value: RequirementOperator) => {
    onChange({
      ...currentRequirements,
      operator: value,
    });
  };

  const handleAddRequirement = () => {
    // Default to Character requirement type when adding new
    const newRequirement: Requirement = {
      type: RequirementType.Character,
    };

    onChange({
      ...currentRequirements,
      requirements: [...currentRequirements.requirements, newRequirement],
    });
  };

  const handleRequirementTypeChange = (
    index: number,
    type: RequirementType,
  ) => {
    const updatedRequirements = [...currentRequirements.requirements];

    // Create a new requirement based on type
    let newRequirement: Requirement;

    switch (type) {
      case RequirementType.Character:
        newRequirement = {
          type: RequirementType.Character,
          character: CharacterType.Adventurer,
        } as CharacterRequirement;
        break;
      case RequirementType.WeaponCategory:
        newRequirement = {
          type: RequirementType.WeaponCategory,
          weapon_category: WeaponCategory.None,
        } as WeaponCategoryRequirement;
        break;
      default:
        newRequirement = {
          type,
        };
    }

    updatedRequirements[index] = newRequirement;

    onChange({
      ...currentRequirements,
      requirements: updatedRequirements,
    });
  };

  const handleRemoveRequirement = (index: number) => {
    const updatedRequirements = [...currentRequirements.requirements];
    updatedRequirements.splice(index, 1);

    onChange({
      ...currentRequirements,
      requirements: updatedRequirements,
    });
  };

  const handleCharacterChange = (index: number, character: CharacterType) => {
    const updatedRequirements = [...currentRequirements.requirements];
    const req = updatedRequirements[index];

    updatedRequirements[index] = {
      ...req,
      character,
    } as CharacterRequirement;

    onChange({
      ...currentRequirements,
      requirements: updatedRequirements,
    });
  };

  const handleWeaponCategoryChange = (
    index: number,
    weaponCategory: WeaponCategory,
  ) => {
    const updatedRequirements = [...currentRequirements.requirements];
    const req = updatedRequirements[index];

    updatedRequirements[index] = {
      ...req,
      weapon_category: weaponCategory,
    } as WeaponCategoryRequirement;

    onChange({
      ...currentRequirements,
      requirements: updatedRequirements,
    });
  };

  // Render fields specific to each requirement type
  const renderRequirementFields = (requirement: Requirement, index: number) => {
    const charReq = requirement as CharacterRequirement;
    const weaponReq = requirement as WeaponCategoryRequirement;
    switch (requirement.type) {
      case RequirementType.Character:
        return (
          <NodeField label="Character">
            <NodeInteractive>
              <Select
                size="small"
                style={{ width: "100%" }}
                value={charReq.character || ""}
                onChange={(value) => handleCharacterChange(index, value)}
                placeholder="Select character"
              >
                {ALL_CHARACTER_TYPES.map((char) => (
                  <Select.Option key={char} value={char}>
                    {char}
                  </Select.Option>
                ))}
              </Select>
            </NodeInteractive>
          </NodeField>
        );

      case RequirementType.WeaponCategory:
        return (
          <NodeField label="Weapon Category">
            <NodeInteractive>
              <Select
                size="small"
                style={{ width: "100%" }}
                value={weaponReq.weapon_category || ""}
                onChange={(value) => handleWeaponCategoryChange(index, value)}
                placeholder="Select weapon category"
              >
                {ALL_WEAPON_CATEGORIES.map((category) => (
                  <Select.Option key={category} value={category}>
                    {category}
                  </Select.Option>
                ))}
              </Select>
            </NodeInteractive>
          </NodeField>
        );

      default:
        return null;
    }
  };

  // Panel header with remove button
  const panelHeader = (
    <HeaderContainer>
      <Text strong>
        Requirements{" "}
        {currentRequirements.requirements.length > 0
          ? `(${currentRequirements.requirements.length})`
          : ""}
      </Text>
      <Button
        type="text"
        danger
        size="small"
        icon={<CloseOutlined />}
        onClick={handleRemoveRequirementsSection}
        title="Remove requirements"
      />
    </HeaderContainer>
  );

  return (
    <TransparentCollapse
      activeKey={expanded ? ["requirements"] : []}
      onChange={() => setExpanded(!expanded)}
      ghost
      bordered={false}
    >
      <Panel header={panelHeader} key="requirements">
        <Space direction="vertical" style={{ width: "100%" }}>
          <NodeField label="Operator">
            <NodeInteractive>
              <Select
                size="small"
                style={{ width: "100%" }}
                value={currentRequirements.operator}
                onChange={handleOperatorChange}
              >
                {ALL_REQUIREMENT_OPERATORS.map((op) => (
                  <Select.Option key={op} value={op}>
                    {op}
                  </Select.Option>
                ))}
              </Select>
            </NodeInteractive>
          </NodeField>

          <Divider style={{ margin: "8px 0" }} />

          {currentRequirements.requirements.length > 0 ? (
            currentRequirements.requirements.map((req, index) => (
              <RequirementCard
                key={index}
                size="small"
                title={
                  <NodeInteractive>
                    <RequirementTypeHeader>
                      <Select
                        size="small"
                        value={req.type}
                        style={{ width: 180 }}
                        onChange={(value) =>
                          handleRequirementTypeChange(
                            index,
                            value as RequirementType,
                          )
                        }
                      >
                        {ALL_REQUIREMENT_TYPES.map((type) => (
                          <Select.Option key={type} value={type}>
                            {type}
                          </Select.Option>
                        ))}
                      </Select>
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveRequirement(index)}
                      />
                    </RequirementTypeHeader>
                  </NodeInteractive>
                }
              >
                {renderRequirementFields(req, index)}
              </RequirementCard>
            ))
          ) : (
            <Text type="secondary">No requirements defined</Text>
          )}

          <Button
            type="dashed"
            size="small"
            icon={<PlusOutlined />}
            block
            onClick={handleAddRequirement}
          >
            Add Requirement
          </Button>
        </Space>
      </Panel>
    </TransparentCollapse>
  );
};
