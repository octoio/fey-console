import { useState } from "react";
import { useSkillStore } from "@store/skill.store";
import { fileUtils } from "@utils/file-utils";

export const useFileOperations = (
  directoryHandle: FileSystemDirectoryHandle | null,
  jsonInput: string,
  setSuccess: (message: string | null) => void,
  setError: (message: string | null) => void,
) => {
  const { importFromJson } = useSkillStore();
  const [selectedFile, setSelectedFile] = useState("");
  const [destinationFile, setDestinationFile] = useState("");

  const handleLoadFromFile = async (filePath: string) => {
    if (!directoryHandle) return;
    try {
      const content = await fileUtils.readFile(directoryHandle, filePath);
      importFromJson(content);
      setSuccess(`Successfully loaded JSON from ${filePath}.`);
    } catch (err) {
      setError(`Failed to load JSON from file: ${filePath}`);
    }
  };

  const handleSaveToFile = async () => {
    if (!jsonInput) return;

    let dirHandle = directoryHandle;
    if (!dirHandle) {
      dirHandle = await fileUtils.requestDirectoryHandle();
      if (!dirHandle) return;
    }

    const filePath = destinationFile || selectedFile;
    if (!filePath) return;

    try {
      await fileUtils.writeFile(dirHandle, filePath, jsonInput);
      setSuccess(`Successfully wrote JSON to ${filePath}.`);
    } catch (err) {
      setError(`Failed to save JSON to file: ${filePath}`);
    }
  };

  return {
    selectedFile,
    setSelectedFile,
    destinationFile,
    setDestinationFile,
    handleLoadFromFile,
    handleSaveToFile,
  };
};
