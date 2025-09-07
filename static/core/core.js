class Repository {
  getAll() {
    throw new Error('UserRepository.getAll is not implemented');
  }

  get(id) {
    throw new Error('UserRepository.get is not implemented');
  }

  insert(record) {
    throw new Error('UserRepository.insert is not implemented');
  }

  update(record) {
    throw new Error('UserRepository.update is not implemented');
  }

  delete(id) {
    throw new Error('UserRepository.delete is not implemented');
  }
}

class Service {
  constructor(repository) {
    this.repository = repository;
  }
}

export { Repository, Service };
