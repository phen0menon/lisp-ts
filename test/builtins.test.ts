import { OperationError } from 'src/errors';
import { validateFunctionSignature } from 'src/builtins';
import { createNumericObject, createStringObject } from 'src/helpers';

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
