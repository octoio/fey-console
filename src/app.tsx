import {
  ConfigProvider,
  theme as antdTheme,
  Space,
  Typography,
  App as AntApp,
  notification,
  Tabs,
} from "antd";
import React, { useState, useEffect } from "react";
import { EntityManager } from "@components/entity-editors/generic/entity-manager";
import { FileList } from "@components/file-manager/file-list";
import { FolderSelector } from "@components/file-manager/folder-selector";
import styled from "@emotion/styled";
import {
  getDefaultEntityReferences,
  EntityReferences,
  EntityType,
} from "@models/common.types";
import { ENTITY_TYPE_DISPLAY_NAMES, SimpleEntity } from "@models/entity.types";
import { useEntityActions } from "@store/entity.store";
import { entityFileOps } from "@utils/entity-file-operations";
import {
  scanFolderForEntities,
  FileInfo,
  FileEntityReferences,
} from "@utils/entity-scanner";

// Ant Design custom theme configuration
const theme = {
  token: {
    colorPrimary: "#3f51b5",
    colorSecondary: "#f50057",
  },
  algorithm: antdTheme.defaultAlgorithm,
};

const AppContainer = styled(Space)`
  width: 100%;
  padding: 16px;
`;

const HeaderContainer = styled(Space)`
  width: 100%;
  justify-content: space-between;
`;

export const App: React.FC = () => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [directoryHandle, setDirectoryHandle] =
    useState<FileSystemDirectoryHandle | null>(null);
  const [, setEntityReferences] = useState<EntityReferences>(
    getDefaultEntityReferences(),
  );
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("file-manager");
  const [filesLoaded, setFilesLoaded] = useState<boolean>(false);

  const entityActions = useEntityActions();

  // Convert FileEntityReferences to SimpleEntities for the store
  const convertFileEntityReferencesToSimpleEntities = (
    entityRefs: FileEntityReferences,
  ): SimpleEntity[] => {
    const entities: SimpleEntity[] = [];

    Object.entries(entityRefs).forEach(([, refs]) => {
      refs.forEach((ref) => {
        const simpleEntity: SimpleEntity = {
          id: ref.id,
          type: ref.type,
          key: ref.key,
          owner: ref.owner,
          data: ref.data || {}, // Use actual JSON data from file
          createdAt: ref.data?.createdAt
            ? new Date(ref.data.createdAt)
            : new Date(),
          modifiedAt: ref.data?.modifiedAt
            ? new Date(ref.data.modifiedAt)
            : new Date(),
          metadata: {
            title: ref.data?.metadata?.title || ref.key,
            description:
              ref.data?.metadata?.description ||
              `${ENTITY_TYPE_DISPLAY_NAMES[ref.type]} entity`,
          },
        };
        entities.push(simpleEntity);
      });
    });

    return entities;
  };

  const loadEntitiesFromFolder = async (
    folderPath: string,
    dirHandle: FileSystemDirectoryHandle,
  ) => {
    try {
      setLoading(true);
      const result = await scanFolderForEntities(folderPath, dirHandle);
      setEntityReferences(result.entities);
      setFiles(result.files);

      // Convert and import entities into the store using the data-rich entities
      const simpleEntities = convertFileEntityReferencesToSimpleEntities(
        result.entitiesWithData,
      );
      entityActions.clearEntities(); // Clear existing entities first
      entityActions.importEntities(simpleEntities);

      setLoading(false);
      setFilesLoaded(true);

      notification.success({
        message: "Entities Loaded",
        description: `Successfully loaded ${result.files.length} files from ${folderPath}`,
      });
    } catch (error) {
      setLoading(false);
      notification.error({
        message: "Error Loading Entities",
        description: String(error),
      });
    }
  };

  useEffect(() => {
    if (selectedFolder && directoryHandle)
      loadEntitiesFromFolder(selectedFolder, directoryHandle);
  }, [selectedFolder, directoryHandle]);

  const handleFolderSelect = (
    folderPath: string,
    dirHandle: FileSystemDirectoryHandle | null,
  ) => {
    setSelectedFolder(folderPath);
    setDirectoryHandle(dirHandle);
    // Update the entity file operations with the new directory handle
    entityFileOps.updateDirectoryHandle(dirHandle);
  };

  const createEntityTabs = () => {
    const entityTabs: Array<{
      key: string;
      label: string;
      children: JSX.Element;
    }> = [];

    // Add all entity tabs using EntityManager (including Skills)
    const allEntityTypes = Object.values(EntityType);

    allEntityTypes.forEach((entityType) => {
      entityTabs.push({
        key: entityType.toLowerCase(),
        label: ENTITY_TYPE_DISPLAY_NAMES[entityType],
        children: <EntityManager initialEntityType={entityType} />,
      });
    });

    return entityTabs;
  };

  const tabItems = [
    {
      key: "file-manager",
      label: "File Manager",
      children: (
        <Space direction="vertical" style={{ width: "100%" }}>
          <FolderSelector
            onFolderSelect={handleFolderSelect}
            selectedFolder={selectedFolder}
            loading={loading}
          />
          <FileList files={files} />
        </Space>
      ),
    },
    {
      key: "home",
      label: "Home",
      children: <EntityManager />,
      disabled: !filesLoaded,
    },
    ...createEntityTabs().map((tab) => ({
      ...tab,
      disabled: !filesLoaded,
    })),
  ];

  return (
    <ConfigProvider theme={theme}>
      <AntApp>
        <AppContainer direction="vertical">
          <HeaderContainer>
            <Typography.Title level={4}>
              Fey Console - Multi-Entity Editor
            </Typography.Title>
          </HeaderContainer>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="small"
            type="card"
          />
        </AppContainer>
      </AntApp>
    </ConfigProvider>
  );
};
