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

export function createListObject(val: NodeValueList): Node<NodeValueList> {
  const obj = createObject(NodeType.Func, val);
  obj.flags |= NodeCallableFlags.Evaluated;
  return obj;
}

export function createBuiltinObject(handler: NodeBuiltinEval) {
  const obj = createObject(NodeType.Symbol, handler);
  obj.flags = NodeCallableFlags.Builtin;
  return obj;
}

export function toString(node: AnyNode) {
  switch (node.type) {
    case NodeType.Number:
    case NodeType.Symbol:
      return node.val.toString();
    case NodeType.List: {
      let result = '(';
      result += (node.val as NodeValueList).map(toString).join(' ');
      result += ')';
      return result;
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
    default:
      return null;
  }
}
