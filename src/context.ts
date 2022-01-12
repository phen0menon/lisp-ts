import * as builtins from './builtins';
import { Context } from './types';
import { Scope } from './scope';
import { createBuiltinObject, nil } from './helpers';

export function createContext(props: Partial<Context> = {}): Context {
  const context = {
    scope: new Scope(),
    parsedNodes: [],
    text: '',
    textPosition: 0,
    textLength: 0,
    textLine: 0,
    textColumn: 0,
    ...props,
  } as Context;

  if (props.text) {
    context.textLength = props.text.length;
    context.textLine = 0;
    context.textColumn = 0;
    context.textPosition = 0;
  }

  return context;
}

export function initBuiltins(ctx: Context): void {
  const { symtable } = ctx.scope.get();
  symtable.set('+', createBuiltinObject(builtins.evalAdd));
  symtable.set('-', createBuiltinObject(builtins.evalSub));
  symtable.set('*', createBuiltinObject(builtins.evalMult));
  symtable.set('/', createBuiltinObject(builtins.evalDiv));
  symtable.set('%', createBuiltinObject(builtins.evalMod));
  symtable.set('<', createBuiltinObject(builtins.evalLtOperator));
  symtable.set('=', createBuiltinObject(builtins.evalEqOperator));
  symtable.set('>', createBuiltinObject(builtins.evalGtOperator));
  symtable.set('**', createBuiltinObject(builtins.evalPowOperator));
  symtable.set('setq', createBuiltinObject(builtins.evalSetq));
  symtable.set('print', createBuiltinObject(builtins.evalPrint));
  symtable.set('defun', createBuiltinObject(builtins.evalDefun));
  symtable.set('terpri', createBuiltinObject(builtins.evalTerpri));
  symtable.set('if', createBuiltinObject(builtins.evalIf));
  symtable.set('cons', createBuiltinObject(builtins.evalCons));
  symtable.set('car', createBuiltinObject(builtins.evalCar));
  symtable.set('cdr', createBuiltinObject(builtins.evalCdr));
  symtable.set('nthcdr', createBuiltinObject(builtins.evalNthCdr));
  symtable.set('nth', createBuiltinObject(builtins.evalNth));
  symtable.set('subseq', createBuiltinObject(builtins.evalSubseq));
  symtable.set('null', createBuiltinObject(builtins.evalNull));
  symtable.set('string-upcase', createBuiltinObject(builtins.evalStringUpcase));
  symtable.set('reverse', createBuiltinObject(builtins.evalReverse));
  symtable.set('nil', nil);
}
