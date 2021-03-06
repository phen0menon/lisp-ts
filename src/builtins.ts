import { Scope } from './scope';
import { OperationError } from './errors';
import { evalExpression } from './eval';
import {
  createFuncObject,
  makeStringObject,
  createNumericObject,
  createBoolObject,
  createObject,
  nil,
  createListObject,
  createStringObject,
  validateArgumentType,
  evalArgument,
  validateFunctionSignature,
} from './helpers';
import {
  AnyNode,
  Node,
  NodeBool,
  NodeCallableFlags,
  NodeNil,
  NodeNumeric,
  NodeSymbol,
  NodeType,
  NodeValue,
  NodeValueList,
  Context,
} from './types';
import { isNullish, isTruthy } from './utils';

export function evalAdd(ctx: Context, expr: Node<NodeValueList>): Node<NodeNumeric> {
  const [_, ...args] = expr.val;
  validateFunctionSignature(args, 'add');
  const leftArg = validateArgumentType(evalArgument(ctx, args[0]), [
    NodeType.Number,
  ]) as Node<NodeNumeric>;
  const rightArg = validateArgumentType(evalArgument(ctx, args[1]), [
    NodeType.Number,
  ]) as Node<NodeNumeric>;
  return createNumericObject(calculateAdd(leftArg, rightArg));
}

export function evalMult(ctx: Context, expr: Node<NodeValueList>): AnyNode {
  const [_, ...args] = expr.val;
  validateFunctionSignature(args, 'mult');
  const leftArg = validateArgumentType(evalArgument(ctx, args[0]), [
    NodeType.Number,
  ]) as Node<NodeNumeric>;
  const rightArg = validateArgumentType(evalArgument(ctx, args[1]), [
    NodeType.Number,
  ]) as Node<NodeNumeric>;
  return createNumericObject(calculateMult(leftArg, rightArg));
}

export function evalDiv(ctx: Context, expr: Node<NodeValueList>): Node<NodeNumeric> {
  const [_, ...args] = expr.val;
  validateFunctionSignature(args, 'div');
  const leftArg = validateArgumentType(evalArgument(ctx, args[0]), [
    NodeType.Number,
  ]) as Node<NodeNumeric>;
  const rightArg = validateArgumentType(evalArgument(ctx, args[1]), [
    NodeType.Number,
  ]) as Node<NodeNumeric>;
  return createNumericObject(calculateDiv(leftArg, rightArg));
}

export function evalSetq(ctx: Context, expr: Node<NodeValueList>): Node<NodeNil> {
  const [operator, ...args] = expr.val;
  validateFunctionSignature(args, 'setq');
  const symname = validateArgumentType(args[0], [NodeType.Symbol]) as Node<NodeSymbol>;
  const symval = evalExpression(ctx, args[1]);
  ctx.scope.insertToSymtable(symname.val, symval);
  return nil;
}

export function evalPrint(ctx: Context, expr: Node<NodeValueList>): Node<NodeNil> {
  const [operator, ...args] = expr.val;
  args.forEach(arg => {
    const evaluatedArg = evalExpression(ctx, arg);
    const strObj = makeStringObject(evaluatedArg);
    process.stdout.write(strObj.val.toString());
  });
  console.log();
  return nil;
}

export function evalSub(ctx: Context, expr: Node<NodeValueList>): Node<NodeNumeric> {
  const [operator, ...args] = expr.val;
  validateFunctionSignature(args, 'sub');
  const leftArg = validateArgumentType(evalArgument(ctx, args[0]), [
    NodeType.Number,
  ]) as Node<NodeNumeric>;
  const rightArg = validateArgumentType(evalArgument(ctx, args[1]), [
    NodeType.Number,
  ]) as Node<NodeNumeric>;
  return createNumericObject(calculateSub(leftArg, rightArg));
}

export function evalMod(ctx: Context, expr: Node<NodeValueList>): Node<NodeNumeric> {
  const [_, ...args] = expr.val;
  validateFunctionSignature(args, 'mod');
  const leftArg = validateArgumentType(evalArgument(ctx, args[0]), [
    NodeType.Number,
  ]) as Node<NodeNumeric>;
  const rightArg = validateArgumentType(evalArgument(ctx, args[1]), [
    NodeType.Number,
  ]) as Node<NodeNumeric>;
  return createNumericObject(calculateMod(leftArg, rightArg));
}

