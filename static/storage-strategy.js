// Abstract Storage Strategy
export class StorageStrategy {
  async connect() {
    throw new Error('connect() method must be implemented');
  }

  async insert(record) {
    throw new Error('insert() method must be implemented');
  }

  async getAll() {
    throw new Error('getAll() method must be implemented');
  }

  async get(id) {
    throw new Error('get() method must be implemented');
  }

  async update(record) {
    throw new Error('update() method must be implemented');
  }

  async delete(id) {
    throw new Error('delete() method must be implemented');
  }

  getName() {
    throw new Error('getName() method must be implemented');
  }

  isSupported() {
    return true;
  }
}

// IndexedDB Strategy
export class IndexedDBStrategy extends StorageStrategy {
  constructor() {
    super();
    this.db = null;
    this.repository = null;
  }

  async connect() {
    const { Database } = await import('./database.js');
    const { UserRepository } = await import('./user.js');
    
    this.db = new Database('UserManager', 1, (db) => {
      if (!db.objectStoreNames.contains('user')) {
        db.createObjectStore('user', { keyPath: 'id', autoIncrement: true });
      }
    });
    
    await this.db.connect();
    this.repository = new UserRepository(this.db);
  }

  async insert(record) {
    return await this.repository.insert(record);
  }

  async getAll() {
    return await this.repository.getAll();
  }

  async get(id) {
    return await this.repository.get(id);
  }

  async update(record) {
    return await this.repository.update(record);
  }

  async delete(id) {
    return await this.repository.delete(id);
  }

  getName() {
    return 'IndexedDB';
  }

  isSupported() {
    return typeof indexedDB !== 'undefined';
  }
}

// OPFS Strategy
export class OPFSStrategy extends StorageStrategy {
  constructor() {
    super();
    this.storage = null;
    this.repository = null;
  }

  async connect() {
    const { FileSystemStorage } = await import('./filesystem-storage.js');
    const { FileSystemRepository } = await import('./filesystem-repository.js');
    
    this.storage = new FileSystemStorage('UserManagerFS');
    await this.storage.connect();
    this.repository = new FileSystemRepository(this.storage);
  }

  async insert(record) {
    // Generate ID if not present for OPFS
    if (!record.id) {
      record.id = Date.now();
    }
    return await this.repository.insert(record);
  }

  async getAll() {
    return await this.repository.getAll();
  }

  async get(id) {
    return await this.repository.get(id);
  }

  async update(record) {
    return await this.repository.update(record);
  }

  async delete(id) {
    return await this.repository.delete(id);
  }

  getName() {
    return 'OPFS';
  }

  isSupported() {
    return typeof navigator !== 'undefined' && 
           navigator.storage && 
           navigator.storage.getDirectory;
  }
}

// Storage Strategy Factory
export class StorageStrategyFactory {
  static async createStrategy(type) {
    let strategy;
    
    switch (type) {
      case 'indexeddb':
        strategy = new IndexedDBStrategy();
        break;
      case 'opfs':
        strategy = new OPFSStrategy();
        break;
      default:
        throw new Error(`Unknown storage strategy: ${type}`);
    }

    if (!strategy.isSupported()) {
      throw new Error(`${strategy.getName()} is not supported in this browser`);
    }

    await strategy.connect();
    return strategy;
  }

  static getSupportedStrategies() {
    const strategies = [];
    
    const indexedDBStrategy = new IndexedDBStrategy();
    if (indexedDBStrategy.isSupported()) {
      strategies.push({ type: 'indexeddb', name: indexedDBStrategy.getName() });
    }

    const opfsStrategy = new OPFSStrategy();
    if (opfsStrategy.isSupported()) {
      strategies.push({ type: 'opfs', name: opfsStrategy.getName() });
    }

    return strategies;
  }
}