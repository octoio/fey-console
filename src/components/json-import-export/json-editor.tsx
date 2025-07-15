import React, { Suspense, lazy } from "react";
import { EditorContainer } from "@components/common/styled-components";
import { LoadingSpinner } from "@components/loading-spinner";

// Lazy load Monaco Editor to reduce initial bundle size
const MonacoEditor = lazy(() => import("@monaco-editor/react"));

interface JsonEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange }) => {
  return (
    <EditorContainer>
      <Suspense
        fallback={
          <LoadingSpinner height="200px" tip="Loading JSON Editor..." />
        }
      >
        <MonacoEditor
          height="100%"
          defaultLanguage="json"
          value={value}
          onChange={onChange}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </Suspense>
    </EditorContainer>
  );
};
