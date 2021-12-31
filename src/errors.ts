export class UndefinedSymbolError {
  constructor(symbol: string) {
    const message = `UndefinedSymbolError: symbol '${symbol}' not found.`;
    const error = Error(message);

    Object.defineProperty(error, 'message', {
      get() {
        return symbol;
      },
    });

    Object.defineProperty(error, 'name', {
      get() {
        return 'OperationError';
      },
    });

    Error.captureStackTrace(error, UndefinedSymbolError);
    return error;
  }
}

export class OperationError {
  constructor(errMsg: string) {
    const message = `OperationError: ${errMsg}`;
    const error = Error(message);

    Object.defineProperty(error, 'message', {
      get() {
        return message;
      },
    });

    Object.defineProperty(error, 'name', {
      get() {
        return 'OperationError';
      },
    });

    Error.captureStackTrace(error, OperationError);
    return error;
  }
}
