import {OperationError, UndefinedSymbolError} from './errors';
import {assertSymbolInSymtable, Scope} from './scope';
import {
  Node,
  NodeType,
  NodeValueList,
  NodeCallableFlags,
  NodeBuiltinEval,
  NodeFuncDef,
} from './types';

function evalUserDefinedFunction(func: Node, provided: Node): Node {
  const params = (provided.val as NodeValueList).slice(1);
  const args = (func.val as NodeFuncDef).args.val as NodeValueList;
  const callableBody = ((func.val as NodeFuncDef).body.val as NodeValueList).slice(3);
  if (args.length !== params.length) {
    throw new OperationError(`Function takes ${args.length} but ${params.length} were given`);
  }
  Scope.enter();
  args.forEach((argument, index) => {
    Scope.insertToSymtable(argument.val.toString(), params[index]);
  });
  const evaluated = callableBody.reduce((_, expr) => evalExpression(expr), null);
  Scope.exit();
  return evaluated;
}

export function evalExpression(expr: Node): Node {
  try {
    switch (expr.type) {
      case NodeType.Number:
      case NodeType.String:
        return expr;
      case NodeType.Symbol: {
        assertSymbolInSymtable(expr);
        return Scope.getFromSymtable(expr.val.toString());
      }
      case NodeType.List: {
        const list = expr.val as NodeValueList;
        if (!list.length) return expr;
        const operand = list[0];
        const callable = Scope.getFromSymtable(operand.val.toString());
        if (!callable) {
          throw new UndefinedSymbolError(operand.val.toString());
        }
        const isBuiltin = callable.flags & NodeCallableFlags.Builtin;
        if (isBuiltin) {
          const evalBuiltin = callable.val as NodeBuiltinEval;
          return evalBuiltin(expr);
        }
        return evalUserDefinedFunction(callable, expr);
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
