import { Repository } from '../core.js';
import {
  InsertError,
  UpdateError,
  DeleteError,
  QueryError,
  ObjectStoreError,
} from '../errors/index.js';

class IndexedDBRepository extends Repository {
  constructor(database, storeName) {
    super();
    this.db = database;
    this.storeName = storeName;
  }

  insert(record) {
    return this.db.exec(this.storeName, 'readwrite', (store) => {
      const request = store.add(record);
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          reject(new InsertError(
            'Failed to insert record',
            request.error
          ));
        };
      });
    }).catch(error => {
      throw new InsertError('Database insert operation failed', error);
    });
  }

  getAll() {
    return this.db.exec(this.storeName, 'readonly', (store) => {
      const req = store.getAll();
      return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => {
          reject(new QueryError(
            'Failed to retrieve all records',
            req.error
          ));
        };
      });
    }).catch(error => {
      throw new QueryError('Database query operation failed', error);
    });
  }

  get(id) {
    return this.db.exec(this.storeName, 'readonly', (store) => {
      const req = store.get(id);
      return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => {
          reject(new QueryError(
            `Failed to get record with id: ${id}`,
            req.error
          ));
        };
      });
    }).catch(error => {
      throw new QueryError('Database get operation failed', error);
    });
  }

  update(record) {
    return this.db.exec(this.storeName, 'readwrite', (store) => {
      const request = store.put(record);
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          reject(new UpdateError(
            `Failed to update record with id: ${record.id}`,
            request.error
          ));
        };
      });
    }).catch(error => {
      throw new UpdateError('Database update operation failed', error);
    });
  }

  delete(id) {
    return this.db.exec(this.storeName, 'readwrite', (store) => {
      const request = store.delete(id);
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          reject(new DeleteError(
            `Failed to delete record with id: ${id}`,
            request.error
          ));
        };
      });
    }).catch(error => {
      throw new DeleteError('Database delete operation failed', error);
    });
  }
}

export { IndexedDBRepository };
