import { OperationError, UndefinedSymbolError } from 'src/errors';
import * as builtins from 'src/builtins';
import {
  evalArgument,
  createStringObject,
  createNumericObject,
  validateArgumentType,
  validateFunctionSignature,
  createFuncObject,
  createListObject,
  createObject,
  createNonEvaluatedListObject,
} from 'src/helpers';
import { NodeType, Node, NodeValueList, NodeFuncDef, NodeCallableFlags } from 'src/types';
import { collectLists } from 'src/parser';
import { createContext, initBuiltins } from 'src/context';

export function spyStdout() {
  const spy = { process: { stdout: null } } as any;
  beforeEach(() => {
    spy.process.stdout = jest.spyOn(process.stdout, 'write').mockImplementation((a: any) => {
      return true;
    });
  });
  afterEach(() => {
    spy.process.stdout.mockClear();
  });
  afterAll(() => {
    spy.process.stdout.mockRestore();
  });
  return spy;
}

function createContextWithBuiltins(text: string) {
  const ctx = createContext({ text });
  initBuiltins(ctx);
  return ctx;
}

describe('builtin add operator', () => {
  it('should return 2 + 3 = 5', () => {
    const text = '(+ 2 3)';
    const ctx = createContextWithBuiltins(text);
    const list = collectLists(ctx)[0];
    const result = builtins.evalAdd(ctx, list as Node<NodeValueList>);
    const trueResult = createNumericObject(5);
    expect(result).toStrictEqual(trueResult);
  });

  it('should work with nested lists', () => {
    const text = '(+ 2 (+ 2 3))';
    const ctx = createContextWithBuiltins(text);
    const list = collectLists(ctx)[0];
    const result = builtins.evalAdd(ctx, list as Node<NodeValueList>);
    const trueResult = createNumericObject(7);
    expect(result).toStrictEqual(trueResult);
  });

  it('should error when a particular argument is not a number', () => {
    const text = '(+ 2 ())';
    const ctx = createContextWithBuiltins(text);
    const list = collectLists(ctx)[0];
    expect(() => {
      builtins.evalAdd(ctx, list as Node<NodeValueList>);
    }).toThrowError(OperationError);
  });
});

describe('builtin sub operator', () => {
  it('should return 5 - 3 = 2', () => {
    const text = '(- 5 3)';
    const ctx = createContextWithBuiltins(text);
    const list = collectLists(ctx)[0];
    const result = builtins.evalSub(ctx, list as Node<NodeValueList>);
    const trueResult = createNumericObject(2);
    expect(result).toStrictEqual(trueResult);
  });

  it('should work with nested lists', () => {
    const text = '(- 10 (- 3 (+ 1 2)))';
    const ctx = createContextWithBuiltins(text);
    const list = collectLists(ctx)[0];
    const result = builtins.evalSub(ctx, list as Node<NodeValueList>);
    const trueResult = createNumericObject(10);
    expect(result).toStrictEqual(trueResult);
  });

  it('should error when a particular argument is not a number', () => {
    const text = '(- 5 ())';
    const ctx = createContextWithBuiltins(text);
    const list = collectLists(ctx)[0];
    expect(() => {
      builtins.evalSub(ctx, list as Node<NodeValueList>);
    }).toThrowError(OperationError);
  });
});

describe('builtin mult operator', () => {
  it('should return 10 * 3 = 30', () => {
    const text = '(* 10 3)';
    const ctx = createContextWithBuiltins(text);
    const list = collectLists(ctx)[0];
    const result = builtins.evalMult(ctx, list as Node<NodeValueList>);
    const trueResult = createNumericObject(30);
    expect(result).toStrictEqual(trueResult);
  });

  it('should work with nested lists', () => {
    const text = '(* 10 (- 3 (+ 1 4)))';
    const ctx = createContextWithBuiltins(text);
    const list = collectLists(ctx)[0];
    const result = builtins.evalMult(ctx, list as Node<NodeValueList>);
    const trueResult = createNumericObject(-20);
    expect(result).toStrictEqual(trueResult);
  });

  it('should error when a particular argument is not a number', () => {
    const text = '(* 5 ())';
    const ctx = createContextWithBuiltins(text);
    const list = collectLists(ctx)[0];
    expect(() => {
      builtins.evalMult(ctx, list as Node<NodeValueList>);
    }).toThrowError(OperationError);
  });
});

describe('builtin div operator', () => {
  it('should return 25 / 5 = 5', () => {
    const text = '(/ 25 5)';
    const ctx = createContextWithBuiltins(text);
    const list = collectLists(ctx)[0];
    const result = builtins.evalDiv(ctx, list as Node<NodeValueList>);
    const trueResult = createNumericObject(5);
    expect(result).toStrictEqual(trueResult);
  });

  it('should work with nested lists', () => {
    const text = '(/ 10 (- 3 (+ 1 4)))';
    const ctx = createContextWithBuiltins(text);
    const list = collectLists(ctx)[0];
    const result = builtins.evalDiv(ctx, list as Node<NodeValueList>);
    const trueResult = createNumericObject(-5);
    expect(result).toStrictEqual(trueResult);
  });

  it('should error when a particular argument is not a number', () => {
    const text = '(/ 5 ())';
    const ctx = createContextWithBuiltins(text);
    const list = collectLists(ctx)[0];
    expect(() => {
      builtins.evalDiv(ctx, list as Node<NodeValueList>);
    }).toThrowError(OperationError);
  });
});

