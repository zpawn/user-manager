import {
  Logger,
  IndexedDBStorage,
  IndexedDBRepository,
  FileSystemStorage,
  FileSystemRepository,
} from './core/index.js';
import { UserService } from './user/index.js';

const logger = new Logger('output');

function handleError(error, operation) {
  console.error(`Error in ${operation}:`, { error, typeof: typeof error });
}

const strategies = {
  indexeddb: async () => {
    try {
      const db = new IndexedDBStorage('UserManager', 1, (db) => {
        if (!db.objectStoreNames.contains('user')) {
          db.createObjectStore('user', { keyPath: 'id', autoIncrement: true });
        }
      });
      await db.connect();
      const userRepository = new IndexedDBRepository(db, 'user');
      return userRepository;
    } catch (error) {
      handleError(error, 'IndexedDB initialization');
      throw error;
    }
  },
  opfs: async () => {
    try {
      const fsStorage = new FileSystemStorage('UserManagerFS');
      await fsStorage.connect();
      const userRepository = new FileSystemRepository(fsStorage, 'user');
      return userRepository;
    } catch (error) {
      handleError(error, 'OPFS initialization');
      throw error;
    }
  },
};

let userRepository;
let userService;

const storageTypeSelect = document.getElementById('storage-type');
if (storageTypeSelect) {
  storageTypeSelect.addEventListener('change', async () => {
    logger.reset();

    const storageType = storageTypeSelect.value || 'indexeddb';
    userRepository = await strategies[storageType]();
    userService = new UserService(userRepository);

    logger.log(`Storage type changed to: ${storageTypeSelect.value}`);
  });
}

const action = (id, handler) => {
  const element = document.getElementById(id);
  if (!element) return;
  element.onclick = () => {
    handler().catch((error) => {
      handleError(error, id);
    });
  };
};

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

action('search', async () => {
  const users = await unifiedUserService.searchUsers('a');
  logger.log('Users with "a" in name:', users);
});

action('paginated', async () => {
  const users = await unifiedUserService.getUsersPaginated(1, 5);
  logger.log('Page 1 (5 users):', users);
});

action('dsl-demo', async () => {
  try {
    const results = await unifiedUserService.demonstrateDSL();
    logger.log('DSL Demo - Adults with "a" in name (limit 3):', results);
  } catch (error) {
    logger.log('DSL Demo Error:', error.message);
  }
});
