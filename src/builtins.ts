import {Scope} from './scope';
import {OperationError} from './errors';
import {evalExpression} from './eval';
import {createObject, createFuncObject, makeStringObject} from './helpers';
import {AnyNode, Node, NodeBool, NodeNumeric, NodeType, NodeValue, NodeValueList} from './types';

export function evalParams(node: AnyNode): Node<Exclude<NodeValue, NodeValueList>> {
  let currNode = evalExpression(node);
  while (currNode.type === NodeType.List) {
    currNode = evalExpression(currNode);
  }
  return currNode as Node<Exclude<NodeValue, NodeValueList>>;
}

export function calculateModulo(a: Node<NodeNumeric>, b: Node<NodeNumeric>): NodeNumeric {
  return a.val % b.val;
}

export function calculateAddition(a: Node<NodeNumeric>, b: Node<NodeNumeric>): NodeNumeric {
  return a.val + b.val;
}

export function calculateSubtraction(a: Node<NodeNumeric>, b: Node<NodeNumeric>): NodeNumeric {
  return a.val - b.val;
}

export function calculateDivision(a: Node<NodeNumeric>, b: Node<NodeNumeric>): NodeNumeric {
  return a.val / b.val;
}

export function calculateMultiplication(a: Node<NodeNumeric>, b: Node<NodeNumeric>): NodeNumeric {
  return a.val * b.val;
}

export function handleBuiltinAddOperator(expr: Node<NodeValueList>): AnyNode {
  const list = expr.val as NodeValueList;
  const args = list.length - 1;
  if (args < 2) {
    throw new OperationError("Add operator can't have less than 2 args");
  }
  const a = evalParams(list[1]);
  const b = evalParams(list[2]);
  if (a.type !== NodeType.Number) {
    throw new OperationError(`1st argument: cannot accept object of type ${a.type}`);
  }
  if (b.type !== NodeType.Number) {
    throw new OperationError(`2nd argument: cannot accept object of type ${b.type}`);
  }
  return createObject(
    NodeType.Number,
    calculateAddition(a as Node<NodeNumeric>, b as Node<NodeNumeric>)
  );
}

export function handleBuiltinMultOperator(expr: Node<NodeValueList>): AnyNode {
  const list = expr.val;
  const args = list.length - 1;
  if (args < 2) {
    throw new OperationError("Multiplication operator can't have less than 2 args");
  }
  const a = evalParams(list[1]);
  const b = evalParams(list[2]);
  if (a.type !== NodeType.Number) {
    throw new OperationError(`1st argument: cannot accept object of type ${a.type}`);
  }
  if (b.type !== NodeType.Number) {
    throw new OperationError(`2nd argument: cannot accept object of type ${b.type}`);
  }
  return createObject(
    NodeType.Number,
    calculateMultiplication(a as Node<NodeNumeric>, b as Node<NodeNumeric>)
  );
}

export function handleBuiltinDivOperator(expr: Node<NodeValueList>): AnyNode {
  const list = expr.val;
  const args = list.length - 1;
  if (args < 2) {
    throw new OperationError("Division operator can't have less than 2 args");
  }
  const a = evalParams(list[1]);
  const b = evalParams(list[2]);
  if (a.type !== NodeType.Number) {
    throw new OperationError(`1st argument: cannot accept object of type ${a.type}`);
  }
  if (b.type !== NodeType.Number) {
    throw new OperationError(`2nd argument: cannot accept object of type ${b.type}`);
  }
  return createObject(
    NodeType.Number,
    calculateDivision(a as Node<NodeNumeric>, b as Node<NodeNumeric>)
  );
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
  return null;
}

export function handleBuiltinSubOperator(expr: Node<NodeValueList>): AnyNode {
  const list = expr.val;
  const args = list.length - 1;
  if (args < 2) {
    throw new OperationError("Sub operator can't have less than 2 args");
  }
  const a = evalParams(list[1]);
  const b = evalParams(list[2]);
  if (a.type !== NodeType.Number) {
    throw new OperationError(`1st argument: cannot accept object of type ${a.type}`);
  }
  if (b.type !== NodeType.Number) {
    throw new OperationError(`2nd argument: cannot accept object of type ${b.type}`);
  }
  return createObject(
    NodeType.Number,
    calculateSubtraction(a as Node<NodeNumeric>, b as Node<NodeNumeric>)
  );
}

export function handleBuiltinModOperator(expr: Node<NodeValueList>): AnyNode {
  const list = expr.val;
  const args = list.length - 1;
  if (args < 2) {
    throw new OperationError("Modulo operator can't have less than 2 args");
  }
  const a = evalExpression(list[1]);
  const b = evalExpression(list[2]);
  if (a.type !== NodeType.Number) {
    throw new OperationError(`1st argument: cannot accept object of type ${a.type}`);
  }
  if (b.type !== NodeType.Number) {
    throw new OperationError(`2nd argument: cannot accept object of type ${b.type}`);
  }
  return createObject(
    NodeType.Number,
    calculateModulo(a as Node<NodeNumeric>, b as Node<NodeNumeric>)
  );
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

export function handleBuiltinTerpri(expr: Node<NodeValueList>): Node<NodeValueList> {
  console.log('');
  return expr;
}

export function handleBuiltinLtOperator(expr: Node<NodeValueList>): Node<NodeBool> {
  const list = expr.val;
  const argslength = list.length - 1;
  if (argslength < 2) {
    throw new OperationError("'<' operator can't have less than 2 args");
  }
  const a = evalExpression(list[1]);
  const b = evalExpression(list[2]);
  if (a.type !== b.type) {
    throw new OperationError(`'<' operator cannot compare two objects with different types`);
  }
  switch (a.type) {
    case NodeType.Boolean:
    case NodeType.String:
    case NodeType.Number:
      return createObject(NodeType.Boolean, a.val < b.val);
    default:
      throw new OperationError(
        `'<' operator can only compare objects of type: boolean, string, number`
      );
  }
}

export function handleBuiltinGtOperator(expr: Node<NodeValueList>): Node<NodeBool> {
  const list = expr.val;
  const argslength = list.length - 1;
  if (argslength < 2) {
    throw new OperationError("'>' operator can't have less than 2 args");
  }
  const a = evalExpression(list[1]);
  const b = evalExpression(list[2]);
  if (a.type !== b.type) {
    throw new OperationError(`'>' operator cannot compare two objects with different types`);
  }
  switch (a.type) {
    case NodeType.Boolean:
    case NodeType.String:
    case NodeType.Number:
      return createObject(NodeType.Boolean, a.val > b.val);
    default:
      throw new OperationError(
        `'>' operator can only compare objects of type: boolean, string, number`
      );
  }
}

export function handleBuiltinPowOperator(expr: Node<NodeValueList>): Node<NodeNumeric> {
  const list = expr.val;
  const argslength = list.length - 1;
  if (argslength < 2) {
    throw new OperationError("'**' operator can't have less than 2 args");
  }
  const a = evalExpression(list[1]);
  const b = evalExpression(list[2]);
  if (a.type !== NodeType.Number) {
    throw new OperationError(`1st argument: cannot accept object of type ${a.type}`);
  }
  if (b.type !== NodeType.Number) {
    throw new OperationError(`2nd argument: cannot accept object of type ${b.type}`);
  }
  return createObject(
    NodeType.Number,
    calculateSubtraction(a as Node<NodeNumeric>, b as Node<NodeNumeric>)
  );
}
