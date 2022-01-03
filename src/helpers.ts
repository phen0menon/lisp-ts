import {Node, NodeType, NodeValue, NodeCallableFlags, NodeFuncDef, NodeBuiltinEval} from './types';

export function createObject(type: NodeType, val: NodeValue): Node {
  return {type, val, flags: NodeCallableFlags.Null};
}

export function createFuncObject(val: NodeFuncDef): Node {
  const obj = createObject(NodeType.Func, val);
  obj.flags = NodeCallableFlags.UserDefined;
  return obj;
}

export function createBuiltinObject(handler: NodeBuiltinEval) {
  const obj = createObject(NodeType.Symbol, handler);
  obj.flags = NodeCallableFlags.Builtin;
  return obj;
}

export function makeStringObject(node: Node) {
  switch (node.type) {
    case NodeType.String:
      return node;
    case NodeType.Number:
      return createObject(NodeType.String, node.val.toString());
    default:
      return null;
  }
}
