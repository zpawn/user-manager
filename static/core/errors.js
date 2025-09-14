export class DomainError extends Error {
  constructor(message, cause, context = {}) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

export class ValidationError extends DomainError {
  constructor(message, options = {}) {
    const {
      cause = null,
      field = null,
      value = null,
      operation = null,
      userId = null,
    } = options;
    super(message, cause, { field, value, operation, userId });
    this.field = field;
    this.value = value;
    this.operation = operation;
    this.userId = userId;
  }
}

export class StorageError extends DomainError {
  constructor(message, options = {}) {
    const { cause = null, storageType = null, operation = null } = options;
    super(message, cause, { storageType, operation });
    this.storageType = storageType;
    this.operation = operation;
  }
}

export class FileSystemError extends DomainError {
  constructor(message, options = {}) {
    const { cause = null, path = null, operation = null } = options;
    super(message, cause, { path, operation });
    this.path = path;
    this.operation = operation;
  }
}

export class IndexedDBError extends DomainError {
  constructor(message, options = {}) {
    const { cause = null, storeName = null, operation = null } = options;
    super(message, cause, { storeName, operation });
    this.storeName = storeName;
    this.operation = operation;
  }
}
