import util from 'util';

import {Cursor} from './cursor';
import {SyntaxError} from './errors';
import {createNumericObject, createObject, createStringObject} from './helpers';
import {NodeType, AnyNode, Symbols, InterpreterLocation} from './types';
import {isNumeric, isSymbol} from './utils';

export class Parser {
  private position: number = 0;
  private line: number = 0;
  private column: number = 0;

  constructor(private readonly code: string, private readonly cursor: Cursor) {}

  get length(): number {
    return this.code.length;
  }

  get currentChar(): string {
    return this.code[this.position];
  }

  get cursorPos(): InterpreterLocation {
    return {line: this.line, column: this.column};
  }

  consumeChar(): string {
    this.column++;
    return this.code[this.position++];
  }

  skipChar(): void {
    this.column++;
    this.position++;
  }

  hasNextChar(): boolean {
    return this.position < this.length;
  }

  gotoNextChar(): void {
    this.column++;
    this.position++;
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
          util.format(
            'Mismatched input: expected %s at the end of a list at %i:%i\n%s',
            Symbols.RPAR,
            this.cursorPos.line,
            this.cursorPos.column,
            this.cursor.getFileChunk(this.cursorPos)
          )
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
    while (true) {
      // if this is an escape character
      if (this.isChar('\\')) {
        this.gotoNextChar();

        if (!this.hasNextChar()) {
          throw new SyntaxError(`Unexpected end of file, escape character expected`);
        }

        switch (this.currentChar) {
          case 'r': {
            string += '\r';
            break;
          }
          case 'n': {
            string += '\n';
            break;
          }
          case 't': {
            string += '\t';
            break;
          }
          case '0': {
            string += '\0';
            break;
          }
          default: {
            string += '\\' + this.currentChar;
          }
        }
        this.gotoNextChar();
        continue;
      }

      // if this is an end of the string
      if (this.isChar('"')) {
        this.skipChar();
        break;
      }

      string += this.consumeChar();
    }

    return createStringObject(string);
  }

  parseNumber(): AnyNode {
    let value = '';
    while (this.hasNextChar() && isNumeric(this.currentChar)) {
      value += this.consumeChar();
    }
    const numericValue = parseInt(value, 10);
    const object = createNumericObject(numericValue);
    return object;
  }

  parseSymbol(): AnyNode {
    let symbol = '';
    while (this.hasNextChar() && isSymbol(this.currentChar)) {
      symbol += this.consumeChar();
    }
    const object = createObject(NodeType.Symbol, symbol);
    return object;
  }

  parse(): AnyNode {
    switch (this.currentChar) {
      case Symbols.LPAR: {
        return this.parseList();
      }
      case Symbols.CR: {
        this.skipChar();
        return this.parse();
      }
      case Symbols.LF: {
        this.column = 0;
        this.line++;
      }
      case Symbols.SPACE:
      case Symbols.NSPACE: {
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

        throw new SyntaxError(
          util.format(
            'Unexpected symbol: %s at %i:%i\n%s',
            this.currentChar,
            this.line,
            this.column,
            this.cursor.getFileChunk(this.cursorPos)
          )
        );
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
