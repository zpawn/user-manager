import { UserModel } from './user.js';

export class UnifiedUserService {
  #strategy = null;

  constructor(strategy = null) {
    this.#strategy = strategy;
  }

  setStrategy(strategy) {
    this.#strategy = strategy;
  }

  getStrategy() {
    return this.#strategy;
  }

  #ensureStrategy() {
    if (!this.#strategy) {
      throw new Error('No storage strategy set');
    }
  }

  async createUser(name, age) {
    this.#ensureStrategy();
    const user = new UserModel(name, age);
    return await this.#strategy.insert(user);
  }

  async getAllUsers() {
    this.#ensureStrategy();
    return await this.#strategy.getAll();
  }

  async getUser(id) {
    this.#ensureStrategy();
    return await this.#strategy.get(id);
  }

  async updateUser(user) {
    this.#ensureStrategy();
    return await this.#strategy.update(user);
  }

  async deleteUser(id) {
    this.#ensureStrategy();
    return await this.#strategy.delete(id);
  }

  async incrementAge(id) {
    this.#ensureStrategy();
    const user = await this.#strategy.get(id);
    if (!user) throw new Error(`User with id=${id} not found`);
    user.age += 1;
    return await this.#strategy.update(user);
  }

  async findAdults() {
    this.#ensureStrategy();
    const users = await this.#strategy.getAll();
    return users.filter((user) => user.age >= 18);
  }

  getStrategyName() {
    return this.#strategy ? this.#strategy.getName() : 'None';
  }
}