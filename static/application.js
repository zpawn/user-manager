import { Database } from './database.js';
import { UserRepository, UserService } from './user.js';
import { FileSystemStorage } from './filesystem-storage.js';
import { FileSystemRepository } from './filesystem-repository.js';
import { FileSystemUserService } from './filesystem-service.js';

class Logger {
  #output;

  constructor(outputId) {
    this.#output = document.getElementById(outputId);
  }

  log(...args) {
    const lines = args.map(Logger.#serialize);
    this.#output.textContent += lines.join(' ') + '\n';
    this.#output.scrollTop = this.#output.scrollHeight;
  }

  reset() {
    this.#output.textContent = '';
  }

  static #serialize(x) {
    return typeof x === 'object' ? JSON.stringify(x, null, 2) : x;
  }
}

const logger = new Logger('output');

const storageTypeSelect = document.getElementById('storage-type');
if (storageTypeSelect) {
  storageTypeSelect.addEventListener('change', () => {
    logger.reset();
    logger.log(`Storage type changed to: ${storageTypeSelect.value}`);
  });
}

const action = (id, handler) => {
  const element = document.getElementById(id);
  if (!element) return;
  element.onclick = () => {
    handler().catch((error) => {
      logger.log(error.message);
    });
  };
};

const db = new Database('UserManager', 1, (db) => {
  if (!db.objectStoreNames.contains('user')) {
    db.createObjectStore('user', { keyPath: 'id', autoIncrement: true });
  }
});
await db.connect();
const userRepository = new UserRepository(db, 'user');
const userService = new UserService(userRepository);

// Initialize FileSystem storage
const fsStorage = new FileSystemStorage('UserManagerFS');
let fsUserRepository = null;
let fsUserService = null;

// Try to initialize FileSystem API
try {
  await fsStorage.connect();
  fsUserRepository = new FileSystemRepository(fsStorage);
  fsUserService = new FileSystemUserService(fsUserRepository);
  logger.log('FileSystem API initialized successfully');
} catch (error) {
  logger.log('FileSystem API not available:', error.message);
}

action('add', async () => {
  const name = prompt('Enter user name:');
  const age = parseInt(prompt('Enter age:'), 10);
  const user = await userService.createUser(name, age);
  logger.log('Added:', user);
});

action('get', async () => {
  const users = await userRepository.getAll();
  logger.log('Users:', users);
});

action('update', async () => {
  const user = await userService.incrementAge(1);
  logger.log('Updated:', user);
});

action('delete', async () => {
  await userRepository.delete(2);
  logger.log('Deleted user with id=2');
});

action('adults', async () => {
  const adults = await userService.findAdults();
  logger.log('Adults:', adults);
});

// FileSystem API actions
action('add-fs', async () => {
  if (!fsUserService) {
    logger.log('FileSystem API not available');
    return;
  }
  const name = prompt('Enter user name:');
  const age = parseInt(prompt('Enter age:'), 10);
  const user = await fsUserService.createUser(name, age);
  logger.log('Added to FileSystem:', user);
});

action('get-fs', async () => {
  if (!fsUserRepository) {
    logger.log('FileSystem API not available');
    return;
  }
  const users = await fsUserRepository.getAll();
  logger.log('Users from FileSystem:', users);
});

action('update-fs', async () => {
  if (!fsUserService) {
    logger.log('FileSystem API not available');
    return;
  }
  const user = await fsUserService.incrementAge(1);
  logger.log('Updated in FileSystem:', user);
});

action('delete-fs', async () => {
  if (!fsUserRepository) {
    logger.log('FileSystem API not available');
    return;
  }
  await fsUserRepository.delete(2);
  logger.log('Deleted user with id=2 from FileSystem');
});

action('adults-fs', async () => {
  if (!fsUserService) {
    logger.log('FileSystem API not available');
    return;
  }
  const adults = await fsUserService.findAdults();
  logger.log('Adults from FileSystem:', adults);
});
