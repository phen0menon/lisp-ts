import {
  Node,
  NodeType,
  NodeValue,
  NodeCallableFlags,
  NodeFuncDef,
  NodeBuiltinEval,
  AnyNode,
  NodeSymbol,
  NodeNumeric,
  NodeBool,
} from './types';

export function createObject<T extends NodeValue>(type: NodeType, val: T): Node<T> {
  return {type, val, flags: NodeCallableFlags.Null};
}

export function createStringObject(val: NodeSymbol): Node<NodeSymbol> {
  const obj = createObject(NodeType.String, val);
  obj.flags |= NodeCallableFlags.Evaluated;
  return obj;
}

export function createBoolObject(val: NodeBool): Node<NodeBool> {
  const obj = createObject(NodeType.Boolean, val);
  obj.flags |= NodeCallableFlags.Evaluated;
  return obj;
}

export function createNumericObject(val: NodeNumeric): Node<NodeNumeric> {
  const obj = createObject(NodeType.Number, val);
  obj.flags |= NodeCallableFlags.Evaluated;
  return obj;
}

export function createFuncObject(val: NodeFuncDef): Node<NodeFuncDef> {
  const obj = createObject(NodeType.Func, val);
  obj.flags |= NodeCallableFlags.UserDefined;
  return obj;
}

export function createBuiltinObject(handler: NodeBuiltinEval) {
  const obj = createObject(NodeType.Symbol, handler);
  obj.flags = NodeCallableFlags.Builtin;
  return obj;
}

export function makeStringObject(node: AnyNode) {
  switch (node.type) {
    case NodeType.String:
      return node;
    case NodeType.Number:
    case NodeType.Boolean:
      return createStringObject(node.val.toString());
    default:
      return null;
  }
}
