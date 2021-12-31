import {readFileSync} from 'fs';
import {OperationError, UndefinedSymbolError} from './errors';
import {
  Node,
  NodeType,
  NodeValue,
  NodeValueList,
  NodeBuiltinEval,
  NodeCallableFlags,
} from './types';
import {isNumeric, isSymbol} from './utils';

const parserData = {
  code: '',
  cursorPos: 0,
};

function getNextChar(): string {
  return parserData.code[++parserData.cursorPos];
}

function skipCurrentChar(): void {
  ++parserData.cursorPos;
}

function hasNextChar(): boolean {
  return parserData.cursorPos < parserData.code.length;
}

function getCurrentChar(): string {
  return parserData.code[parserData.cursorPos] || '';
}

function isChar(char: string) {
  return getCurrentChar() === char;
}

function createObject(type: NodeType, val: NodeValue): Node {
  return {type, val, flags: NodeCallableFlags.Null};
}

function createBuiltinObject(handler: NodeBuiltinEval) {
  return {type: NodeType.Symbol, flags: NodeCallableFlags.Builtin, val: handler};
}

function readList(): Node {
  skipCurrentChar();
  const list = [];
  while (!isChar(')')) {
    if (!hasNextChar()) {
      throw Error('SyntaxError: unexpected end of file');
    }
    list.push(readExpression());
  }
  skipCurrentChar();
  const object = createObject(NodeType.List, list);
  return object;
}

function readString(): Node {
  skipCurrentChar();
  let string = '';
  let char = getCurrentChar();
  while (!isChar('"')) {
    if (!hasNextChar()) {
      throw Error('SyntaxError: unexpected end of file');
    }
    string += char;
    char = getNextChar();
  }
  skipCurrentChar();
  const object = createObject(NodeType.String, string);
  return object;
}

function readNumber(): Node {
  let char = getCurrentChar();
  let value = '';
  while (hasNextChar() && isNumeric(char)) {
    value += char;
    char = getNextChar();
  }
  const numericValue = parseInt(value, 10);
  const object = createObject(NodeType.Number, numericValue);
  return object;
}

function readSymbol(): Node {
  let symbol = '';
  let char = getCurrentChar();
  while (hasNextChar() && isSymbol(char)) {
    symbol += char;
    char = getNextChar();
  }
  const object = createObject(NodeType.Symbol, symbol);
  return object;
}

function readExpression(): Node {
  const char = getCurrentChar();

  switch (char) {
    case '(': {
      return readList();
    }
    case ' ':
    case '':
    case '\r':
    case '\n': {
      skipCurrentChar();
      return readExpression();
    }
    case '"': {
      return readString();
    }
    default: {
      if (isNumeric(char)) {
        return readNumber();
      } else if (isSymbol(char)) {
        return readSymbol();
      }
      console.error('Undefined symbol!');
    }
  }
}

const symtable = new Map<string, Node>();
symtable.set('+', createBuiltinObject(handleBuiltinAddOperator));
symtable.set('-', createBuiltinObject(handleBuiltinSubOperator));
symtable.set('*', createBuiltinObject(handleBuiltinMultOperator));
symtable.set('/', createBuiltinObject(handleBuiltinDivOperator));
symtable.set('%', createBuiltinObject(handleBuiltinModOperator));
symtable.set('setq', createBuiltinObject(handleBuiltinSetq));
symtable.set('print', createBuiltinObject(handleBuiltinPrint));

function assertIsInSymtable(symbol: Node) {
  if (!symtable.has(symbol.val.toString())) {
    throw new UndefinedSymbolError(symbol.val.toString());
  }
}

function getSumObjects(aObject: Node, bObject: Node): Node {
  if (aObject.type !== NodeType.Number)
    throw new OperationError(`1st argument: cannot accept object of type ${aObject.type}`);

  if (bObject.type !== NodeType.Number)
    throw new OperationError(`2nd argument: cannot accept object of type ${bObject.type}`);

  const result = (aObject.val as number) + (bObject.val as number);
  return createObject(NodeType.Number, result);
}

function getSubObjects(aObject: Node, bObject: Node): Node {
  if (aObject.type !== NodeType.Number)
    throw new OperationError(`1st argument: cannot accept object of type ${aObject.type}`);

  if (bObject.type !== NodeType.Number)
    throw new OperationError(`2nd argument: cannot accept object of type ${bObject.type}`);

  const result = (aObject.val as number) - (bObject.val as number);
  return createObject(NodeType.Number, result);
}

function getMultObjects(aObject: Node, bObject: Node): Node {
  if (aObject.type !== NodeType.Number)
    throw new OperationError(`1st argument: cannot accept object of type ${aObject.type}`);

  if (bObject.type !== NodeType.Number)
    throw new OperationError(`2nd argument: cannot accept object of type ${bObject.type}`);

  const result = (aObject.val as number) * (bObject.val as number);
  return createObject(NodeType.Number, result);
}

function getDivObjects(aObject: Node, bObject: Node): Node {
  if (aObject.type !== NodeType.Number)
    throw new OperationError(`1st argument: cannot accept object of type ${aObject.type}`);

  if (bObject.type !== NodeType.Number)
    throw new OperationError(`2nd argument: cannot accept object of type ${bObject.type}`);

  const result = (aObject.val as number) / (bObject.val as number);
  return createObject(NodeType.Number, result);
}

