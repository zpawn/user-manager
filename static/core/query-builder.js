class QueryBuilder {
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
    const allRecords = await this.repository.getAll();
    const filteredRecords = allRecords.filter((record) => (
      this.conditions.every((condition) => {
        const { field, operator, value } = condition;
        const recordValue = record[field];

        switch (operator) {
          case '===':
          case '==':
          case '=':
            return recordValue === value;
          case '!==':
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
            if (typeof recordValue === 'string' && typeof value === 'string') {
              return recordValue.toLowerCase().includes(value.toLowerCase());
            }
            if (Array.isArray(recordValue)) {
              return recordValue.includes(value);
            }
            return false;
          default:
            return true;
        }
      })
    ));

    if (this.sortField) {
      filteredRecords.sort((a, b) => {
        const aValue = a[this.sortField];
        const bValue = b[this.sortField];

        let comparison = 0;
        if (aValue > bValue) comparison = 1;
        if (aValue < bValue) comparison = -1;

        return this.sortDirection === 'desc' ? -comparison : comparison;
      });
    }

    const startIndex = this.offsetCount;
    const endIndex = this.limitCount ? startIndex + this.limitCount : undefined;

    return filteredRecords.slice(startIndex, endIndex);
  }
}

export { QueryBuilder };
