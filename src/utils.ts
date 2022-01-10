import {Node, AnyNode, NodeType, NodeValueList, NodeCallableFlags} from './types';

export function isAlphaNumeric(str: string): boolean {
  for (let i = 0, len = str.length, code = 0; i < len; ++i) {
    code = str.charCodeAt(i);
    if (
      (code > 47 && code < 58) || // numeric (0-9)
      (code > 64 && code < 91) || // upper alpha (A-Z)
      (code > 96 && code < 123) // lower alpha (a-z)
    )
      continue;

    return false;
  }
  return true;
}

export function isSymbol(char: string): boolean {
  return ['+', '-', '/', '*', '%', '<', '>', '**', '='].includes(char) || isAlphaNumeric(char);
}

export function isNumeric(number: string): boolean {
  return !isNaN(parseFloat(number)) && !isNaN(+number);
}

export function isTruthy(node: AnyNode): boolean {
  switch (node.type) {
    case NodeType.Func:
    case NodeType.Number:
    case NodeType.Boolean:
      return node.val !== 0 && node.val !== false;
    case NodeType.List:
      return (node.val as NodeValueList).length > 0;
    case NodeType.String:
      return (node.val as string).length > 0;
    case NodeType.Nil:
      return false;
    default: {
      return false;
    }
  }
}

export function isNullish(node: AnyNode): boolean {
  switch (node.type) {
    case NodeType.Nil:
      return true;
    case NodeType.List: {
      const list = (node as Node<NodeValueList>).val.length;
      if (list === 0) {
        return true;
      }
    }
    default:
      return false;
  }
}

export function isLiteral(node: AnyNode): boolean {
  return !!(node.flags & NodeCallableFlags.Literal);
}

export function isBuiltin(node: AnyNode): boolean {
  return !!(node.flags & NodeCallableFlags.Builtin);
}

export function isFunction(node: AnyNode): boolean {
  return node.type === NodeType.Func;
}

export function isEvaluated(node: AnyNode): boolean {
  return !!(node.flags & NodeCallableFlags.Evaluated);
}
