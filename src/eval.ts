import {UndefinedSymbolError} from './errors';
import {assertIsInSymtable, symtable} from './symtable';
import {Node, NodeType, NodeValueList, NodeCallableFlags, NodeBuiltinEval} from './types';

function callFunction(func: Node, args: Node): Node {
  return null;
}

export function evalExpression(expr: Node): Node {
  try {
    switch (expr.type) {
      case NodeType.Number:
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
        const isBuiltin = callable.flags & NodeCallableFlags.Builtin;
        if (isBuiltin) {
          const evalBuiltin = callable.val as NodeBuiltinEval;
          return evalBuiltin(expr);
        }
        return callFunction(callable, expr);
      }
      default: {
        console.error(`Unknown expression: ${expr}`);
        return expr;
      }
    }
  } catch (err) {
    console.log(err);
    if (err instanceof UndefinedSymbolError) {
      return null;
    }
  }
}
