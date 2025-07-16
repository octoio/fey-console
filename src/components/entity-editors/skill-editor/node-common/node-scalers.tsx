import { Button, Collapse, InputNumber, Select, Space, Typography } from "antd";
import React, { useState } from "react";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  StyledCard,
  FullWidthSpace,
  HeaderContainer,
  FullWidthInputNumber,
} from "@components/common/styled-components";
import styled from "@emotion/styled";
import { EntityType } from "@models/common.types";
import { SkillEffectScaling } from "@models/skill.types";
import { StatType } from "@models/stat.types";
import { useSkillStore } from "@store/skill.store";
import { NodeField } from "./node-field";
import { NodeInteractive } from "./node-interactive";

const { Option } = Select;
const { Text } = Typography;
const { Panel } = Collapse;

// Styled components
const StyledCollapse = styled(Collapse)`
  background: transparent;
`;

const PanelContainer = styled.div`
  padding: 12px;
`;

const ScaleContainer = styled(Space)`
  width: 100%;
`;

const ScalerPanel = styled(Panel)`
  margin-bottom: 10px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  background: #fff;
`;

interface NodeScalersProps {
  scalers: SkillEffectScaling[];
  onChange: (scalers: SkillEffectScaling[]) => void;
  title?: string;
}

export const NodeScalers: React.FC<NodeScalersProps> = ({
  scalers = [],
  onChange,
  title = "Scalers",
}) => {
  const { getEntityReferencesByType } = useSkillStore();
  // Track which panels are active (expanded)
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  const stats = getEntityReferencesByType(EntityType.Stat).map(
    (stat) => stat.key as StatType,
  );

  const handleAddScaler = () => {
    const newScaler: SkillEffectScaling = {
      base: 0,
      scaling: { min: 0, max: 1 },
      stat: stats[0] || StatType.AttackPower,
    };

    const newScalers = [...scalers, newScaler];
    onChange(newScalers);

    // Auto-expand the newly added item
    setActiveKeys([...activeKeys, `scaler-${newScalers.length - 1}`]);
  };

  const handleRemoveScaler = (index: number) => {
    const updatedScalers = [...scalers];
    updatedScalers.splice(index, 1);
    onChange(updatedScalers);

    // Update active keys after removing an item
    setActiveKeys(
      activeKeys
        .filter((key) => key !== `scaler-${index}`)
        .map((key) => {
          const keyIndex = parseInt(key.split("-")[1]);
          if (keyIndex > index) return `scaler-${keyIndex - 1}`;

          return key;
        }),
    );
  };

  const handleScalerChange = (
    index: number,
    field: keyof SkillEffectScaling | "min" | "max",
    value: number | string | StatType,
  ) => {
    const updatedScalers = [...scalers];
    const numValue =
      typeof value === "string" && !isNaN(parseFloat(value))
        ? parseFloat(value)
        : value;

    if (field === "min" || field === "max") {
      updatedScalers[index] = {
        ...updatedScalers[index],
        scaling: {
          ...updatedScalers[index].scaling,
          [field]: numValue || 0,
        },
      };
    } else if (field === "stat" && typeof value === "string") {
      updatedScalers[index] = {
        ...updatedScalers[index],
        [field]: value as StatType,
      };
    } else {
      updatedScalers[index] = {
        ...updatedScalers[index],
        [field]: numValue || 0,
      };
    }

    onChange(updatedScalers);
  };

  const handleCollapseChange = (keys: string | string[]) => {
    setActiveKeys(typeof keys === "string" ? [keys] : keys);
  };

  // Create the panel header with a remove button
  const getPanelHeader = (index: number, scaler: SkillEffectScaling) => (
    <HeaderContainer>
      <Text strong>
        {scaler.stat} ({scaler.base.toFixed(2)})
      </Text>
      <Button
        type="text"
        danger
        size="small"
        icon={<DeleteOutlined />}
        onClick={(e) => {
          e.stopPropagation(); // Prevent collapse toggle when clicking remove
          handleRemoveScaler(index);
        }}
      />
    </HeaderContainer>
  );

  return (
    <StyledCard
      size="small"
      title={title}
      extra={
        <Button
          size="small"
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddScaler}
        >
          Add
        </Button>
      }
    >
      {scalers.length === 0 ? (
        <Text type="secondary">No scalers defined</Text>
      ) : (
        <StyledCollapse
          activeKey={activeKeys}
          onChange={handleCollapseChange}
          bordered={false}
        >
          {scalers.map((scaler, index) => (
            <ScalerPanel
              key={`scaler-${index}`}
              header={getPanelHeader(index, scaler)}
              className="scaler-panel"
              collapsible="header"
              forceRender
            >
              <PanelContainer>
                <FullWidthSpace direction="vertical">
                  <NodeField label="Stat">
                    <NodeInteractive>
                      <Select
                        size="small"
                        value={scaler.stat}
                        style={{ width: "100%" }}
                        onChange={(value) =>
                          handleScalerChange(index, "stat", value)
                        }
                      >
                        {stats.map((stat) => (
                          <Option key={stat} value={stat}>
                            {stat}
                          </Option>
                        ))}
                      </Select>
                    </NodeInteractive>
                  </NodeField>

                  <NodeField label="Base Value">
                    <NodeInteractive>
                      <FullWidthInputNumber
                        size="small"
                        value={scaler.base}
                        onChange={(value) =>
                          value !== null &&
                          handleScalerChange(index, "base", value)
                        }
                        step={0.01}
                        precision={2}
                      />
                    </NodeInteractive>
                  </NodeField>

                  <NodeField label="Scaling Range">
                    <ScaleContainer>
                      <NodeInteractive>
                        <InputNumber
                          size="small"
                          value={scaler.scaling.min}
                          onChange={(value) =>
                            value !== null &&
                            handleScalerChange(index, "min", value)
                          }
                          style={{ width: "100%" }}
                          step={0.01}
                          precision={2}
                          addonBefore="Min"
                        />
                      </NodeInteractive>
                      <NodeInteractive>
                        <InputNumber
                          size="small"
                          value={scaler.scaling.max}
                          onChange={(value) =>
                            value !== null &&
                            handleScalerChange(index, "max", value)
                          }
                          style={{ width: "100%" }}
                          step={0.01}
                          precision={2}
                          addonBefore="Max"
                        />
                      </NodeInteractive>
                    </ScaleContainer>
                  </NodeField>
                </FullWidthSpace>
              </PanelContainer>
            </ScalerPanel>
          ))}
        </StyledCollapse>
      )}
    </StyledCard>
  );
};
