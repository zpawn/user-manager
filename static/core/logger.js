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

  logError(error) {
    this.log('❌ ERROR:', error.name || 'Error');
    this.log('Message:', error.message);
    
    if (error.cause) {
      this.log('Caused by:', error.cause.name || 'Error');
      this.log('Cause message:', error.cause.message);
      if (error.cause.stack) {
        this.log('Cause stack:', error.cause.stack);
      }
    }
    
    if (error instanceof AggregateError) {
      this.log('Aggregate errors:');
      error.errors.forEach((err, index) => {
        this.log(`  ${index + 1}. ${err.name}: ${err.message}`);
        if (err.cause) {
          this.log(`     Caused by: ${err.cause.message}`);
        }
      });
    }
    
    if (error.stack) {
      this.log('Stack trace:', error.stack);
    }
    
    this.log('---');
  }

  reset() {
    this.#output.textContent = '';
  }

  static #serialize(x) {
    return typeof x === 'object' ? JSON.stringify(x, null, 2) : x;
  }
}

export { Logger };
