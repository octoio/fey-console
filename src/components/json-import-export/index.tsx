import React from "react";
import { StyledCard } from "@components/common/styled-components";
import styled from "@emotion/styled";
import { useFileOperations } from "@hooks/use-file-operations";
import { useJsonOperations } from "@hooks/use-json-operations";
import { FileInfo } from "@utils/entity-scanner";
import { FileSaver } from "./file-saver";
import { FileSelector } from "./file-selector";
import { ImportExportControls } from "./import-export-controls";
import { JsonEditor } from "./json-editor";
import { StatusMessages } from "./status-messages";

const Container = styled.div`
  padding: 16px;
`;

interface JsonImportExportProps {
  files: FileInfo[];
  directoryHandle: FileSystemDirectoryHandle | null;
}

export const JsonImportExport: React.FC<JsonImportExportProps> = ({
  files,
  directoryHandle,
}) => {
  const {
    jsonInput,
    handleInputChange,
    handleExport,
    handleImport,
    error,
    success,
    setError,
    setSuccess,
  } = useJsonOperations();

  const {
    selectedFile,
    destinationFile,
    setDestinationFile,
    handleLoadFromFile,
    handleSaveToFile,
    setSelectedFile,
  } = useFileOperations(directoryHandle, jsonInput, setSuccess, setError);

  return (
    <Container>
      <StyledCard>
        <ImportExportControls
          handleExport={handleExport}
          handleImport={handleImport}
          jsonInput={jsonInput}
        />

        <StatusMessages error={error} success={success} />

        <FileSelector
          files={files}
          onFileSelect={(val) => {
            setSelectedFile(val);
            handleLoadFromFile(val);
          }}
        />

        <JsonEditor value={jsonInput} onChange={handleInputChange} />

        <FileSaver
          destinationFile={destinationFile}
          selectedFile={selectedFile}
          onChange={setDestinationFile}
          onSave={handleSaveToFile}
          disabled={!jsonInput}
        />
      </StyledCard>
    </Container>
  );
};
