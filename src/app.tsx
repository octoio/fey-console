import {
  ConfigProvider,
  theme as antdTheme,
  Space,
  Typography,
  App as AntApp,
  notification,
  Tabs,
} from "antd";
import React, { useState, useEffect, Suspense, lazy } from "react";
import { FileList } from "@components/file-list";
import { FolderSelector } from "@components/folder-selector";
import { LoadingSpinner } from "@components/loading-spinner";
import styled from "@emotion/styled";
import {
  getDefaultEntityReferences,
  EntityReferences,
} from "@models/common.types";
import { scanFolderForEntities, FileInfo } from "@utils/entity-scanner";

// Lazy load the heavy SkillEditor component
const SkillEditor = lazy(() =>
  import("@components/skill-editor").then((module) => ({
    default: module.SkillEditor,
  })),
);

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
  const [entityReferences, setEntityReferences] = useState<EntityReferences>(
    getDefaultEntityReferences(),
  );
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("1");

  const loadEntitiesFromFolder = async (
    folderPath: string,
    dirHandle: FileSystemDirectoryHandle,
  ) => {
    try {
      setLoading(true);
      const result = await scanFolderForEntities(folderPath, dirHandle);
      setEntityReferences(result.entities);
      setFiles(result.files);
      setLoading(false);

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
  };

  const tabItems = [
    {
      key: "1",
      label: "Load Files",
      children: (
        <FolderSelector
          onFolderSelect={handleFolderSelect}
          selectedFolder={selectedFolder}
          loading={loading}
        />
      ),
    },
    {
      key: "2",
      label: "File List",
      children: <FileList files={files} />,
    },
    {
      key: "3",
      label: "Skill Editor",
      children: (
        <Suspense fallback={<LoadingSpinner tip="Loading Skill Editor..." />}>
          <SkillEditor
            entityReferences={entityReferences}
            files={files}
            directoryHandle={directoryHandle}
          />
        </Suspense>
      ),
    },
  ];

  return (
    <ConfigProvider theme={theme}>
      <AntApp>
        <AppContainer direction="vertical">
          <HeaderContainer>
            <Typography.Title level={4}>Skill Editor</Typography.Title>
          </HeaderContainer>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
          />
        </AppContainer>
      </AntApp>
    </ConfigProvider>
  );
};
