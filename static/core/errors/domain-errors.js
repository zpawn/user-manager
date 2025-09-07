class DomainError extends Error {
  constructor(message, cause = null) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;
  }
}

class StorageError extends DomainError {}
class ValidationError extends DomainError {}
class UserNotFoundError extends DomainError {}
class FileSystemError extends StorageError {}
class IndexedDBError extends StorageError {}

// Specific FileSystem errors
class FileNotFoundError extends FileSystemError {}
class DirectoryCreationError extends FileSystemError {}
class FileWriteError extends FileSystemError {}
class FileReadError extends FileSystemError {}
class FileDeleteError extends FileSystemError {}

// Specific IndexedDB errors
class DatabaseConnectionError extends IndexedDBError {}
class TransactionError extends IndexedDBError {}
class ObjectStoreError extends IndexedDBError {}

// Repository errors
class RepositoryError extends DomainError {}
class InsertError extends RepositoryError {}
class UpdateError extends RepositoryError {}
class DeleteError extends RepositoryError {}
class QueryError extends RepositoryError {}

// Service errors
class ServiceError extends DomainError {}
class UserCreationError extends ServiceError {}
class UserUpdateError extends ServiceError {}

export {
  DomainError,
  StorageError,
  ValidationError,
  UserNotFoundError,
  FileSystemError,
  IndexedDBError,
  FileNotFoundError,
  DirectoryCreationError,
  FileWriteError,
  FileReadError,
  FileDeleteError,
  DatabaseConnectionError,
  TransactionError,
  ObjectStoreError,
  RepositoryError,
  InsertError,
  UpdateError,
  DeleteError,
  QueryError,
  ServiceError,
  UserCreationError,
  UserUpdateError,
};