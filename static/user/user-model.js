import { ValidationError } from '../core/index.js';

class UserModel {
  constructor(name, age) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new ValidationError('Invalid name', { field: 'name', value: name });
    }
    if (!Number.isInteger(age) || age < 0) {
      throw new ValidationError('Invalid age', { field: 'age', value: age });
    }
    this.name = name.trim();
    this.age = age;
  }
}

export { UserModel };
