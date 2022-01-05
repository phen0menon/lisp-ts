import {Scope} from './scope';
import {OperationError} from './errors';
import {evalExpression} from './eval';
import {createObject, createFuncObject, makeStringObject} from './helpers';
import {AnyNode, Node, NodeNumeric, NodeType, NodeValueList} from './types';

export function calculateModulo(a: Node<NodeNumeric>, b: Node<NodeNumeric>): Node<NodeNumeric> {
  return createObject(NodeType.Number, a.val % b.val);
}

export function calculateAddition(a: Node<NodeNumeric>, b: Node<NodeNumeric>): Node<NodeNumeric> {
  return createObject(NodeType.Number, a.val + b.val);
}

export function calculateSubtraction(
  a: Node<NodeNumeric>,
  b: Node<NodeNumeric>
): Node<NodeNumeric> {
  return createObject(NodeType.Number, a.val - b.val);
}

export function calculateDivision(a: Node<NodeNumeric>, b: Node<NodeNumeric>): Node<NodeNumeric> {
  return createObject(NodeType.Number, a.val / b.val);
}

export function calculateMultiplication(
  a: Node<NodeNumeric>,
  b: Node<NodeNumeric>
): Node<NodeNumeric> {
  return createObject(NodeType.Number, a.val * b.val);
}

export function invokeAddition(aObject: AnyNode, bObject: AnyNode): Node<NodeNumeric> {
  const a = aObject.type === NodeType.List ? evalExpression(aObject) : aObject;
  const b = bObject.type === NodeType.List ? evalExpression(bObject) : bObject;
  if (a.type !== NodeType.Number) {
    throw new OperationError(`1st argument: cannot accept object of type ${a.type}`);
  }
  if (b.type !== NodeType.Number) {
    throw new OperationError(`2nd argument: cannot accept object of type ${b.type}`);
  }
  return calculateAddition(a as Node<NodeNumeric>, b as Node<NodeNumeric>);
}

export function invokeSubtraction(aObject: AnyNode, bObject: AnyNode): AnyNode {
  const a = aObject.type === NodeType.List ? evalExpression(aObject) : aObject;
  const b = bObject.type === NodeType.List ? evalExpression(bObject) : bObject;
  if (a.type !== NodeType.Number) {
    throw new OperationError(`1st argument: cannot accept object of type ${a.type}`);
  }
  if (b.type !== NodeType.Number) {
    throw new OperationError(`2nd argument: cannot accept object of type ${b.type}`);
  }
  return calculateSubtraction(a as Node<NodeNumeric>, b as Node<NodeNumeric>);
}

export function invokeMultiplication(aObject: AnyNode, bObject: AnyNode): AnyNode {
  const a = aObject.type === NodeType.List ? evalExpression(aObject) : aObject;
  const b = bObject.type === NodeType.List ? evalExpression(bObject) : bObject;
  if (a.type !== NodeType.Number) {
    throw new OperationError(`1st argument: cannot accept object of type ${a.type}`);
  }
  if (b.type !== NodeType.Number) {
    throw new OperationError(`2nd argument: cannot accept object of type ${b.type}`);
  }
  return calculateMultiplication(a as Node<NodeNumeric>, b as Node<NodeNumeric>);
}

export function invokeDivision(aObject: AnyNode, bObject: AnyNode): AnyNode {
  const a = aObject.type === NodeType.List ? evalExpression(aObject) : aObject;
  const b = bObject.type === NodeType.List ? evalExpression(bObject) : bObject;
  if (a.type !== NodeType.Number) {
    throw new OperationError(`1st argument: cannot accept object of type ${a.type}`);
  }
  if (b.type !== NodeType.Number) {
    throw new OperationError(`2nd argument: cannot accept object of type ${b.type}`);
  }
  return calculateDivision(a as Node<NodeNumeric>, b as Node<NodeNumeric>);
}

