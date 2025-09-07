class StorageAggregateError extends AggregateError {
  constructor(errors, message = 'Multiple storage errors occurred') {
    super(errors, message);
    this.name = 'StorageAggregateError';
  }
}

class ValidationAggregateError extends AggregateError {
  constructor(errors, message = 'Multiple validation errors occurred') {
    super(errors, message);
    this.name = 'ValidationAggregateError';
  }
}

class RepositoryAggregateError extends AggregateError {
  constructor(errors, message = 'Multiple repository errors occurred') {
    super(errors, message);
    this.name = 'RepositoryAggregateError';
  }
}

export {
  StorageAggregateError,
  ValidationAggregateError,
  RepositoryAggregateError,
};