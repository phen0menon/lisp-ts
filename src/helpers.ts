import { OperationError } from './errors';
import { evalExpression } from './eval';
import {
  Node,
  NodeType,
  NodeValue,
  AnyNode,
  NodeCallableFlags,
  NodeFuncDef,
  NodeBuiltinEval,
  NodeSymbol,
  NodeNumeric,
  NodeBool,
  NodeValueList,
  Context,
} from './types';

export function createObject<T extends NodeValue>(
  type: NodeType,
  val: T,
  flags?: NodeCallableFlags
): Node<T> {
  return { type, val, flags: flags ?? NodeCallableFlags.Null };
}

export const nil = createObject(NodeType.Nil, 'nil');

export function createStringObject(val: NodeSymbol, flags?: NodeCallableFlags): Node<NodeSymbol> {
  const obj = createObject(NodeType.String, val, flags);
  obj.flags |= NodeCallableFlags.Evaluated;
  return obj;
}

export function createBoolObject(val: NodeBool, flags?: NodeCallableFlags): Node<NodeBool> {
  const obj = createObject(NodeType.Boolean, val, flags);
  obj.flags |= NodeCallableFlags.Evaluated;
  return obj;
}

export function createNumericObject(
  val: NodeNumeric,
  flags?: NodeCallableFlags
): Node<NodeNumeric> {
  const obj = createObject(NodeType.Number, val, flags);
  obj.flags |= NodeCallableFlags.Evaluated;
  return obj;
}

export function createFuncObject(val: NodeFuncDef, flags?: NodeCallableFlags): Node<NodeFuncDef> {
  const obj = createObject(NodeType.Func, val, flags);
  obj.flags |= NodeCallableFlags.UserDefined;
  return obj;
}

export function createListObject(
  val: NodeValueList,
  flags?: NodeCallableFlags
): Node<NodeValueList> {
  const obj = createObject(NodeType.List, val, flags);
  obj.flags |= NodeCallableFlags.Evaluated;
  return obj;
}

export function createNonEvaluatedListObject(
  val: NodeValueList,
  flags?: NodeCallableFlags
): Node<NodeValueList> {
  const obj = createObject(NodeType.List, val, flags);
  return obj;
}

export function createBuiltinObject(handler: NodeBuiltinEval) {
  const obj = createObject(NodeType.Func, handler);
  obj.flags = NodeCallableFlags.Builtin;
  return obj;
}

export function validateFunctionSignature(
  args: NodeValueList,
  operator: string,
  assertedValue = 2
) {
  const argsCount = args.length;
  if (argsCount < assertedValue) {
    throw new OperationError(
      `${operator} takes ${assertedValue} or more arguments, but ${argsCount} presented`
    );
  }
}

export function validateArgumentType(
  arg: AnyNode,
  validTypes: NodeType[],
  errMsg?: string
): AnyNode {
  if (!validTypes.includes(arg.type)) {
    throw new OperationError(
      errMsg ?? `Expected argument of types ${validTypes.join(', ')}, but ${arg.type} was given`
    );
  }
  return arg;
}

export function evalArgument(ctx: Context, node: AnyNode): Node<Exclude<NodeValue, NodeValueList>> {
  let currNode = evalExpression(ctx, node);
  while (currNode.type === NodeType.List) {
    currNode = evalExpression(ctx, currNode);
  }
  return currNode as Node<Exclude<NodeValue, NodeValueList>>;
}

export function toString(node: AnyNode) {
  switch (node.type) {
    case NodeType.Number:
    case NodeType.Symbol:
      return node.val.toString();
    case NodeType.Func:
      return node.val.toString();
    case NodeType.List: {
      let result = '(';
      result += (node.val as NodeValueList).map(toString).join(' ');
      result += ')';
      return result;
    }
    case NodeType.Nil: {
      return 'nil';
    }
    default: {
      return null;
    }
  }
}

export function makeStringObject(node: AnyNode) {
  switch (node.type) {
    case NodeType.String:
      return node;
    case NodeType.Number:
    case NodeType.Boolean:
      return createStringObject(node.val.toString());
    case NodeType.List: {
      return createStringObject(toString(node));
    }
    case NodeType.Nil: {
      return nil;
    }
    default:
      return null;
  }
}
