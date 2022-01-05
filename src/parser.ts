import {SyntaxError} from './errors';
import {createObject} from './helpers';
import {NodeType, AnyNode} from './types';
import {isNumeric, isSymbol} from './utils';

export const enum Symbols {
  LPAR = '(',
  RPAR = ')',
  SPACE = ' ',
  NSPACE = '',
  CARRETURN = '\r',
  NEWLINE = '\n',
  DQUOTE = '"',
}

export class Parser {
  private position: number;
  private readonly code: string;

  constructor(code: string) {
    this.code = code;
    this.position = 0;
  }

  get length(): number {
    return this.code.length;
  }

  get nextChar(): string {
    return this.code[this.position++];
  }

  get currentChar(): string {
    return this.code[this.position];
  }

  skipChar(): void {
    ++this.position;
  }

  hasNextChar(): boolean {
    return this.position < this.length;
  }

  isChar(char: string): boolean {
    return this.currentChar === char;
  }

  parseList(): AnyNode {
    this.skipChar();
    const list = [];
    while (!this.isChar(Symbols.RPAR)) {
      if (!this.hasNextChar()) {
        throw new SyntaxError(
          `Mismatched input: expected '${Symbols.RPAR}' at the end of the file.`
        );
      }
      list.push(this.parse());
    }
    this.skipChar();
    const object = createObject(NodeType.List, list);
    return object;
  }

  parseString(): AnyNode {
    this.skipChar();
    let string = '';
    while (!this.isChar(Symbols.DQUOTE)) {
      if (!this.hasNextChar()) {
        throw new SyntaxError(
          `Mismatched input: expected '${Symbols.DQUOTE}' at the end of the file.`
        );
      }
      string += this.nextChar;
    }
    this.skipChar();
    const object = createObject(NodeType.String, string);
    return object;
  }

  parseNumber(): AnyNode {
    let value = '';
    while (this.hasNextChar() && isNumeric(this.currentChar)) {
      value += this.nextChar;
    }
    const numericValue = parseInt(value, 10);
    const object = createObject(NodeType.Number, numericValue);
    return object;
  }

  parseSymbol(): AnyNode {
    let symbol = '';
    while (this.hasNextChar() && isSymbol(this.currentChar)) {
      symbol += this.nextChar;
    }
    const object = createObject(NodeType.Symbol, symbol);
    return object;
  }

  parse(): AnyNode {
    switch (this.currentChar) {
      case Symbols.LPAR: {
        return this.parseList();
      }
      case Symbols.SPACE:
      case Symbols.NSPACE:
      case Symbols.CARRETURN:
      case Symbols.NEWLINE: {
        this.skipChar();
        return this.parse();
      }
      case Symbols.DQUOTE: {
        return this.parseString();
      }
      default: {
        if (isNumeric(this.currentChar)) {
          return this.parseNumber();
        }

        if (isSymbol(this.currentChar)) {
          return this.parseSymbol();
        }

        throw new SyntaxError(`Unexpected symbol: ${this.currentChar}`);
      }
    }
  }

  collect(): Array<AnyNode> {
    const lists = [];
    while (this.hasNextChar()) {
      lists.push(this.parse());
    }
    return lists;
  }
}