export function evalDefun(ctx: Context, expr: Node<NodeValueList>): AnyNode {
  const [_, ...args] = expr.val;
  validateFunctionSignature(args, 'defun');

  const fname = (
    validateArgumentType(
      args[0],
      [NodeType.Symbol],
      'function name must be a string'
    ) as Node<NodeSymbol>
  ).val;

  const fparams = validateArgumentType(
    args[1],
    [NodeType.List],
    'function arguments must be a list'
  ) as Node<NodeValueList>;

  const bodyArgs = expr.val.slice(3);
  const fbody = createObject(NodeType.Func, bodyArgs);

  const func = createFuncObject({
    args: fparams,
    body: fbody,
  });

  ctx.scope.insertToSymtable(fname, func);
  return func;
}

export function evalTerpri(ctx: Context, expr: Node<NodeValueList>): Node<NodeValueList> {
  console.log();
  return expr;
}

export function evalLtOperator(ctx: Context, expr: Node<NodeValueList>): Node<NodeBool> {
  const [_, ...args] = expr.val;
  validateFunctionSignature(args, '<');

  const leftArg = evalArgument(ctx, args[0]);
  const rightArg = evalArgument(ctx, args[1]);

  if (leftArg.type !== rightArg.type) {
    throw new OperationError(`'<' operator cannot compare two objects of different types`);
  }

  switch (leftArg.type) {
    case NodeType.Boolean:
    case NodeType.String:
    case NodeType.Number:
      return createBoolObject(leftArg.val < rightArg.val);
    default:
      throw new OperationError(
        `'<' operator can only compare objects of type: boolean, string, number`
      );
  }
}

export function evalEqOperator(ctx: Context, expr: Node<NodeValueList>): Node<NodeBool> {
  const [_, ...args] = expr.val;
  validateFunctionSignature(args, '=');

  const leftArg = evalArgument(ctx, args[0]);
  const rightArg = evalArgument(ctx, args[1]);

  if (leftArg.type !== rightArg.type) {
    throw new OperationError(`'=' operator cannot compare two objects of different types`);
  }

  switch (leftArg.type) {
    case NodeType.Boolean:
    case NodeType.String:
    case NodeType.Number:
      return createBoolObject(leftArg.val === rightArg.val);
    default:
      throw new OperationError(
        `'=' operator can only compare objects of type: boolean, string, number`
      );
  }
}

export function evalGtOperator(ctx: Context, expr: Node<NodeValueList>): Node<NodeBool> {
  const [_, ...args] = expr.val;
  validateFunctionSignature(args, '>');

  const leftArg = evalArgument(ctx, args[0]);
  const rightArg = evalArgument(ctx, args[1]);

  if (leftArg.type !== rightArg.type) {
    throw new OperationError(`'>' operator cannot compare two objects of different types`);
  }

  switch (leftArg.type) {
    case NodeType.Boolean:
    case NodeType.String:
    case NodeType.Number:
      return createBoolObject(leftArg.val > rightArg.val);
    default:
      throw new OperationError(
        `'>' operator can only compare objects of type: boolean, string, number`
      );
  }
}

export function evalPowOperator(ctx: Context, expr: Node<NodeValueList>): Node<NodeNumeric> {
  const [_, ...args] = expr.val;
  validateFunctionSignature(args, 'pow');
  const leftArg = validateArgumentType(evalArgument(ctx, args[0]), [
    NodeType.Number,
  ]) as Node<NodeNumeric>;
  const rightArg = validateArgumentType(evalArgument(ctx, args[1]), [
    NodeType.Number,
  ]) as Node<NodeNumeric>;
  return createNumericObject(calculatePow(leftArg, rightArg));
}

export function evalIf(ctx: Context, expr: Node<NodeValueList>): AnyNode {
  const [_, ...args] = expr.val;
  validateFunctionSignature(args, 'if', 3);
  const [condExpr, thenExpr, elseExpr] = args;
  if (isTruthy(evalExpression(ctx, condExpr))) {
    return evalExpression(ctx, thenExpr);
  }
  return evalExpression(ctx, elseExpr);
}

export function evalNull(ctx: Context, expr: Node<NodeValueList>): Node<NodeNil> | Node<NodeBool> {
  const [operator, ...args] = expr.val;
  validateFunctionSignature(args, 'null', 1);
  const argument = evalExpression(ctx, args[0]);
  if (isNullish(argument)) return createBoolObject(true);
  return nil;
}

export function evalCons(ctx: Context, expr: Node<NodeValueList>): Node<NodeValueList> {
  const [operator, ...args] = expr.val;
  validateFunctionSignature(args, 'cons', 2);

  const [leftArg, rightArg] = args;
  const car = [evalExpression(ctx, leftArg)];
  const cdr = evalExpression(ctx, rightArg);

  switch (cdr.type) {
    case NodeType.List: {
      const cdrList = cdr as Node<NodeValueList>;
      car.push(...cdrList.val);
      break;
    }
    case NodeType.Nil:
      break;
    default:
      car.push(cdr);
  }

  const obj = createObject<NodeValueList>(NodeType.List, car);
  obj.flags |= NodeCallableFlags.Evaluated;
  return obj;
}

