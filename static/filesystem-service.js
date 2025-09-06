import { UserModel } from './user.js';

export class FileSystemUserService {
  constructor(repository) {
    this.repository = repository;
  }

  async createUser(name, age) {
    const user = new UserModel(name, age);
    // Add ID for filesystem storage
    user.id = Date.now();
    await this.repository.insert(user);
    return user;
  }

  async incrementAge(id) {
    const user = await this.repository.get(id);
    if (!user) throw new Error(`User with id=${id} not found`);
    user.age += 1;
    await this.repository.update(user);
    return user;
  }

  async findAdults() {
    const users = await this.repository.getAll();
    return users.filter((user) => user.age >= 18);
  }
}