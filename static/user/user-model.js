class UserModel {
  constructor(name, age) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Invalid name');
    }
    if (!Number.isInteger(age) || age < 0) {
      throw new Error('Invalid age');
    }
    this.name = name.trim();
    this.age = age;
  }
}

export { UserModel };
