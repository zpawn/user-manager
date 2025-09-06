import { StorageStrategyFactory } from './storage-strategy.js';
import { UnifiedUserService } from './unified-user-service.js';

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

  clear() {
    this.#output.textContent = '';
  }

  static #serialize(x) {
    return typeof x === 'object' ? JSON.stringify(x, null, 2) : x;
  }
}

const logger = new Logger('output');

// Storage management
let currentStrategy = null;
const userService = new UnifiedUserService();

// UI elements
const strategySelect = document.getElementById('storage-strategy');
const strategyIndicator = document.getElementById('strategy-indicator');
const connectionStatus = document.getElementById('connection-status');

// Initialize supported strategies
function initializeStrategyDropdown() {
  const supportedStrategies = StorageStrategyFactory.getSupportedStrategies();
  
  strategySelect.innerHTML = '<option value="">Select Storage Strategy</option>';
  
  supportedStrategies.forEach(strategy => {
    const option = document.createElement('option');
    option.value = strategy.type;
    option.textContent = strategy.name;
    strategySelect.appendChild(option);
  });

  // Load saved strategy preference
  const savedStrategy = localStorage.getItem('preferred-storage-strategy');
  if (savedStrategy && supportedStrategies.some(s => s.type === savedStrategy)) {
    strategySelect.value = savedStrategy;
    switchStrategy(savedStrategy);
  }
}

// Strategy switching
async function switchStrategy(strategyType) {
  try {
    updateConnectionStatus('Connecting...', 'connecting');
    logger.log(`Switching to ${strategyType} strategy...`);
    
    currentStrategy = await StorageStrategyFactory.createStrategy(strategyType);
    userService.setStrategy(currentStrategy);
    
    // Save preference
    localStorage.setItem('preferred-storage-strategy', strategyType);
    
    // Update UI
    updateStrategyIndicator(currentStrategy.getName());
    updateConnectionStatus('Connected', 'connected');
    
    logger.log(`Successfully connected to ${currentStrategy.getName()}`);
  } catch (error) {
    updateConnectionStatus('Error', 'error');
    logger.log(`Error switching strategy: ${error.message}`);
    strategySelect.value = '';
  }
}

// UI updates
function updateStrategyIndicator(strategyName) {
  strategyIndicator.textContent = strategyName;
  strategyIndicator.className = `strategy-indicator ${strategyName.toLowerCase()}`;
}

function updateConnectionStatus(status, className) {
  connectionStatus.textContent = status;
  connectionStatus.className = `connection-status ${className}`;
}

// Event handlers
strategySelect.addEventListener('change', (event) => {
  const selectedStrategy = event.target.value;
  if (selectedStrategy) {
    switchStrategy(selectedStrategy);
  } else {
    currentStrategy = null;
    userService.setStrategy(null);
    updateStrategyIndicator('None');
    updateConnectionStatus('Disconnected', 'disconnected');
    localStorage.removeItem('preferred-storage-strategy');
  }
});

// Utility function for button actions
const action = (id, handler) => {
  const element = document.getElementById(id);
  if (!element) return;
  element.onclick = async () => {
    try {
      if (!currentStrategy) {
        logger.log('Please select a storage strategy first');
        return;
      }
      await handler();
    } catch (error) {
      logger.log(`Error: ${error.message}`);
    }
  };
};

// Button actions
action('add', async () => {
  const name = prompt('Enter user name:');
  if (!name) return;
  const age = parseInt(prompt('Enter age:'), 10);
  if (isNaN(age)) return;
  
  const user = await userService.createUser(name, age);
  logger.log('Added user:', user);
});

action('get', async () => {
  const users = await userService.getAllUsers();
  logger.log('All users:', users);
});

action('update', async () => {
  const idStr = prompt('Enter user ID to update:');
  if (!idStr) return;
  const id = parseInt(idStr, 10);
  
  const user = await userService.incrementAge(id);
  logger.log('Updated user:', user);
});

action('delete', async () => {
  const idStr = prompt('Enter user ID to delete:');
  if (!idStr) return;
  const id = parseInt(idStr, 10);
  
  await userService.deleteUser(id);
  logger.log(`Deleted user with id=${id}`);
});

action('adults', async () => {
  const adults = await userService.findAdults();
  logger.log('Adult users:', adults);
});

action('clear-log', () => {
  logger.clear();
});

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  initializeStrategyDropdown();
  updateStrategyIndicator('None');
  updateConnectionStatus('Disconnected', 'disconnected');
  logger.log('Application initialized. Select a storage strategy to begin.');
});