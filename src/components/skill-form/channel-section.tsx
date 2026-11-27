import { Form, Switch } from "antd";
import React from "react";
import {
  StyledCard,
  FullWidthInputNumber,
} from "@components/common/styled-components";
import { SkillChannel } from "@models/skill.types";
import { useSkillStore } from "@store/skill.store";

/** What a skill gets when it becomes a channel: the siphon's numbers. */
const DEFAULT_CHANNEL: SkillChannel = {
  pulse_interval: 0.5,
  pulse_cost: 1,
  turn_rate: 120,
};

const asNumber = (value: number | string | null): number =>
  typeof value === "string" ? parseFloat(value) || 0 : value || 0;

export const ChannelSection: React.FC = () => {
  const { skillData, updateChannel } = useSkillStore();

  if (!skillData) return null;
  const { channel } = skillData.entity;

  const handleChange =
    (field: keyof SkillChannel) => (value: number | string | null) => {
      if (!channel) return;
      try {
        updateChannel({ ...channel, [field]: asNumber(value) });
      } catch (error) {
        console.error("Failed to update channel:", error);
      }
    };

  return (
    <StyledCard title="Channel">
      <Form.Item label="Channelled">
        <Switch
          checked={channel !== undefined}
          onChange={(on) => updateChannel(on ? DEFAULT_CHANNEL : undefined)}
          aria-label="Channelled"
        />
      </Form.Item>
      {channel && (
        <>
          <Form.Item label="Pulse Interval (seconds)">
            <FullWidthInputNumber
              min={0.1}
              step={0.1}
              value={channel.pulse_interval}
              onChange={handleChange("pulse_interval")}
              aria-label="Pulse Interval"
            />
          </Form.Item>
          <Form.Item label="Pulse Cost (mana)">
            <FullWidthInputNumber
              min={1}
              step={1}
              value={channel.pulse_cost}
              onChange={handleChange("pulse_cost")}
              aria-label="Pulse Cost"
            />
          </Form.Item>
          <Form.Item label="Turn Rate (degrees per second)">
            <FullWidthInputNumber
              min={0}
              step={10}
              value={channel.turn_rate}
              onChange={handleChange("turn_rate")}
              aria-label="Turn Rate"
            />
          </Form.Item>
        </>
      )}
    </StyledCard>
  );
};
