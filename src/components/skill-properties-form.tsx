import { Form, Empty } from "antd";
import React from "react";
import {
  FormContainer,
  EmptyContainer,
} from "@components/common/styled-components";
import { useSkillStore } from "@store/skill.store";
import { BasicInfoForm } from "./skill-form/basic-info-form";
import { CastDistanceSection } from "./skill-form/cast-distance-section";
import { EntityDefinitionSection } from "./skill-form/entity-definition-section";
import { IconReferenceSection } from "./skill-form/icon-reference-section";
import { IndicatorsSection } from "./skill-form/indicators-section";
import { SkillPropertiesSection } from "./skill-form/skill-properties-section";

export const SkillPropertiesForm: React.FC = () => {
  const { skillData } = useSkillStore();

  if (!skillData) {
    return (
      <EmptyContainer>
        <Empty description="No skill data loaded. Import or create a new skill." />
      </EmptyContainer>
    );
  }

  return (
    <FormContainer>
      <Form layout="vertical">
        <EntityDefinitionSection />
        <BasicInfoForm />
        <SkillPropertiesSection />
        <CastDistanceSection />
        <IconReferenceSection />
        <IndicatorsSection />
      </Form>
    </FormContainer>
  );
};
