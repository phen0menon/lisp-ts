export class UndefinedSymbolError extends Error {
  constructor(symbol: string) {
    const message = `symbol '${symbol}' not found.`;
    super(message);
    this.name = this.constructor.name;
  }
}

export class SyntaxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
export class OperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
