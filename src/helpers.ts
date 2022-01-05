import {
  Node,
  NodeType,
  NodeValue,
  NodeCallableFlags,
  NodeFuncDef,
  NodeBuiltinEval,
  AnyNode,
} from './types';

export function createObject<T extends NodeValue>(type: NodeType, val: T): Node<T> {
  return {type, val, flags: NodeCallableFlags.Null};
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
      return createObject(NodeType.String, node.val.toString());
    default:
      return null;
  }
}
