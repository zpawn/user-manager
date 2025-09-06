import { FileSystemStorage } from './filesystem-storage.js';

export class FileSystemRepository {
  constructor(storage, basePath = '/users') {
    this.storage = storage;
    this.basePath = basePath;
  }

  async insert(record) {
    // Generate ID if not present
    if (!record.id) {
      record.id = Date.now();
    }
    
    const path = `${this.basePath}/${record.id}.json`;
    await this.storage.writeFile(path, record);
    return record;
  }

  async getAll() {
    const files = await this.storage.listFiles(this.basePath);
    const users = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const user = await this.storage.readFile(`${this.basePath}/${file}`);
        if (user) {
          users.push(user);
        }
      }
    }

    return users;
  }

  async get(id) {
    const path = `${this.basePath}/${id}.json`;
    return await this.storage.readFile(path);
  }

  async update(record) {
    const path = `${this.basePath}/${record.id}.json`;
    await this.storage.writeFile(path, record);
    return record;
  }

  async delete(id) {
    const path = `${this.basePath}/${id}.json`;
    await this.storage.deleteFile(path);
  }
}