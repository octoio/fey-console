import { useMemo } from "react";
import { FileInfo } from "@utils/entity-scanner";

/**
 * Get file type from extension
 */
export const getFileType = (fileName: string): string => {
  const parts = fileName.split(".");
  if (parts.length === 1 || fileName.startsWith(".")) {
    // No extension or hidden files
    return "UNKNOWN";
  }
  const extension = parts.pop()?.toLowerCase();
  if (!extension) return "UNKNOWN";
  if (extension === "json") return "JSON";
  return extension.toUpperCase();
};

interface UseFileFilterProps {
  files: FileInfo[];
  searchText: string;
  fileTypeFilter: string | null;
}

interface UseFileFilterReturn {
  filteredFiles: FileInfo[];
  fileTypes: string[];
  entityTypes: Record<string, number>;
}

/**
 * Custom hook that efficiently filters files with memoization
 */
export function useFileFilter({
  files,
  searchText,
  fileTypeFilter,
}: UseFileFilterProps): UseFileFilterReturn {
  // Get unique file types with memoization
  const fileTypes = useMemo(() => {
    const types = new Set<string>();
    files.forEach((file) => {
      types.add(getFileType(file.name));
    });
    return Array.from(types).sort();
  }, [files]);

  // Calculate entity types with memoization
  const entityTypes = useMemo(() => {
    const types: Record<string, number> = {};
    files.forEach((file) => {
      if (file.entityType)
        types[file.entityType] = (types[file.entityType] || 0) + 1;
    });
    return types;
  }, [files]);

  // Filter files with memoization
  const filteredFiles = useMemo(() => {
    let result = files;

    // Apply text search filter
    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      result = result.filter(
        (file) =>
          file.name.toLowerCase().includes(lowerSearchText) ||
          file.path.toLowerCase().includes(lowerSearchText) ||
          (file.entityType &&
            file.entityType.toLowerCase().includes(lowerSearchText)),
      );
    }

    // Apply file type filter
    if (fileTypeFilter) {
      result = result.filter(
        (file) => getFileType(file.name) === fileTypeFilter,
      );
    }

    return result;
  }, [files, searchText, fileTypeFilter]);

  return {
    filteredFiles,
    fileTypes,
    entityTypes,
  };
}
