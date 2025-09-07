import { Service } from '../core/core.js';
import { UserModel } from './user-model.js';
import {
  UserCreationError,
  UserUpdateError,
  UserNotFoundError,
} from '../core/errors/index.js';

export class UserService extends Service {
  async createUser(name, age) {
    try {
      const user = new UserModel(name, age);
      await this.repository.insert(user);
      return user;
    } catch (error) {
      throw new UserCreationError(
        `Failed to create user: ${name}`,
        error
      );
    }
  }

  async incrementAge(id) {
    try {
      const user = await this.repository.get(id);
      if (!user) {
        throw new UserNotFoundError(`User with id=${id} not found`);
      }
      user.age += 1;
      await this.repository.update(user);
      return user;
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw error;
      }
      throw new UserUpdateError(
        `Failed to increment age for user with id: ${id}`,
        error
      );
    }
  }

  async findAdults() {
    try {
      const users = await this.repository.getAll();
      return users.filter((user) => user.age >= 18);
    } catch (error) {
      throw new UserUpdateError('Failed to find adult users', error);
    }
  }
}
