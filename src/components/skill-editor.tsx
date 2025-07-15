import { Layout, Tabs, Card, Space } from "antd";
import React, { useState, useEffect, Suspense, lazy } from "react";
import styled from "@emotion/styled";
import { EntityReferences } from "@models/common.types";
import { useSkillStore } from "@store/skill.store";
import { FileInfo } from "@utils/entity-scanner";
import { LoadingSpinner } from "./loading-spinner";
import { SkillPropertiesForm } from "./skill-properties-form";

// Lazy load heavy components to reduce initial bundle size
const ExecutionTreeEditor = lazy(() =>
  import("./execution-tree-editor").then((module) => ({
    default: module.ExecutionTreeEditor,
  })),
);
const JsonImportExport = lazy(() =>
  import("./json-import-export").then((module) => ({
    default: module.JsonImportExport,
  })),
);

const { Content } = Layout;

const EditorLayout = styled(Layout)`
  height: 100vh;
  overflow: hidden;
`;

const EditorContent = styled(Content)`
  display: flex;
  flex-grow: 1;
  overflow: hidden;
`;

const EditorCard = styled(Card)`
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

interface SkillEditorProps {
  entityReferences: EntityReferences;
  files: FileInfo[];
  directoryHandle: FileSystemDirectoryHandle | null;
}

export const SkillEditor: React.FC<SkillEditorProps> = ({
  entityReferences,
  files,
  directoryHandle,
}) => {
  const [tab, setTab] = useState("1");
  const setEntityReferences = useSkillStore(
    (state) => state.setEntityReferences,
  );

  // When entityReferences prop changes, update them in the store
  useEffect(() => {
    setEntityReferences(entityReferences);
  }, [entityReferences, setEntityReferences]);

  const handleTabChange = (activeKey: string) => {
    setTab(activeKey);
  };

  // Define tab items with lazy-loaded components
  const tabItems = [
    {
      key: "1",
      label: "Properties",
      children: <SkillPropertiesForm />,
    },
    {
      key: "2",
      label: "Execution Tree",
      children: (
        <Suspense fallback={<LoadingSpinner />}>
          <ExecutionTreeEditor />
        </Suspense>
      ),
    },
    {
      key: "3",
      label: "JSON",
      children: (
        <Suspense fallback={<LoadingSpinner />}>
          <JsonImportExport files={files} directoryHandle={directoryHandle} />
        </Suspense>
      ),
    },
  ];

  return (
    <EditorLayout>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <EditorContent>
          <EditorCard>
            <Tabs activeKey={tab} onChange={handleTabChange} items={tabItems} />
          </EditorCard>
        </EditorContent>
      </Space>
    </EditorLayout>
  );
};
