import { Repository } from '../core.js';
import {
  InsertError,
  UpdateError,
  DeleteError,
  QueryError,
  FileNotFoundError,
} from '../errors/index.js';

class FileSystemRepository extends Repository {
  constructor(storage, basePath) {
    super();
    this.storage = storage;
    this.basePath = basePath;
  }

  async insert(record) {
    try {
      // Generate ID if not present
      if (!record.id) {
        record.id = Date.now();
      }

      const path = `${this.basePath}/${record.id}.json`;
      await this.storage.writeFile(path, record);
      return record;
    } catch (error) {
      throw new InsertError(
        `Failed to insert record with id: ${record.id}`,
        error
      );
    }
  }

  async getAll() {
    try {
      const files = await this.storage.listFiles(this.basePath);
      const users = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const user = await this.storage.readFile(`${this.basePath}/${file}`);
            if (user) {
              users.push(user);
            }
          } catch (error) {
            // Skip files that can't be read, but log the error
            console.warn(`Failed to read file ${file}:`, error);
          }
        }
      }

      return users;
    } catch (error) {
      throw new QueryError('Failed to retrieve all records', error);
    }
  }

  async get(id) {
    try {
      const path = `${this.basePath}/${id}.json`;
      return await this.storage.readFile(path);
    } catch (error) {
      if (error instanceof FileNotFoundError) {
        return null; // Return null for not found, don't throw
      }
      throw new QueryError(`Failed to get record with id: ${id}`, error);
    }
  }

  async update(record) {
    try {
      const path = `${this.basePath}/${record.id}.json`;
      await this.storage.writeFile(path, record);
      return record;
    } catch (error) {
      throw new UpdateError(
        `Failed to update record with id: ${record.id}`,
        error
      );
    }
  }

  async delete(id) {
    try {
      const path = `${this.basePath}/${id}.json`;
      await this.storage.deleteFile(path);
    } catch (error) {
      throw new DeleteError(`Failed to delete record with id: ${id}`, error);
    }
  }
}

export { FileSystemRepository };
