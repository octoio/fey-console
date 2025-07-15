import { Button, Input, Space, Typography, Alert } from "antd";
import React, { useState, useEffect } from "react";
import { FolderOpenOutlined, ChromeOutlined } from "@ant-design/icons";

interface FolderSelectorProps {
  onFolderSelect: (
    folderPath: string,
    dirHandle: FileSystemDirectoryHandle | null,
  ) => void;
  selectedFolder: string | null;
  loading: boolean;
}

export const FolderSelector: React.FC<FolderSelectorProps> = ({
  onFolderSelect,
  selectedFolder,
  loading,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isApiSupported, setIsApiSupported] = useState<boolean>(false);

  // Check for File System Access API support on mount
  useEffect(() => {
    const supported = typeof window.showDirectoryPicker === "function";
    setIsApiSupported(supported);

    if (!supported) {
      setError(
        "This feature requires Chrome browser with File System Access API support.",
      );
    }
  }, []);

  const handleSelectFolder = async () => {
    if (!isApiSupported) {
      setError("Please use Chrome browser to access this feature.");
      return;
    }

    try {
      setError(null);

      // Use the File System Access API to select a directory
      const dirHandle = await window.showDirectoryPicker({
        id: "entityReferences",
        mode: "read",
      });

      // Pass the directory handle and its name to the parent component
      onFolderSelect(dirHandle.name, dirHandle);

      // Verify we can read from this directory
      try {
        // Test if we can read the directory by getting a file or subdirectory
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _entry of dirHandle.values()) {
          // If we can iterate, we have read access
          break;
        }
      } catch (readError) {
        setError(
          `Permission issue: ${readError instanceof Error ? readError.message : String(readError)}`,
        );
      }
    } catch (folderError) {
      console.error("Error selecting folder:", folderError);

      // Handle user cancelling the picker
      if (
        folderError instanceof DOMException &&
        folderError.name === "AbortError"
      ) {
        // User cancelled the directory selection - no need to log
        return;
      }

      setError(
        `Error selecting folder: ${folderError instanceof Error ? folderError.message : String(folderError)}`,
      );
    }
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <Typography.Text strong>Entity References Folder</Typography.Text>
      <Space style={{ width: "100%", marginTop: "8px" }}>
        <Input
          value={selectedFolder || ""}
          placeholder="Select a folder containing entity definitions"
          readOnly
          style={{ width: "400px" }}
        />
        <Button
          icon={<FolderOpenOutlined />}
          onClick={handleSelectFolder}
          loading={loading}
          type="primary"
          disabled={!isApiSupported}
        >
          Browse Folder
        </Button>
      </Space>

      {!isApiSupported && (
        <Alert
          message="Browser Compatibility Issue"
          description={
            <span>
              This feature requires <ChromeOutlined /> Chrome browser with File
              System Access API support. Please switch to Chrome to use this
              functionality.
            </span>
          }
          type="warning"
          showIcon
          style={{ marginTop: "8px" }}
        />
      )}

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginTop: "8px" }}
        />
      )}

      {selectedFolder && (
        <Typography.Text
          type="secondary"
          style={{ display: "block", marginTop: "4px" }}
        >
          Using entity references from: {selectedFolder}
        </Typography.Text>
      )}
    </div>
  );
};
