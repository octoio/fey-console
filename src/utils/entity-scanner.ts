import {
  EntityType,
  EntityReference,
  EntityReferences,
  getDefaultEntityReferences,
} from "@models/common.types";

// Add a new interface for file info
export interface FileInfo {
  name: string;
  path: string;
  isEntity: boolean;
  entityType?: string;
}

// Interface that extends the common EntityReference with path
interface FileEntityReference extends EntityReference {
  path: string;
  name: string; // Alias for key for backward compatibility
}

type FileEntityReferences = Record<EntityType, FileEntityReference[]>;

const mapEntityReferenceFromFileEntityReference = (
  entityRef: FileEntityReference,
): EntityReference => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { path, name, ...entityReference } = entityRef;
  return entityReference;
};

const mapEntityReferencesFromFileEntityReferences = (
  entityRefs: FileEntityReferences,
): EntityReferences =>
  Object.fromEntries(
    Object.entries(entityRefs).map(([type, refs]) => [
      type,
      refs.map(mapEntityReferenceFromFileEntityReference),
    ]),
  ) as EntityReferences;

export async function scanFolderForEntities(
  folderPath: string,
  dirHandle: FileSystemDirectoryHandle | null,
): Promise<{
  entities: EntityReferences;
  files: FileInfo[];
}> {
  // Group entities by type
  const entityReferences: FileEntityReferences =
    getDefaultEntityReferences() as FileEntityReferences;
  const allFiles: FileInfo[] = [];

  try {
    if (dirHandle) {
      console.log(`Scanning directory: ${folderPath}`);
      // Use the File System Access API to scan the directory
      await scanDirectory(dirHandle, "", entityReferences, allFiles);
      console.log("Finished scanning directory");
      console.log(`Found ${allFiles.length} files`);
    } else throw new Error("Directory handle is required for scanning");

    // If no entities were found, provide mock data for testing
    if (Object.values(entityReferences).every((arr) => arr.length === 0)) {
      console.log("No entities found, providing mock data");
      await mockScanDelay();
    }

    return {
      entities: mapEntityReferencesFromFileEntityReferences(entityReferences),
      files: allFiles,
    };
  } catch (error) {
    console.error("Error scanning folder for entities:", error);
    throw new Error(
      `Failed to scan folder: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function scanDirectory(
  dirHandle: FileSystemDirectoryHandle,
  path: string,
  entityReferences: FileEntityReferences,
  fileList: FileInfo[],
): Promise<void> {
  try {
    for await (const entry of dirHandle.values()) {
      const entryPath = path ? `${path}/${entry.name}` : entry.name;

      if (entry.kind === "directory") {
        try {
          // Recursively scan subdirectories
          await scanDirectory(
            await dirHandle.getDirectoryHandle(entry.name),
            entryPath,
            entityReferences,
            fileList,
          );
        } catch (error) {
          console.warn(`Could not access subdirectory: ${entry.name}`, error);
        }
      } else if (entry.kind === "file") {
        // Add file to the list
        fileList.push({
          name: entry.name,
          path: entryPath,
          isEntity: entry.name.endsWith(".json"),
          entityType: entry.name.endsWith(".json") ? undefined : undefined,
        });

        if (entry.name.endsWith(".json")) {
          try {
            // Process JSON files
            await processJsonFile(
              dirHandle,
              entry.name,
              entryPath,
              entityReferences,
              fileList,
            );
          } catch (error) {
            console.warn(`Could not process file: ${entry.name}`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${path}:`, error);
  }
}

async function processJsonFile(
  dirHandle: FileSystemDirectoryHandle,
  fileName: string,
  filePath: string,
  entityReferences: FileEntityReferences,
  fileList: FileInfo[],
): Promise<void> {
  try {
    // Get file handle
    const fileHandle = await dirHandle.getFileHandle(fileName);

    // Get file contents
    const file = await fileHandle.getFile();
    const content = await file.text();
    let json;

    try {
      json = JSON.parse(content);
    } catch (parseError) {
      console.warn(`Error parsing JSON in ${filePath}: ${parseError}`);
      return;
    }

    // Check if this is an entity definition
    if (json.type && json.owner && json.key && json.id !== undefined) {
      const entityType = json.type as EntityType;

      // Create entity reference
      const entityRef: FileEntityReference = {
        id: json.id,
        name: json.key, // Alias key as name for backward compatibility
        key: json.key,
        type: entityType,
        owner: json.owner,
        version: json.version,
        path: filePath,
      };

      console.log(`Found entity: ${entityRef.name} (${entityRef.type})`);

      // Update the file entry with entity type information
      const fileIndex = fileList.findIndex((f) => f.path === filePath);
      if (fileIndex >= 0) {
        fileList[fileIndex].isEntity = true;
        fileList[fileIndex].entityType = entityType;
      }

      // Add to appropriate category
      entityReferences[entityType].push(entityRef);
    }
  } catch (error) {
    console.warn(`Error processing file ${filePath}:`, error);
  }
}

// Mock delay to simulate async operation
function mockScanDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 1000));
}
