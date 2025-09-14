import { Service } from '../core/core.js';
import { UserModel } from './user-model.js';
import { ValidationError } from '../core/errors.js';

export class UserService extends Service {
  async createUser(name, age) {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new ValidationError(
        'Name is required and must be a non-empty string',
        { field: 'name', value: name },
      );
    }
    if (age === undefined || age === null ||
        !Number.isInteger(age) || age < 0) {
      throw new ValidationError(
        'Age is required and must be a non-negative integer',
        { field: 'age', value: age },
      );
    }

    try {
      const user = new UserModel(name, age);
      await this.repository.insert(user);
      return user;
    } catch (error) {
      throw new ValidationError('Failed to create user', {
        cause: error,
        operation: 'createUser',
      });
    }
  }

  async incrementAge(id) {
    if (!id) {
      throw new ValidationError(
        'User ID is required',
        { field: 'id', value: id },
      );
    }
    if (typeof id !== 'number' && typeof id !== 'string') {
      throw new ValidationError(
        'User ID must be a number or string',
        { field: 'id', value: typeof id },
      );
    }

    try {
      const user = await this.repository.get(id);
      if (!user) {
        throw new ValidationError(`User with ID ${id} not found`, {
          operation: 'incrementAge',
          userId: id,
        });
      }

      user.age += 1;
      await this.repository.update(user);
      return user;
    } catch (error) {
      throw new ValidationError(
        `Failed to increment age for user with ID: ${id}`,
        { cause: error, operation: 'incrementAge', userId: id },
      );
    }
  }

  async findAdults() {
    try {
      // Use DSL if available (IndexedDB), otherwise fallback to manual filtering
      if (typeof this.repository.select === 'function') {
        return await this.repository
          .select()
          .where('age', '>=', 18)
          .execute();
      } else {
        const users = await this.repository.getAll();
        return users.filter((user) => user.age >= 18);
      }
    } catch (error) {
      throw new ValidationError('Failed to find adult users', {
        cause: error,
        operation: 'findAdults',
      });
    }
  }

  async searchUsers(namePattern) {
    try {
      if (typeof this.repository.select === 'function') {
        return await this.repository
          .select()
          .where('name', 'includes', namePattern)
          .orderBy('name', 'asc')
          .execute();
      } else {
        const users = await this.repository.getAll();
        return users
          .filter(user => user.name.toLowerCase().includes(namePattern.toLowerCase()))
          .sort((a, b) => a.name.localeCompare(b.name));
      }
    } catch (error) {
      throw new ValidationError('Failed to search users', {
        cause: error,
        operation: 'searchUsers',
      });
    }
  }

  async getUsersPaginated(page = 1, pageSize = 5) {
    try {
      const offset = (page - 1) * pageSize;
      
      if (typeof this.repository.select === 'function') {
        return await this.repository
          .select()
          .orderBy('id', 'asc')
          .offset(offset)
          .limit(pageSize)
          .execute();
      } else {
        const users = await this.repository.getAll();
        return users
          .sort((a, b) => a.id - b.id)
          .slice(offset, offset + pageSize);
      }
    } catch (error) {
      throw new ValidationError('Failed to get paginated users', {
        cause: error,
        operation: 'getUsersPaginated',
      });
    }
  }
}
