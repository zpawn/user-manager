class IndexedDBQueryBuilder {
  constructor(repository) {
    this.repository = repository;
    this.conditions = [];
    this.sortField = null;
    this.sortDirection = 'asc';
    this.limitCount = null;
    this.offsetCount = 0;
  }

  where(field, operator, value) {
    this.conditions.push({ field, operator, value });
    return this;
  }

  orderBy(field, direction = 'asc') {
    this.sortField = field;
    this.sortDirection = direction;
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  offset(count) {
    this.offsetCount = count;
    return this;
  }

  async execute() {
    try {
      // Get all records first (IndexedDB doesn't support complex queries natively)
      const allRecords = await this.repository.getAll();
      
      // Apply filtering
      let filteredRecords = this._applyFilters(allRecords);
      
      // Apply sorting
      if (this.sortField) {
        filteredRecords = this._applySorting(filteredRecords);
      }
      
      // Apply pagination
      const startIndex = this.offsetCount;
      const endIndex = this.limitCount 
        ? startIndex + this.limitCount 
        : filteredRecords.length;
      
      return filteredRecords.slice(startIndex, endIndex);
    } catch (error) {
      const { QueryError } = await import('../errors/index.js');
      throw new QueryError('Failed to execute query', { cause: error });
    }
  }

  _applyFilters(records) {
    return records.filter(record => {
      return this.conditions.every(condition => {
        const { field, operator, value } = condition;
        const recordValue = record[field];
        
        switch (operator) {
          case '==':
          case '=':
            return recordValue === value;
          case '!=':
            return recordValue !== value;
          case '>':
            return recordValue > value;
          case '<':
            return recordValue < value;
          case '>=':
            return recordValue >= value;
          case '<=':
            return recordValue <= value;
          case 'includes':
            if (typeof recordValue === 'string') {
              return recordValue.toLowerCase().includes(value.toLowerCase());
            }
            if (Array.isArray(recordValue)) {
              return recordValue.includes(value);
            }
            return false;
          default:
            throw new Error(`Unsupported operator: ${operator}`);
        }
      });
    });
  }

  _applySorting(records) {
    return records.sort((a, b) => {
      const aValue = a[this.sortField];
      const bValue = b[this.sortField];
      
      let comparison = 0;
      
      if (aValue < bValue) {
        comparison = -1;
      } else if (aValue > bValue) {
        comparison = 1;
      }
      
      return this.sortDirection === 'desc' ? -comparison : comparison;
    });
  }
}

export { IndexedDBQueryBuilder };