import {
  Logger,
  IndexedDBStorage,
  IndexedDBRepository,
  FileSystemStorage,
  FileSystemRepository,
} from './core/index.js';
import { UserService } from './user/index.js';

const logger = new Logger('output');

const storageTypeSelect = document.getElementById('storage-type');
if (storageTypeSelect) {
  storageTypeSelect.addEventListener('change', () => {
    logger.reset();
    logger.log(`Storage type changed to: ${storageTypeSelect.value}`);
  });
}

const strategies = {
  indexeddb: async () => {
    const db = new IndexedDBStorage('UserManager', 1, (db) => {
      if (!db.objectStoreNames.contains('user')) {
        db.createObjectStore('user', { keyPath: 'id', autoIncrement: true });
      }
    });
    await db.connect();
    const userRepository = new IndexedDBRepository(db, 'user');
    return userRepository;
  },
  opfs: async () => {
    const fsStorage = new FileSystemStorage('UserManagerFS');
    await fsStorage.connect();
    const userRepository = new FileSystemRepository(fsStorage, 'user');
    return userRepository;
  },
};

const action = (id, handler) => {
  const element = document.getElementById(id);
  if (!element) return;
  element.onclick = () => {
    handler().catch((error) => {
      logger.log(error.message);
    });
  };
};

const userRepository = await strategies[storageTypeSelect.value || 'indexeddb']();
const userService = new UserService(userRepository);

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
  const name = prompt('Enter user name:');
  const age = parseInt(prompt('Enter age:'), 10);
  const user = await userService.createUser(name, age);
  logger.log('Added to FileSystem:', user);
});

action('get-fs', async () => {
  const users = await userRepository.getAll();
  logger.log('Users from FileSystem:', users);
});

action('update-fs', async () => {
  const user = await userService.incrementAge(1);
  logger.log('Updated in FileSystem:', user);
});

action('delete-fs', async () => {
  await userRepository.delete(2);
  logger.log('Deleted user with id=2 from FileSystem');
});

action('adults-fs', async () => {
  const adults = await userService.findAdults();
  logger.log('Adults from FileSystem:', adults);
});
