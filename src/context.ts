import {
  handleBuiltinAddOperator,
  handleBuiltinSubOperator,
  handleBuiltinMultOperator,
  handleBuiltinDivOperator,
  handleBuiltinModOperator,
  handleBuiltinSetq,
  handleBuiltinDefun,
  handleBuiltinPrint,
  handleBuiltinTerpri,
  handleBuiltinLtOperator,
  handleBuiltinEqOperator,
  handleBuiltinGtOperator,
  handleBuiltinPowOperator,
  handleBuiltinIf,
  handleBuiltinCons,
  handleBuiltinCar,
  handleBuiltinCdr,
  handleBuiltinNthCdr,
  handleBuiltinNth,
  handleBuiltinNull,
  handleBuiltinSubseq,
  handleBuiltinStringUpcase,
  handleBuiltinReverse,
} from './builtins';
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
  symtable.set('+', createBuiltinObject(handleBuiltinAddOperator));
  symtable.set('-', createBuiltinObject(handleBuiltinSubOperator));
  symtable.set('*', createBuiltinObject(handleBuiltinMultOperator));
  symtable.set('/', createBuiltinObject(handleBuiltinDivOperator));
  symtable.set('%', createBuiltinObject(handleBuiltinModOperator));
  symtable.set('<', createBuiltinObject(handleBuiltinLtOperator));
  symtable.set('=', createBuiltinObject(handleBuiltinEqOperator));
  symtable.set('>', createBuiltinObject(handleBuiltinGtOperator));
  symtable.set('**', createBuiltinObject(handleBuiltinPowOperator));
  symtable.set('setq', createBuiltinObject(handleBuiltinSetq));
  symtable.set('print', createBuiltinObject(handleBuiltinPrint));
  symtable.set('defun', createBuiltinObject(handleBuiltinDefun));
  symtable.set('terpri', createBuiltinObject(handleBuiltinTerpri));
  symtable.set('if', createBuiltinObject(handleBuiltinIf));
  symtable.set('cons', createBuiltinObject(handleBuiltinCons));
  symtable.set('car', createBuiltinObject(handleBuiltinCar));
  symtable.set('cdr', createBuiltinObject(handleBuiltinCdr));
  symtable.set('nthcdr', createBuiltinObject(handleBuiltinNthCdr));
  symtable.set('nth', createBuiltinObject(handleBuiltinNth));
  symtable.set('subseq', createBuiltinObject(handleBuiltinSubseq));
  symtable.set('null', createBuiltinObject(handleBuiltinNull));
  symtable.set('string-upcase', createBuiltinObject(handleBuiltinStringUpcase));
  symtable.set('reverse', createBuiltinObject(handleBuiltinReverse));
  symtable.set('nil', nil);
}
