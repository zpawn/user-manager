import { Service } from '../core/core.js';
import { UserModel } from './user-model.js';

export class UserService extends Service {
  async createUser(name, age) {
    const user = new UserModel(name, age);
    await this.repository.insert(user);
    return user;
  }

  async incrementAge(id) {
    const user = await this.repository.get(id);
    if (!user) throw new Error('User with id=1 not found');
    user.age += 1;
    await this.repository.update(user);
    return user;
  }

  async findAdults() {
    const users = await this.repository.getAll();
    return users.filter((user) => user.age >= 18);
  }
}