describe('builtin mod operator', () => {
  it('should return 25 % 7 = 4', () => {
    const text = '(% 25 7)';
    const ctx = createContextWithBuiltins(text);
    const list = collectLists(ctx)[0];
    const result = builtins.evalMod(ctx, list as Node<NodeValueList>);
    const trueResult = createNumericObject(4);
    expect(result).toStrictEqual(trueResult);
  });

  it('should work with nested lists', () => {
    const text = '(% 10 (- 3 (+ 1 4)))';
    const ctx = createContextWithBuiltins(text);
    const list = collectLists(ctx)[0];
    const result = builtins.evalMod(ctx, list as Node<NodeValueList>);
    const trueResult = createNumericObject(0);
    expect(result).toStrictEqual(trueResult);
  });

  it('should error when a particular argument is not a number', () => {
    const text = '(% 5 ())';
    const ctx = createContextWithBuiltins(text);
    const list = collectLists(ctx)[0];
    expect(() => {
      builtins.evalMod(ctx, list as Node<NodeValueList>);
    }).toThrowError(OperationError);
  });
});

describe('builtin setq', () => {
  it('should set a string to the symtable', () => {
    const text = '(setq test "123")';
    const ctx = createContextWithBuiltins(text);
    const list = collectLists(ctx)[0];
    const result = builtins.evalSetq(ctx, list as Node<NodeValueList>);
    const trueResult = createStringObject('123');
    expect(ctx.scope.getFromSymtable('test')).toStrictEqual(trueResult);
  });

  it('should not work with not evaluated lists', () => {
    const text = '(setq ("test") "123")';
    const ctx = createContextWithBuiltins(text);
    const list = collectLists(ctx)[0];
    expect(() => {
      builtins.evalSetq(ctx, list as Node<NodeValueList>);
    }).toThrowError(OperationError);
  });
});

describe('builtin print', () => {
  const spy = spyStdout();

  it('should print a number 123', () => {
    const text = '(print 123)';
    const ctx = createContextWithBuiltins(text);
    const list = collectLists(ctx)[0];
    builtins.evalPrint(ctx, list as Node<NodeValueList>);
    expect(process.stdout.write).toHaveBeenCalled();
    expect(spy.process.stdout.mock.calls[0][0]).toContain('123');
  });

  it('should work with not evaluated lists', () => {
    const text = '(print "test" (+ 2 5))';
    const ctx = createContextWithBuiltins(text);
    const list = collectLists(ctx)[0];
    builtins.evalPrint(ctx, list as Node<NodeValueList>);
    expect(process.stdout.write).toHaveBeenCalled();
    expect(spy.process.stdout.mock.calls[0][0]).toContain('test');
    expect(spy.process.stdout.mock.calls[1][0]).toContain('7');
  });

  it('should throw an error when incorrect list passed', () => {
    const text = '(print (2 5))';
    const ctx = createContextWithBuiltins(text);
    const list = collectLists(ctx)[0];
    expect(() => {
      builtins.evalPrint(ctx, list as Node<NodeValueList>);
    }).toThrowError(UndefinedSymbolError);
    expect(process.stdout.write).not.toHaveBeenCalled();
  });
});

describe('builtin defun', () => {
  it('should insert a symbol "test" to the symtable', () => {
    const text = '(defun test () ())';
    const ctx = createContextWithBuiltins(text);
    const list = collectLists(ctx)[0];
    builtins.evalDefun(ctx, list as Node<NodeValueList>);

    const symbol = ctx.scope.getFromSymtable('test') as Node<NodeFuncDef>;
    expect(symbol).not.toBe(null);
    expect(symbol.type).toBe(NodeType.Func);

    const expectedArgs = createNonEvaluatedListObject([]);
    expect(symbol.val.args).toStrictEqual(expectedArgs);

    const expectedBody = createObject(
      NodeType.Func,
      [createNonEvaluatedListObject([])],
      NodeCallableFlags.Null
    );
    expect(symbol.val.body).toStrictEqual(expectedBody);

    const expectedObj = createFuncObject({ args: expectedArgs, body: expectedBody });
    expect(symbol).toStrictEqual(expectedObj);
  });
});

describe('evalArgument', () => {
  it('should return non-list node', () => {
    const text = '(+ 1 (+ (- 5 2) (+ 2 3)))';
    const ctx = createContext({ text });
    initBuiltins(ctx);
    const list = collectLists(ctx)[0];
    const result = evalArgument(ctx, list);
    const trueResult = createNumericObject(9);
    expect(result).toStrictEqual(trueResult);
  });
});

describe('validateFunctionSignature', () => {
  it('should return undefined for a valid function signature', () => {
    const nodes = [createStringObject('hello'), createNumericObject(123)];
    const result = validateFunctionSignature(nodes, 'test', 2);
    expect(result).toBeUndefined();
  });

  it('should throw operation error for an invalid function signature', () => {
    const nodes = [createStringObject('hello'), createNumericObject(123)];
    expect(() => {
      validateFunctionSignature(nodes, 'test', 3);
    }).toThrowError(OperationError);
  });
});

describe('validateArgumentType', () => {
  it('should return passed valid argument', () => {
    const node = createStringObject('test');
    const validated = validateArgumentType(node, [NodeType.String]);
    expect(validated).toBe(node);
  });

  it('should throw operation error for an invalid type of an argument', () => {
    const node = createStringObject('test');
    expect(() => {
      validateArgumentType(node, [NodeType.Number]);
    }).toThrowError(OperationError);
  });
});
