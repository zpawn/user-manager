import { ValidationError, ValidationAggregateError } from '../core/errors/index.js';

class UserModel {
  constructor(name, age) {
    const errors = [];
    
    if (typeof name !== 'string' || name.trim().length === 0) {
      errors.push(new ValidationError('Name must be a non-empty string'));
    }
    if (!Number.isInteger(age) || age < 0) {
      errors.push(new ValidationError('Age must be a non-negative integer'));
    }
    
    if (errors.length > 0) {
      if (errors.length === 1) {
        throw errors[0];
      } else {
        throw new ValidationAggregateError(errors, 'User validation failed');
      }
    }
    
    this.name = name.trim();
    this.age = age;
  }
}

export { UserModel };
