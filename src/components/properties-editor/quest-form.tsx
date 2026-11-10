import { Alert, Select, Space, Typography } from "antd";
import React from "react";
import { EntityReferenceSelect } from "@components/common/entity-reference-select";
import { ALL_ACHIEVEMENT_TYPES, AchievementType } from "@models/achievement.types";
import { EntityType } from "@models/common.types";
import { ALL_QUEST_ASSIGNEES, ALL_QUEST_ORIGINS, Quest } from "@models/quest.types";
import { FlagField, SelectField, withField } from "./fields";

const { Text } = Typography;

interface QuestFormProps {
  entity: Quest;
  onChange: (entity: Quest) => void;
}

export const QuestForm: React.FC<QuestFormProps> = ({ entity, onChange }) => {
  const set = (patch: Partial<Quest>) => onChange(withField(entity, patch));
  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Alert type="info" showIcon message="The objective tree (root) is not editable here; it is saved as read." />
      <Space wrap>
        <SelectField
          label="origin"
          value={entity.origin}
          options={ALL_QUEST_ORIGINS}
          onChange={(origin) => origin && set({ origin })}
        />
        <SelectField
          label="assignee"
          value={entity.assignee}
          options={ALL_QUEST_ASSIGNEES}
          onChange={(assignee) => assignee && set({ assignee })}
        />
        <SelectField
          label="achievement on complete"
          value={entity.achievement_on_complete}
          options={ALL_ACHIEVEMENT_TYPES}
          onChange={(achievement_on_complete) => achievement_on_complete && set({ achievement_on_complete })}
        />
      </Space>
      <Space wrap>
        <FlagField label="is repeatable" value={entity.is_repeatable} onChange={(on) => set({ is_repeatable: on ?? false })} />
        <FlagField label="ends run" value={entity.ends_run} onChange={(ends_run) => set({ ends_run })} />
      </Space>
      <Space>
        <Text strong>required achievements</Text>
        <Select<AchievementType[]>
          size="small"
          mode="multiple"
          style={{ minWidth: 260 }}
          value={entity.required_achievements}
          aria-label="required achievements"
          onChange={(required_achievements) => set({ required_achievements })}
          options={ALL_ACHIEVEMENT_TYPES.map((a) => ({ value: a, label: a }))}
        />
      </Space>
      <Space align="start" size="large">
        <Space direction="vertical">
          <Text strong>difficulty</Text>
          <EntityReferenceSelect
            entityType={EntityType.QuestDifficulty}
            value={entity.difficulty.key}
            onChange={(difficulty) => set({ difficulty })}
          />
        </Space>
        <Space direction="vertical">
          <Text strong>stage</Text>
          <EntityReferenceSelect
            entityType={EntityType.Stage}
            value={entity.stage.key}
            onChange={(stage) => set({ stage })}
          />
        </Space>
      </Space>
    </Space>
  );
};