export function invokeModulo(aObject: AnyNode, bObject: AnyNode): Node<NodeNumeric> {
  const a = aObject.type === NodeType.List ? evalExpression(aObject) : aObject;
  const b = bObject.type === NodeType.List ? evalExpression(bObject) : bObject;
  if (a.type !== NodeType.Number) {
    throw new OperationError(`1st argument: cannot accept object of type ${a.type}`);
  }
  if (b.type !== NodeType.Number) {
    throw new OperationError(`2nd argument: cannot accept object of type ${b.type}`);
  }
  return calculateModulo(a as Node<NodeNumeric>, b as Node<NodeNumeric>);
}

export function handleBuiltinAddOperator(expr: Node<NodeValueList>): AnyNode {
  const list = expr.val as NodeValueList;
  const args = list.length - 1;
  if (args < 2) {
    throw new OperationError("Add operator can't have less than 2 args");
  }
  let result = evalExpression(list[1]);
  let argumentIndex = 2;
  while (argumentIndex < list.length) {
    const operand = evalExpression(list[argumentIndex++]);
    result = invokeAddition(result, operand);
  }
  return result;
}

export function handleBuiltinMultOperator(expr: Node<NodeValueList>): AnyNode {
  const list = expr.val;
  const args = list.length - 1;
  if (args < 2) {
    throw new OperationError("Multiplication operator can't have less than 2 args");
  }
  let result = evalExpression(list[1]);
  let argumentIndex = 2;
  while (argumentIndex < list.length) {
    const operand = evalExpression(list[argumentIndex++]);
    result = invokeMultiplication(result, operand);
  }
  return result;
}

export function handleBuiltinDivOperator(expr: Node<NodeValueList>): AnyNode {
  const list = expr.val;
  const args = list.length - 1;
  if (args < 2) {
    throw new OperationError("Division operator can't have less than 2 args");
  }
  let result = evalExpression(list[1]);
  let argumentIndex = 2;
  while (argumentIndex < list.length) {
    const operand = evalExpression(list[argumentIndex++]);
    result = invokeDivision(result, operand);
  }
  return result;
}

export function handleBuiltinSetq(expr: Node<NodeValueList>): AnyNode {
  const list = expr.val;
  const args = list.length - 1;
  if (args < 2) {
    throw new OperationError(`Setq takes exactly 2 arguments, but ${args} presented`);
  }
  const symname = list[1];
  const symval = evalExpression(list[2]);
  Scope.insertToSymtable(symname.val.toString(), symval);
  return null;
}

export function handleBuiltinPrint(expr: Node<NodeValueList>): AnyNode {
  const list = expr.val;
  let argumentIndex = 1;
  while (argumentIndex < list.length) {
    const argument = evalExpression(list[argumentIndex++]);
    const strObj = makeStringObject(argument);
    console.log(strObj.val);
  }
  console.log('');
  return null;
}

export function handleBuiltinSubOperator(expr: Node<NodeValueList>): AnyNode {
  const list = expr.val;
  const args = list.length - 1;
  if (args < 2) {
    throw new OperationError("Sub operator can't have less than 2 args");
  }
  let result = evalExpression(list[1]);
  let argumentIndex = 2;
  while (argumentIndex < list.length) {
    const operand = evalExpression(list[argumentIndex++]);
    result = invokeSubtraction(result, operand);
  }
  return result;
}

export function handleBuiltinModOperator(expr: Node<NodeValueList>): AnyNode {
  const list = expr.val;
  const args = list.length - 1;
  if (args < 2) {
    throw new OperationError("Modulo operator can't have less than 2 args");
  }
  let result = evalExpression(list[1]);
  let argumentIndex = 2;
  while (argumentIndex < list.length) {
    const operand = evalExpression(list[argumentIndex++]);
    result = invokeModulo(result, operand);
  }
  return result;
}

export function handleBuiltinDefun(expr: Node<NodeValueList>): AnyNode {
  const list = expr.val;
  const args = list.length - 1;
  if (args < 2) {
    throw new OperationError('defun can accept 2 or more arguments');
  }
  const fname = list[1].val as string;
  const fparams = list[2];
  if (fparams.type !== NodeType.List) {
    throw new OperationError('function arguments must be a list');
  }
  const func = createFuncObject({args: fparams as Node<NodeValueList>, body: expr});
  Scope.insertToSymtable(fname, func);
  return func;
}
