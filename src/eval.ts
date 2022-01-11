import { OperationError, UndefinedSymbolError } from './errors';
import { nil } from './helpers';
import { assertSymbolInSymtable, Scope } from './scope';
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
  Context,
} from './types';
import { isBuiltin, isEvaluated, isFunction, isLiteral } from './utils';

function evalUserDefinedFunction(
  ctx: Context,
  func: Node<NodeFuncDef>,
  params: NodeValueList
): AnyNode {
  const { scope } = ctx;
  const args = func.val.args.val;
  const body = func.val.body.val;
  if (args.length !== params.length) {
    throw new OperationError(`Function takes ${args.length} but ${params.length} were given`);
  }
  const localSymbols = args.reduce((map: Symtable, arg: AnyNode, index: number) => {
    map.set(arg.val.toString(), evalExpression(ctx, params[index]));
    return map;
  }, new Map() as Symtable);
  scope.enter(localSymbols);
  const evaluated = body.reduce((_, expr) => evalExpression(ctx, expr), null);
  scope.exit();
  return evaluated;
}

function evalSymbol(ctx: Context, expr: Node<NodeSymbol>): AnyNode {
  const { scope } = ctx;
  assertSymbolInSymtable(scope.get().symtable, expr);
  let symbol = scope.getFromSymtable(expr.val);
  if (!isEvaluated(symbol)) {
    symbol = evalExpression(ctx, symbol);
    symbol.flags |= NodeCallableFlags.Evaluated;
    scope.insertToSymtable(expr.val.toString(), symbol);
  }
  return symbol;
}

function evalListLiteral(ctx: Context, expr: Node<NodeValueList>): AnyNode {
  expr.val = expr.val.map(item => evalExpression(ctx, item));
  expr.flags |= NodeCallableFlags.Evaluated;
  return expr;
}

function evalList(ctx: Context, expr: Node<NodeValueList>): AnyNode {
  const list = expr.val;
  if (!list.length) return nil;

  const [operator, ...params] = list;
  const func = ctx.scope.getFromSymtable(operator.val);
  if (!func) throw new UndefinedSymbolError(operator.val.toString());

  if (!isFunction(func)) throw new Error(`${operator.val} is not a function but ${operator.type}`);

  if (isBuiltin(func)) {
    const evalBuiltin = func.val as NodeBuiltinEval;
    return evalBuiltin(ctx, expr);
  }

  return evalUserDefinedFunction(ctx, func as Node<NodeFuncDef>, params as NodeValueList);
}

function evalString(ctx: Context, expr: Node<NodeSymbol>): Node<NodeSymbol> {
  return expr;
}

export function evalExpression(ctx: Context, expr: AnyNode): AnyNode {
  switch (expr.type) {
    case NodeType.String:
      return evalString(ctx, expr as Node<NodeSymbol>);
    case NodeType.Symbol:
      return evalSymbol(ctx, expr as Node<NodeSymbol>);
    case NodeType.List: {
      const list = expr as Node<NodeValueList>;
      if (isLiteral(list)) {
        return evalListLiteral(ctx, list);
      }
      return evalList(ctx, list);
    }
    default: {
      return expr;
    }
  }
}
