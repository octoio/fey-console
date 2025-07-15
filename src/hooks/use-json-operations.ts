import { useState } from "react";
import { useSkillStore } from "@store/skill.store";

export const useJsonOperations = () => {
  const { exportToJson, importFromJson } = useSkillStore();
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleExport = () => {
    try {
      const json = exportToJson();
      setJsonInput(json);
      setSuccess("JSON exported successfully.");
      setError(null);
    } catch (e) {
      setError(
        "Failed to export JSON: " +
          (e instanceof Error ? e.message : String(e)),
      );
      setSuccess(null);
    }
  };

  const handleImport = () => {
    try {
      importFromJson(jsonInput);
      setSuccess("JSON imported successfully.");
      setError(null);
    } catch (e) {
      setError(
        "Failed to import JSON: " +
          (e instanceof Error ? e.message : String(e)),
      );
      setSuccess(null);
    }
  };

  const handleInputChange = (value: string | undefined) => {
    setJsonInput(value || "");
    setError(null);
    setSuccess(null);
  };

  return {
    jsonInput,
    setJsonInput,
    error,
    setError,
    success,
    setSuccess,
    handleExport,
    handleImport,
    handleInputChange,
  };
};