export function evalCar(ctx: Context, expr: Node<NodeValueList>): AnyNode {
  const [operator, argument] = expr.val;
  const list = validateArgumentType(evalExpression(ctx, argument), [
    NodeType.List,
  ]) as Node<NodeValueList>;
  if (!list.val.length) return nil;
  const element = list.val[0];
  return element;
}

export function evalCdr(
  ctx: Context,
  expr: Node<NodeValueList>
): Node<NodeValueList> | Node<NodeNil> {
  const [operator, argument] = expr.val;
  const list = validateArgumentType(evalExpression(ctx, argument), [
    NodeType.List,
  ]) as Node<NodeValueList>;
  if (!list.val.length) return nil;
  const element = createListObject(list.val.slice(1));
  return element;
}

export function evalNthCdr(ctx: Context, expr: Node<NodeValueList>): Node<NodeValueList | NodeNil> {
  const [operator, ...args] = expr.val;
  const index = validateArgumentType(evalExpression(ctx, args[0]), [
    NodeType.Number,
  ]) as Node<NodeNumeric>;
  const list = validateArgumentType(evalExpression(ctx, args[1]), [
    NodeType.List,
  ]) as Node<NodeValueList>;
  if (!list.val.length || index.val >= list.val.length) return nil;
  const element = createListObject(list.val.slice(index.val));
  return element;
}

export function evalNth(ctx: Context, expr: Node<NodeValueList>): AnyNode {
  const [operator, ...args] = expr.val;
  const index = validateArgumentType(evalExpression(ctx, args[0]), [
    NodeType.Number,
  ]) as Node<NodeNumeric>;
  const list = validateArgumentType(evalExpression(ctx, args[1]), [
    NodeType.List,
  ]) as Node<NodeValueList>;
  if (!list.val.length || index.val >= list.val.length) return nil;
  const element = list.val[index.val];
  return element;
}

export function evalSubseq(ctx: Context, expr: Node<NodeValueList>): AnyNode {
  const [operator, ...args] = expr.val;
  validateFunctionSignature(args, 'subseq', 2);

  const seq = validateArgumentType(evalExpression(ctx, args[0]), [
    NodeType.String,
  ]) as Node<NodeSymbol>;
  const seqLength = seq.val.length;

  const start = (
    validateArgumentType(evalExpression(ctx, args[1]), [NodeType.Number]) as Node<NodeNumeric>
  ).val;

  const end = args[2]
    ? (validateArgumentType(evalExpression(ctx, args[2]), [NodeType.Number]) as Node<NodeNumeric>)
        .val
    : seqLength;

  if (start >= seqLength) return nil;
  if (end > seqLength) return nil;

  const element = createStringObject(seq.val.substring(start, end));
  return element;
}

export function evalStringUpcase(ctx: Context, expr: Node<NodeValueList>): Node<NodeSymbol> {
  const [operator, ...args] = expr.val;
  validateFunctionSignature(args, 'string-upcase', 1);
  const string = validateArgumentType(evalExpression(ctx, args[0]), [
    NodeType.String,
  ]) as Node<NodeSymbol>;
  const element = createStringObject(string.val.toUpperCase());
  return element;
}

export function evalReverse(ctx: Context, expr: Node<NodeValueList>): Node<NodeSymbol> {
  const [operator, ...args] = expr.val;
  validateFunctionSignature(args, 'string-upcase', 1);
  const string = validateArgumentType(evalExpression(ctx, args[0]), [
    NodeType.String,
  ]) as Node<NodeSymbol>;
  const reversed = [...string.val].reverse().join('');
  const element = createStringObject(reversed);
  return element;
}

export function calculateMod(a: Node<NodeNumeric>, b: Node<NodeNumeric>): NodeNumeric {
  return a.val % b.val;
}

export function calculateAdd(a: Node<NodeNumeric>, b: Node<NodeNumeric>): NodeNumeric {
  return a.val + b.val;
}

export function calculateSub(a: Node<NodeNumeric>, b: Node<NodeNumeric>): NodeNumeric {
  return a.val - b.val;
}

export function calculateDiv(a: Node<NodeNumeric>, b: Node<NodeNumeric>): NodeNumeric {
  return a.val / b.val;
}

export function calculateMult(a: Node<NodeNumeric>, b: Node<NodeNumeric>): NodeNumeric {
  return a.val * b.val;
}

export function calculatePow(a: Node<NodeNumeric>, b: Node<NodeNumeric>): NodeNumeric {
  return a.val ** b.val;
}
