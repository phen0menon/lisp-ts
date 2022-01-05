import {OperationError, UndefinedSymbolError} from './errors';
import {assertSymbolInSymtable, Scope} from './scope';
import {
  Node,
  NodeType,
  NodeValueList,
  NodeCallableFlags,
  NodeBuiltinEval,
  NodeFuncDef,
  AnyNode,
  NodeSymbol,
} from './types';

function evalUserDefinedFunction(func: Node<NodeFuncDef>, provided: Node<NodeValueList>): AnyNode {
  const params = provided.val.slice(1);
  const args = func.val.args.val;
  const callableBody = func.val.body.val.slice(3);
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

function evalSymbol(expr: Node<NodeSymbol>): AnyNode {
  assertSymbolInSymtable(expr);
  return Scope.getFromSymtable(expr.val.toString());
}

function evalList(expr: Node<NodeValueList>): AnyNode {
  const list = expr.val;
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
  return evalUserDefinedFunction(callable as Node<NodeFuncDef>, expr as Node<NodeValueList>);
}

export function evalExpression(expr: AnyNode): AnyNode {
  try {
    switch (expr.type) {
      case NodeType.Number:
      case NodeType.String:
        return expr;
      case NodeType.Symbol: {
        return evalSymbol(expr as Node<NodeSymbol>);
      }
      case NodeType.List: {
        return evalList(expr as Node<NodeValueList>);
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
