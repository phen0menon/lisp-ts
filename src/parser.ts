import util from 'util';
import { SyntaxError } from './errors';
import { createNumericObject, createObject, createStringObject } from './helpers';
import {
  Node,
  NodeType,
  AnyNode,
  Symbols,
  InterpreterLocation,
  NodeValueList,
  NodeCallableFlags,
  Context,
} from './types';
import { isNumeric, isSymbol } from './utils';

export function getCursorPos(ctx: Context): InterpreterLocation {
  return { line: ctx.textLine, column: ctx.textColumn };
}

export function getCurrentChar(ctx: Context): string {
  return ctx.text[ctx.textPosition];
}

export function consumeChar(ctx: Context): string {
  ctx.textColumn++;
  return ctx.text[ctx.textPosition++];
}

export function skipChar(ctx: Context): void {
  ctx.textColumn++;
  ctx.textPosition++;
}

export function hasNextChar(ctx: Context): boolean {
  return ctx.textPosition < ctx.textLength;
}

export function gotoNextChar(ctx: Context): void {
  ctx.textColumn++;
  ctx.textPosition++;
}

export function isChar(ctx: Context, char: string): boolean {
  return getCurrentChar(ctx) === char;
}

export function parseList(ctx: Context): Node<NodeValueList> {
  skipChar(ctx);
  const list = [];
  while (!isChar(ctx, Symbols.RPAR)) {
    if (!hasNextChar(ctx)) {
      const cursorPos = getCursorPos(ctx);
      throw new SyntaxError(
        util.format(
          'Mismatched input: expected %s at the end of a list at %i:%i\n%s',
          Symbols.RPAR,
          cursorPos.line,
          cursorPos.column,
          // TODO
          // ctx.cursor.getFileChunk(cursorPos)
          ''
        )
      );
    }
    list.push(parse(ctx));
  }
  skipChar(ctx);
  const object = createObject(NodeType.List, list);
  return object;
}

export function parseListLiteral(ctx: Context): Node<NodeValueList> {
  skipChar(ctx);
  const list = parseList(ctx);
  list.flags |= NodeCallableFlags.Literal;
  return list;
}

export function parseString(ctx: Context): AnyNode {
  skipChar(ctx);
  let string = '';
  while (true) {
    // if this is an escape character
    if (isChar(ctx, '\\')) {
      gotoNextChar(ctx);

      if (!hasNextChar(ctx)) {
        throw new SyntaxError(`Unexpected end of file, escape character expected`);
      }

      switch (getCurrentChar(ctx)) {
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
          string += '\\' + getCurrentChar(ctx);
        }
      }
      gotoNextChar(ctx);
      continue;
    }

    // if this is an end of the string
    if (isChar(ctx, '"')) {
      skipChar(ctx);
      break;
    }

    string += consumeChar(ctx);
  }

  return createStringObject(string);
}

export function parseNumber(ctx: Context): AnyNode {
  let value = '';
  while (hasNextChar(ctx) && isNumeric(getCurrentChar(ctx))) {
    value += consumeChar(ctx);
  }
  const numericValue = parseInt(value, 10);
  const object = createNumericObject(numericValue);
  return object;
}

export function parseSymbol(ctx: Context): AnyNode {
  let symbol = '';
  while (hasNextChar(ctx) && isSymbol(getCurrentChar(ctx))) {
    symbol += consumeChar(ctx);
  }
  const object = createObject(NodeType.Symbol, symbol);
  return object;
}

export function parse(ctx: Context): AnyNode {
  const char = getCurrentChar(ctx);
  switch (char) {
    case Symbols.LPAR: {
      return parseList(ctx);
    }
    case Symbols.CR: {
      skipChar(ctx);
      return parse(ctx);
    }
    case Symbols.LF: {
      ctx.textColumn = 0;
      ctx.textLine++;
    }
    case Symbols.SPACE:
    case Symbols.NSPACE: {
      skipChar(ctx);
      return parse(ctx);
    }
    case Symbols.DQUOTE: {
      return parseString(ctx);
    }
    case Symbols.SQUOTE: {
      return parseListLiteral(ctx);
    }
    default: {
      if (isNumeric(char)) {
        return parseNumber(ctx);
      }

      if (isSymbol(char)) {
        return parseSymbol(ctx);
      }

      throw new SyntaxError(
        util.format(
          'Unexpected symbol: %s at %i:%i\n%s',
          char,
          ctx.textLine,
          ctx.textColumn,
          // TODO:
          // cursor.getFileChunk(cursorPos)
          ''
        )
      );
    }
  }
}

export function collectLists(ctx: Context): Array<AnyNode> {
  const lists = [];
  while (hasNextChar(ctx)) {
    lists.push(parse(ctx));
  }
  return lists;
}
