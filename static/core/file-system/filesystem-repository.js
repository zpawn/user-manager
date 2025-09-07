import { Repository } from '../core.js';
import { StorageError, ValidationError } from '../errors.js';

class FileSystemRepository extends Repository {
  constructor(storage, basePath) {
    super();
    this.storage = storage;
    this.basePath = basePath;
  }

  async insert(record) {
    if (!record) {
      throw new ValidationError(
        'Record is required',
        { field: 'record', value: record },
      );
    }
    if (typeof record !== 'object') {
      throw new ValidationError(
        'Record must be an object',
        { field: 'record', value: typeof record },
      );
    }

    try {
      // Generate ID if not present
      if (!record.id) {
        record.id = Date.now();
      }

      const path = `${this.basePath}/${record.id}.json`;
      await this.storage.writeFile(path, record);
      return record;
    } catch (error) {
      throw new StorageError(
        `Failed to insert record with ID: ${record.id}`,
        { cause: error, storageType: 'filesystem', operation: 'insert' },
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
            const filePath = `${this.basePath}/${file}`;
            const user = await this.storage.readFile(filePath);
            if (user) {
              users.push(user);
            }
          } catch (error) {
            console.warn(`Failed to read file ${file}:`, error.message);
          }
        }
      }

      return users;
    } catch (error) {
      throw new StorageError(
        'Failed to retrieve all records',
        { cause: error, storageType: 'filesystem', operation: 'getAll' },
      );
    }
  }

  async get(id) {
    if (!id) {
      throw new ValidationError('ID is required', { field: 'id', value: id });
    }
    if (typeof id !== 'number' && typeof id !== 'string') {
      throw new ValidationError(
        'ID must be a number or string',
        { field: 'id', value: typeof id },
      );
    }

    try {
      const path = `${this.basePath}/${id}.json`;
      return await this.storage.readFile(path);
    } catch (error) {
      throw new StorageError(
        `Failed to get record with ID: ${id}`,
        { cause: error, storageType: 'filesystem', operation: 'get' },
      );
    }
  }

  async update(record) {
    if (!record) {
      throw new ValidationError(
        'Record is required',
        { field: 'record', value: record },
      );
    }
    if (typeof record !== 'object') {
      throw new ValidationError(
        'Record must be an object',
        { field: 'record', value: typeof record },
      );
    }
    if (!record.id) {
      throw new ValidationError(
        'Record ID is required for update',
        { field: 'record.id', value: record.id },
      );
    }

    try {
      const path = `${this.basePath}/${record.id}.json`;
      await this.storage.writeFile(path, record);
      return record;
    } catch (error) {
      throw new StorageError(
        `Failed to update record with ID: ${record.id}`,
        { cause: error, storageType: 'filesystem', operation: 'update' }
      );
    }
  }

  async delete(id) {
    // Simple validation
    if (!id) {
      throw new ValidationError('ID is required', { field: 'id', value: id });
    }
    if (typeof id !== 'number' && typeof id !== 'string') {
      throw new ValidationError(
        'ID must be a number or string',
        { field: 'id', value: typeof id },
      );
    }

    try {
      const path = `${this.basePath}/${id}.json`;
      await this.storage.deleteFile(path);
    } catch (error) {
      throw new StorageError(
        `Failed to delete record with ID: ${id}`,
        { cause: error, storageType: 'filesystem', operation: 'delete' },
      );
    }
  }
}

export { FileSystemRepository };
