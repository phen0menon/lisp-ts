import { OperationError } from 'src/errors';
import { validateArgumentType, validateFunctionSignature } from 'src/builtins';
import { createNumericObject, createStringObject } from 'src/helpers';
import { NodeType } from 'src/types';
import { collectLists } from 'src/parser';
import { evalExpression } from 'src/eval';
import { createContext, initBuiltins } from 'src/context';

describe('evalArgument', () => {
  it('should return non-list node', () => {
    const code = '(+ 1 (+ (- 5 2) (+ 2 3)))';
    const ctx = createContext({ text: code });
    initBuiltins(ctx);
    const list = collectLists(ctx)[0];
    const result = evalExpression(ctx, list);
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
