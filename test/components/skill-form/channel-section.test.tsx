import { describe, it, expect, beforeEach, vi } from "vitest";
import { ChannelSection } from "@components/skill-form/channel-section";
import { EntityType } from "@models/common.types";
import { QualityType } from "@models/quality.types";
import {
  SkillActionNodeType,
  SkillActionParallelNode,
  SkillChannel,
  SkillEntityDefinition,
  SkillTargetType,
} from "@models/skill.types";
import { useSkillStore } from "@store/skill.store";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("@store/skill.store");

const channel: SkillChannel = {
  pulse_interval: 0.5,
  pulse_cost: 1,
  turn_rate: 120,
};

const skill = (withChannel: boolean): SkillEntityDefinition => ({
  id: "test-skill",
  owner: "TestOwner",
  type: EntityType.Skill,
  key: "test-key",
  version: 1,
  entity: {
    metadata: { title: "Test Skill", description: "Test description" },
    quality: QualityType.Common,
    categories: [],
    cost: { mana: 2 },
    cooldown: 10,
    target_type: SkillTargetType.None,
    execution_root: {
      type: SkillActionNodeType.Parallel,
      name: "Root",
      children: [],
      loop: 1,
    } as SkillActionParallelNode,
    icon_reference: {
      id: "test-icon",
      type: EntityType.Image,
      owner: "TestOwner",
      key: "test-icon",
      version: 1,
    },
    indicators: [],
    cast_distance: { max: 0 },
    ...(withChannel ? { channel } : {}),
  },
});

describe("ChannelSection", () => {
  const updateChannel = vi.fn();
  const show = (withChannel: boolean) =>
    (useSkillStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      skillData: skill(withChannel),
      updateChannel,
    });

  beforeEach(() => {
    vi.clearAllMocks();
    show(true);
  });

  it("shows the three numbers of a channelled skill", () => {
    render(<ChannelSection />);

    expect(screen.getByText("Channel")).toBeInTheDocument();
    expect(screen.getByLabelText("Pulse Interval")).toHaveValue("0.5");
    expect(screen.getByLabelText("Pulse Cost")).toHaveValue("1");
    expect(screen.getByLabelText("Turn Rate")).toHaveValue("120");
  });

  it("changes one number and keeps the others", async () => {
    render(<ChannelSection />);

    fireEvent.change(screen.getByLabelText("Pulse Cost"), {
      target: { value: "3" },
    });

    await waitFor(() => {
      expect(updateChannel).toHaveBeenCalledWith({ ...channel, pulse_cost: 3 });
    });
  });

  it("shows no numbers for a skill that does not channel and turns one on with defaults", async () => {
    show(false);
    render(<ChannelSection />);

    expect(screen.queryByLabelText("Pulse Cost")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch", { name: "Channelled" }));

    await waitFor(() => {
      expect(updateChannel).toHaveBeenCalledWith(channel);
    });
  });

  it("turns the channel off", async () => {
    render(<ChannelSection />);

    fireEvent.click(screen.getByRole("switch", { name: "Channelled" }));

    await waitFor(() => {
      expect(updateChannel).toHaveBeenCalledWith(undefined);
    });
  });

  it("renders nothing without skill data", () => {
    (useSkillStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      skillData: null,
      updateChannel,
    });

    const { container } = render(<ChannelSection />);
    expect(container.firstChild).toBeNull();
  });
});
