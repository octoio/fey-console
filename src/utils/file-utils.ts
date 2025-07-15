export const fileUtils = {
  requestDirectoryHandle:
    async (): Promise<FileSystemDirectoryHandle | null> => {
      try {
        const handle = await window.showDirectoryPicker();
        return handle;
      } catch {
        return null;
      }
    },

  navigateToDirectory: async (
    rootHandle: FileSystemDirectoryHandle,
    pathSegments: string[],
  ): Promise<FileSystemDirectoryHandle> => {
    let currentHandle = rootHandle;

    for (const segment of pathSegments) {
      if (!segment) continue;
      currentHandle = await currentHandle.getDirectoryHandle(segment, {
        create: true,
      });
    }

    return currentHandle;
  },

  readFile: async (
    rootHandle: FileSystemDirectoryHandle,
    filePath: string,
  ): Promise<string> => {
    const segments = filePath.split("/");
    const fileName = segments.pop() || "";

    const dirHandle = await fileUtils.navigateToDirectory(rootHandle, segments);

    const fileHandle = await dirHandle.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    return await file.text();
  },

  writeFile: async (
    rootHandle: FileSystemDirectoryHandle,
    filePath: string,
    content: string,
  ): Promise<void> => {
    const segments = filePath.split("/");
    const fileName = segments.pop() || "";

    const dirHandle = await fileUtils.navigateToDirectory(rootHandle, segments);

    const fileHandle = await dirHandle.getFileHandle(fileName, {
      create: true,
    });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  },
};