function getModObjects(aObject: Node, bObject: Node): Node {
  if (aObject.type !== NodeType.Number)
    throw new OperationError(`1st argument: cannot accept object of type ${aObject.type}`);

  if (bObject.type !== NodeType.Number)
    throw new OperationError(`2nd argument: cannot accept object of type ${bObject.type}`);

  const result = (aObject.val as number) % (bObject.val as number);
  return createObject(NodeType.Number, result);
}

function makeStringObject(o: Node) {
  switch (o.type) {
    case NodeType.String:
      return o;
    case NodeType.Number:
      return createObject(NodeType.String, o.val.toString());
    default:
      return null;
  }
}

function handleBuiltinAddOperator(expr: Node): Node {
  const list = expr.val as NodeValueList;
  const argLen = list.length - 1;

  if (argLen < 2) {
    throw new OperationError("Add operator can't have less than 2 args");
  }

  let result = evalExpression(list[1]);
  let argumentIndex = 2;
  while (argumentIndex < list.length) {
    const operand = evalExpression(list[argumentIndex++]);
    result = getSumObjects(result, operand);
  }
  return result;
}

function handleBuiltinMultOperator(expr: Node): Node {
  const list = expr.val as NodeValueList;
  const argLen = list.length - 1;

  if (argLen < 2) {
    throw new OperationError("Multiplication operator can't have less than 2 args");
  }

  let result = evalExpression(list[1]);
  let argumentIndex = 2;
  while (argumentIndex < list.length) {
    const operand = evalExpression(list[argumentIndex++]);
    result = getMultObjects(result, operand);
  }
  return result;
}

function handleBuiltinDivOperator(expr: Node): Node {
  const list = expr.val as NodeValueList;
  const argLen = list.length - 1;

  if (argLen < 2) {
    throw new OperationError("Division operator can't have less than 2 args");
  }

  let result = evalExpression(list[1]);
  let argumentIndex = 2;
  while (argumentIndex < list.length) {
    const operand = evalExpression(list[argumentIndex++]);
    result = getDivObjects(result, operand);
  }
  return result;
}

function handleBuiltinSetq(expr: Node): Node {
  const list = expr.val as NodeValueList;
  const argsLen = list.length - 1;
  if (argsLen < 2)
    throw new OperationError(`Setq takes exactly 2 arguments, but ${argsLen} presented`);
  const symname = list[1];
  const symval = evalExpression(list[2]);
  symtable.set(symname.val.toString(), symval);
  return null;
}

function handleBuiltinPrint(expr: Node): Node {
  const list = expr.val as NodeValueList;
  let argumentIndex = 1;
  while (argumentIndex < list.length) {
    const argument = evalExpression(list[argumentIndex++]);
    const strObj = makeStringObject(argument);
    console.log(strObj.val);
  }
  console.log('');
  return null;
}

function handleBuiltinSubOperator(expr: Node): Node {
  const list = expr.val as NodeValueList;
  const argLen = list.length - 1;

  if (argLen < 2) throw new OperationError("Sub operator can't have less than 2 args");

  let result = evalExpression(list[1]);
  let argumentIndex = 2;
  while (argumentIndex < list.length) {
    const operand = evalExpression(list[argumentIndex++]);
    result = getSubObjects(result, operand);
  }
  return result;
}

function handleBuiltinModOperator(expr: Node): Node {
  const list = expr.val as NodeValueList;
  const argLen = list.length - 1;

  if (argLen < 2) throw new OperationError("Modulo operator can't have less than 2 args");

  let result = evalExpression(list[1]);
  let argumentIndex = 2;
  while (argumentIndex < list.length) {
    const operand = evalExpression(list[argumentIndex++]);
    result = getModObjects(result, operand);
  }
  return result;
}

function evalExpression(expr: Node): Node {
  try {
    switch (expr.type) {
      case NodeType.Number:
        return expr;
      case NodeType.String:
        return expr;
      case NodeType.Symbol: {
        assertIsInSymtable(expr);
        return symtable.get(expr.val.toString());
      }
      case NodeType.List: {
        const list = expr.val as NodeValueList;
        if (!list.length) return expr;
        const operand = list[0];
        assertIsInSymtable(operand);
        const callable = symtable.get(operand.val.toString());
        const isBuiltin = callable.flags === NodeCallableFlags.Builtin;
        if (isBuiltin) {
          const evalBuiltin = callable.val as NodeBuiltinEval;
          return evalBuiltin(expr);
        }
        return null;
      }
      default: {
        console.error('Unknown expression');
        return expr;
      }
    }
  } catch (err) {
    if (err instanceof UndefinedSymbolError) {
      return null;
    }
  }
}

function parse(): void {
  while (hasNextChar()) {
    const expr = readExpression();
    evalExpression(expr);
  }
}

function main(): void {
  parserData.code = readFileSync('./examples/basic.lisp', 'utf8');
  parse();
}

if (require.main === module) {
  main();
}
