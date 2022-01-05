import {OperationError} from './errors';
import {evalExpression} from './eval';
import {createObject, createFuncObject, makeStringObject} from './helpers';
import {Scope} from './scope';
import {Node, NodeType, NodeValueList} from './types';

export function getSumTwoNumeric(aObject: Node, bObject: Node): Node {
  const a = aObject.type === NodeType.List ? evalExpression(aObject) : aObject;
  const b = bObject.type === NodeType.List ? evalExpression(bObject) : bObject;

  if (a.type !== NodeType.Number) {
    throw new OperationError(`1st argument: cannot accept object of type ${a.type}`);
  }

  if (b.type !== NodeType.Number) {
    throw new OperationError(`2nd argument: cannot accept object of type ${b.type}`);
  }

  const result = (a.val as number) + (b.val as number);
  return createObject(NodeType.Number, result);
}

export function getSubTwoNumeric(aObject: Node, bObject: Node): Node {
  const a = aObject.type === NodeType.List ? evalExpression(aObject) : aObject;
  const b = bObject.type === NodeType.List ? evalExpression(bObject) : bObject;

  if (a.type !== NodeType.Number) {
    throw new OperationError(`1st argument: cannot accept object of type ${a.type}`);
  }

  if (b.type !== NodeType.Number) {
    throw new OperationError(`2nd argument: cannot accept object of type ${b.type}`);
  }

  const result = (a.val as number) - (b.val as number);
  return createObject(NodeType.Number, result);
}

export function getMultTwoNumeric(aObject: Node, bObject: Node): Node {
  const a = aObject.type === NodeType.List ? evalExpression(aObject) : aObject;
  const b = bObject.type === NodeType.List ? evalExpression(bObject) : bObject;

  if (a.type !== NodeType.Number) {
    throw new OperationError(`1st argument: cannot accept object of type ${a.type}`);
  }

  if (b.type !== NodeType.Number) {
    throw new OperationError(`2nd argument: cannot accept object of type ${b.type}`);
  }

  const result = (a.val as number) * (b.val as number);
  return createObject(NodeType.Number, result);
}

export function getDivTwoNumeric(aObject: Node, bObject: Node): Node {
  const a = aObject.type === NodeType.List ? evalExpression(aObject) : aObject;
  const b = bObject.type === NodeType.List ? evalExpression(bObject) : bObject;

  if (a.type !== NodeType.Number) {
    throw new OperationError(`1st argument: cannot accept object of type ${a.type}`);
  }

  if (b.type !== NodeType.Number) {
    throw new OperationError(`2nd argument: cannot accept object of type ${b.type}`);
  }

  const result = (a.val as number) / (b.val as number);
  return createObject(NodeType.Number, result);
}

export function getModTwoNumeric(aObject: Node, bObject: Node): Node {
  const a = aObject.type === NodeType.List ? evalExpression(aObject) : aObject;
  const b = bObject.type === NodeType.List ? evalExpression(bObject) : bObject;

  if (a.type !== NodeType.Number) {
    throw new OperationError(`1st argument: cannot accept object of type ${a.type}`);
  }

  if (b.type !== NodeType.Number) {
    throw new OperationError(`2nd argument: cannot accept object of type ${b.type}`);
  }

  const result = (a.val as number) % (b.val as number);
  return createObject(NodeType.Number, result);
}

export function handleBuiltinAddOperator(expr: Node): Node {
  const list = expr.val as NodeValueList;
  const args = list.length - 1;
  if (args < 2) {
    throw new OperationError("Add operator can't have less than 2 args");
  }
  let result = evalExpression(list[1]);
  let argumentIndex = 2;
  while (argumentIndex < list.length) {
    const operand = evalExpression(list[argumentIndex++]);
    result = getSumTwoNumeric(result, operand);
  }
  return result;
}

export function handleBuiltinMultOperator(expr: Node): Node {
  const list = expr.val as NodeValueList;
  const args = list.length - 1;
  if (args < 2) {
    throw new OperationError("Multiplication operator can't have less than 2 args");
  }
  let result = evalExpression(list[1]);
  let argumentIndex = 2;
  while (argumentIndex < list.length) {
    const operand = evalExpression(list[argumentIndex++]);
    result = getMultTwoNumeric(result, operand);
  }
  return result;
}

export function handleBuiltinDivOperator(expr: Node): Node {
  const list = expr.val as NodeValueList;
  const args = list.length - 1;
  if (args < 2) {
    throw new OperationError("Division operator can't have less than 2 args");
  }
  let result = evalExpression(list[1]);
  let argumentIndex = 2;
  while (argumentIndex < list.length) {
    const operand = evalExpression(list[argumentIndex++]);
    result = getDivTwoNumeric(result, operand);
  }
  return result;
}

export function handleBuiltinSetq(expr: Node): Node {
  const list = expr.val as NodeValueList;
  const args = list.length - 1;
  if (args < 2) {
    throw new OperationError(`Setq takes exactly 2 arguments, but ${args} presented`);
  }
  const symname = list[1];
  const symval = evalExpression(list[2]);
  Scope.insertToSymtable(symname.val.toString(), symval);
  return null;
}

export function handleBuiltinPrint(expr: Node): Node {
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

export function handleBuiltinSubOperator(expr: Node): Node {
  const list = expr.val as NodeValueList;
  const args = list.length - 1;
  if (args < 2) {
    throw new OperationError("Sub operator can't have less than 2 args");
  }
  let result = evalExpression(list[1]);
  let argumentIndex = 2;
  while (argumentIndex < list.length) {
    const operand = evalExpression(list[argumentIndex++]);
    result = getSubTwoNumeric(result, operand);
  }
  return result;
}

export function handleBuiltinModOperator(expr: Node): Node {
  const list = expr.val as NodeValueList;
  const args = list.length - 1;
  if (args < 2) {
    throw new OperationError("Modulo operator can't have less than 2 args");
  }
  let result = evalExpression(list[1]);
  let argumentIndex = 2;
  while (argumentIndex < list.length) {
    const operand = evalExpression(list[argumentIndex++]);
    result = getModTwoNumeric(result, operand);
  }
  return result;
}

export function handleBuiltinDefun(expr: Node): Node {
  const list = expr.val as NodeValueList;
  const args = list.length - 1;
  if (args < 2) {
    throw new OperationError('defun can accept 2 or more arguments');
  }
  const fname = list[1].val as string;
  const fparams = list[2];
  if (fparams.type !== NodeType.List) {
    throw new OperationError('function arguments must be a list');
  }
  const func = createFuncObject({args: fparams, body: expr});
  Scope.insertToSymtable(fname, func);
  return func;
}
