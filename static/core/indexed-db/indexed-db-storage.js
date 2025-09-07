import {
  IndexedDBError,
  DatabaseConnectionError,
  TransactionError,
} from '../errors/index.js';

class IndexedDBStorage {
  #db;

  constructor(name, version = 1, upgradeCallback) {
    this.name = name;
    this.version = version;
    this.upgradeCallback = upgradeCallback;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.name, this.version);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (this.upgradeCallback) this.upgradeCallback(db);
      };

      request.onsuccess = () => {
        this.#db = request.result;
        resolve();
      };

      request.onerror = () => {
        reject(new DatabaseConnectionError(
          `Failed to connect to database: ${this.name}`,
          request.error
        ));
      };
    });
  }

  transaction(storeName, mode = 'readonly') {
    if (!this.#db) {
      throw new IndexedDBError('Database not connected');
    }
    
    try {
      const tx = this.#db.transaction(storeName, mode);
      return tx.objectStore(storeName);
    } catch (error) {
      throw new TransactionError(
        `Failed to create transaction for store: ${storeName}`,
        error
      );
    }
  }

  exec(storeName, mode, operation) {
    return new Promise((resolve, reject) => {
      if (!this.#db) {
        reject(new IndexedDBError('Database not connected'));
        return;
      }
      
      try {
        const tx = this.#db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const result = operation(store);
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => {
          reject(new TransactionError(
            `Transaction failed for store: ${storeName}`,
            tx.error
          ));
        };
      } catch (err) {
        reject(new TransactionError(
          `Failed to execute operation on store: ${storeName}`,
          err
        ));
      }
    });
  }
}

export { IndexedDBStorage };
