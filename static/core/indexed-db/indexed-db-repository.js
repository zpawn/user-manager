import { Repository, StorageError, ValidationError } from '../index.js';
import { QueryBuilder } from './query-builder.js';

class IndexedDBRepository extends Repository {
  constructor(database, storeName) {
    super();
    this.db = database;
    this.storeName = storeName;
  }

  select() {
    return new QueryBuilder(this);
  }

  insert(record) {
    return this.db.exec(this.storeName, 'readwrite', (store) =>
      store.add(record),
    );
  }

  getAll() {
    return this.db.exec(this.storeName, 'readonly', (store) => {
      const req = store.getAll();
      return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(
          new StorageError('Failed to retrieve all records', {
            cause: req.error,
            storageType: 'indexeddb',
            operation: 'getAll',
          }),
        );
      });
    });
  }

  get(id) {
    if (!id) {
      throw new ValidationError('ID is required', { field: 'id', value: id });
    }

    return this.db.exec(this.storeName, 'readonly', (store) => {
      const req = store.get(id);
      return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(
          new StorageError('Failed to retrieve record', {
            cause: req.error,
            storageType: 'indexeddb',
            operation: 'get',
          }),
        );
      });
    });
  }

  update(record) {
    return this.db.exec(this.storeName, 'readwrite', (store) =>
      store.put(record),
    );
  }

  delete(id) {
    if (!id) {
      throw new ValidationError('ID is required', { field: 'id', value: id });
    }

    return this.db.exec(this.storeName, 'readwrite', (store) =>
      store.delete(id),
    );
  }
}

export { IndexedDBRepository };
