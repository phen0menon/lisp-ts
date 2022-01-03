export class UndefinedSymbolError {
  constructor(symbol: string) {
    const message = `symbol '${symbol}' not found.`;
    const error = Error(message);

    Object.defineProperty(error, 'message', {
      get() {
        return message;
      },
    });

    Object.defineProperty(error, 'name', {
      get() {
        return 'UndefinedSymbolError';
      },
    });

    Error.captureStackTrace(error, UndefinedSymbolError);
    return error;
  }
}

export class SyntaxError {
  constructor(message: string) {
    const error = Error(message);

    Object.defineProperty(error, 'message', {
      get() {
        return message;
      },
    });

    Object.defineProperty(error, 'name', {
      get() {
        return 'SyntaxError';
      },
    });

    Error.captureStackTrace(error, SyntaxError);
    return error;
  }
}
export class OperationError {
  constructor(errMsg: string) {
    const message = `${errMsg}`;
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
