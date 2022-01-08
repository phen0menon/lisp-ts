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
  Symtable,
} from './types';

function evalUserDefinedFunction(func: Node<NodeFuncDef>, params: NodeValueList): AnyNode {
  const args = func.val.args.val;
  const body = func.val.body.val;
  if (args.length !== params.length) {
    throw new OperationError(`Function takes ${args.length} but ${params.length} were given`);
  }
  const localSymbols = args.reduce((map: Symtable, arg: AnyNode, index: number) => {
    map.set(arg.val.toString(), evalExpression(params[index]));
    return map;
  }, new Map() as Symtable);
  Scope.enter(localSymbols);
  const evaluated = body.reduce((_, expr) => evalExpression(expr), null);
  Scope.exit();
  return evaluated;
}

function evalSymbol(expr: Node<NodeSymbol>): AnyNode {
  assertSymbolInSymtable(expr);
  let symbol = Scope.getFromSymtable(expr.val);
  if (!(symbol.flags & NodeCallableFlags.Evaluated)) {
    symbol = evalExpression(symbol);
    symbol.flags |= NodeCallableFlags.Evaluated;
    Scope.insertToSymtable(expr.val.toString(), symbol);
  }
  return symbol;
}

function evalList(expr: Node<NodeValueList>): AnyNode {
  const list = expr.val;
  if (!list.length) return expr;
  const [operator] = list;
  const callable = Scope.getFromSymtable(operator.val);
  if (!callable) {
    throw new UndefinedSymbolError(operator.val.toString());
  }
  const isBuiltin = callable.flags & NodeCallableFlags.Builtin;
  if (isBuiltin) {
    const evalBuiltin = callable.val as NodeBuiltinEval;
    return evalBuiltin(expr);
  }
  const params = expr.val.slice(1);
  return evalUserDefinedFunction(callable as Node<NodeFuncDef>, params as NodeValueList);
}

function evalString(expr: Node<NodeSymbol>): Node<NodeSymbol> {
  return expr;
}

export function evalExpression(expr: AnyNode): AnyNode {
  try {
    switch (expr.type) {
      case NodeType.String:
        return evalString(expr as Node<NodeSymbol>);
      case NodeType.Symbol:
        return evalSymbol(expr as Node<NodeSymbol>);
      case NodeType.List:
        return evalList(expr as Node<NodeValueList>);
      default: {
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
