class FileSystemStorage {
  #root = null;

  constructor(name) {
    this.name = name;
  }

  async connect() {
    if (!navigator.storage || !navigator.storage.getDirectory) {
      throw new Error('File System Access API is not supported');
    }

    this.#root = await navigator.storage.getDirectory();

    // Create root directory for this storage instance
    try {
      await this.#root.getDirectoryHandle(this.name, { create: true });
    } catch (error) {
      throw new Error(`Failed to create root directory: ${error.message}`);
    }
  }

  async createDirectory(path) {
    if (!this.#root) throw new Error('Storage not connected');

    const pathParts = path.split('/').filter(part => part);
    let currentDir = this.#root;

    // Navigate to storage root
    currentDir = await currentDir.getDirectoryHandle(this.name);

    // Create nested directories
    for (const part of pathParts) {
      currentDir = await currentDir.getDirectoryHandle(part, { create: true });
    }

    return currentDir;
  }

  async writeFile(path, data) {
    if (!this.#root) throw new Error('Storage not connected');

    const pathParts = path.split('/').filter(part => part);
    const fileName = pathParts.pop();
    const dirPath = pathParts.join('/');

    // Create directory structure if needed
    let targetDir = await this.#root.getDirectoryHandle(this.name);
    if (dirPath) {
      for (const part of pathParts) {
        targetDir = await targetDir.getDirectoryHandle(part, { create: true });
      }
    }

    // Write file
    const fileHandle = await targetDir.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();

    // Convert objects to JSON
    const content = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;
    await writable.write(content);
    await writable.close();
  }

  async readFile(path) {
    if (!this.#root) throw new Error('Storage not connected');

    const pathParts = path.split('/').filter(part => part);
    const fileName = pathParts.pop();
    const dirPath = pathParts.join('/');

    try {
      // Navigate to directory
      let targetDir = await this.#root.getDirectoryHandle(this.name);
      if (dirPath) {
        for (const part of pathParts) {
          targetDir = await targetDir.getDirectoryHandle(part);
        }
      }

      // Read file
      const fileHandle = await targetDir.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const content = await file.text();

      // Parse JSON if possible
      try {
        return JSON.parse(content);
      } catch {
        return content;
      }
    } catch (error) {
      if (error.name === 'NotFoundError') {
        return null;
      }
      throw error;
    }
  }

  async deleteFile(path) {
    if (!this.#root) throw new Error('Storage not connected');

    const pathParts = path.split('/').filter(part => part);
    const fileName = pathParts.pop();
    const dirPath = pathParts.join('/');

    try {
      // Navigate to directory
      let targetDir = await this.#root.getDirectoryHandle(this.name);
      if (dirPath) {
        for (const part of pathParts) {
          targetDir = await targetDir.getDirectoryHandle(part);
        }
      }

      // Delete file
      await targetDir.removeEntry(fileName);
    } catch (error) {
      if (error.name === 'NotFoundError') {
        // File doesn't exist, consider it already deleted
        return;
      }
      throw error;
    }
  }

  async listFiles(directory) {
    if (!this.#root) throw new Error('Storage not connected');

    const pathParts = directory.split('/').filter(part => part);

    try {
      // Navigate to directory
      let targetDir = await this.#root.getDirectoryHandle(this.name);
      for (const part of pathParts) {
        targetDir = await targetDir.getDirectoryHandle(part);
      }

      // Get list of files
      const files = [];
      for await (const [name, handle] of targetDir.entries()) {
        if (handle.kind === 'file') {
          files.push(name);
        }
      }

      return files;
    } catch (error) {
      if (error.name === 'NotFoundError') {
        return [];
      }
      throw error;
    }
  }
}

export { FileSystemStorage };
