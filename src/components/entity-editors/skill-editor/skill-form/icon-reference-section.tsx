import { Form } from "antd";
import React from "react";
import { EntityReferenceSelect } from "@components/common/entity-reference-select";
import { StyledCard } from "@components/common/styled-components";
import { EntityReference, EntityType } from "@models/common.types";
import { useSkillStore } from "@store/skill.store";

export const IconReferenceSection: React.FC = () => {
  const { skillData, setIconReference } = useSkillStore();

  if (!skillData) return null;
  const { entity } = skillData;

  const handleIconReferenceChange = (entityRef: EntityReference) => {
    try {
      setIconReference(entityRef);
    } catch (error) {
      console.error("Failed to update icon reference:", error);
    }
  };

  return (
    <StyledCard title="Icon Reference">
      <Form.Item label="Icon">
        <EntityReferenceSelect
          entityType={EntityType.Image}
          value={entity.icon_reference.key}
          onChange={handleIconReferenceChange}
          size="middle"
        />
      </Form.Item>
    </StyledCard>
  );
};
