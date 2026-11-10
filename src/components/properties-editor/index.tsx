import { App as AntApp, Button, Empty, Select, Space, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { entityFilePath, serializeDefinition } from "@components/stage-editor/stage-file-utils";
import { Character } from "@models/character.types";
import { EntityReferences, EntityType } from "@models/common.types";
import { Quest, QuestDifficulty } from "@models/quest.types";
import { useSkillStore } from "@store/skill.store";
import { FileInfo } from "@utils/entity-scanner";
import { fileUtils } from "@utils/file-utils";
import { CharacterForm } from "./character-form";
import { DifficultyForm } from "./difficulty-form";
import { PROPERTIES_TYPES, PropertiesDefinition, parsePropertiesFile } from "./properties-file";
import { QuestForm } from "./quest-form";

const { Text } = Typography;

interface PropertiesEditorProps {
  entityReferences: EntityReferences;
  files: FileInfo[];
  directoryHandle: FileSystemDirectoryHandle | null;
}

export const PropertiesEditor: React.FC<PropertiesEditorProps> = ({
  entityReferences,
  files,
  directoryHandle,
}) => {
  const { notification } = AntApp.useApp();
  const setEntityReferences = useSkillStore((state) => state.setEntityReferences);
  const [definition, setDefinition] = useState<PropertiesDefinition | null>(null);

  // EntityReferenceSelect reads references from the shared store
  useEffect(() => {
    setEntityReferences(entityReferences);
  }, [entityReferences, setEntityReferences]);

  const propertiesFiles = files.filter(
    (file) => file.entityType && PROPERTIES_TYPES.includes(file.entityType),
  );

  const load = async (filePath: string) => {
    if (!directoryHandle) return;
    try {
      setDefinition(parsePropertiesFile(await fileUtils.readFile(directoryHandle, filePath)));
    } catch (error) {
      notification.error({ message: "Failed to load file", description: String(error) });
    }
  };

  const save = async () => {
    if (!definition || !directoryHandle) return;
    try {
      await fileUtils.writeFile(
        directoryHandle,
        entityFilePath(files, definition.type as EntityType, definition.key),
        serializeDefinition(definition),
      );
      notification.success({ message: `Saved ${definition.key}` });
    } catch (error) {
      notification.error({ message: "Failed to save file", description: String(error) });
    }
  };

  // The entity types are told apart by the file's own type; the forms change `entity` only
  const form = () => {
    if (!definition) return null;
    const setEntity = (entity: PropertiesDefinition["entity"]) =>
      setDefinition({ ...definition, entity } as PropertiesDefinition);
    switch (definition.type) {
      case EntityType.QuestDifficulty:
        return <DifficultyForm entity={definition.entity as QuestDifficulty} onChange={setEntity} />;
      case EntityType.Quest:
        return <QuestForm entity={definition.entity as Quest} onChange={setEntity} />;
      default:
        return <CharacterForm entity={definition.entity as Character} onChange={setEntity} />;
    }
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Space>
        <Select
          showSearch
          style={{ width: 320 }}
          placeholder="Open a quest difficulty, quest or character"
          aria-label="Properties file"
          disabled={!directoryHandle}
          onChange={load}
          options={propertiesFiles.map((file) => ({
            value: file.path,
            label: `${file.name}`,
          }))}
        />
        <Button type="primary" disabled={!definition} onClick={save}>
          Save
        </Button>
      </Space>
      {definition ? (
        <>
          <Text strong>{`${definition.type} ${definition.key}`}</Text>
          {form()}
        </>
      ) : (
        <Empty description="Load a folder, then open a file" />
      )}
    </Space>
  );
};
