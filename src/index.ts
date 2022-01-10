import {readFileSync} from 'fs';
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
} from './builtins';
import {Cursor} from './cursor';
import {evalExpression} from './eval';
import {createBuiltinObject} from './helpers';
import {Parser} from './parser';
import {Scope} from './scope';

Scope.current.symtable.set('+', createBuiltinObject(handleBuiltinAddOperator));
Scope.current.symtable.set('-', createBuiltinObject(handleBuiltinSubOperator));
Scope.current.symtable.set('*', createBuiltinObject(handleBuiltinMultOperator));
Scope.current.symtable.set('/', createBuiltinObject(handleBuiltinDivOperator));
Scope.current.symtable.set('%', createBuiltinObject(handleBuiltinModOperator));
Scope.current.symtable.set('<', createBuiltinObject(handleBuiltinLtOperator));
Scope.current.symtable.set('=', createBuiltinObject(handleBuiltinEqOperator));
Scope.current.symtable.set('>', createBuiltinObject(handleBuiltinGtOperator));
Scope.current.symtable.set('**', createBuiltinObject(handleBuiltinPowOperator));
Scope.current.symtable.set('setq', createBuiltinObject(handleBuiltinSetq));
Scope.current.symtable.set('print', createBuiltinObject(handleBuiltinPrint));
Scope.current.symtable.set('defun', createBuiltinObject(handleBuiltinDefun));
Scope.current.symtable.set('terpri', createBuiltinObject(handleBuiltinTerpri));
Scope.current.symtable.set('if', createBuiltinObject(handleBuiltinIf));
Scope.current.symtable.set('cons', createBuiltinObject(handleBuiltinCons));
Scope.current.symtable.set('car', createBuiltinObject(handleBuiltinCar));
Scope.current.symtable.set('cdr', createBuiltinObject(handleBuiltinCdr));
Scope.current.symtable.set('nthcdr', createBuiltinObject(handleBuiltinNthCdr));

function main(): void {
  const code = readFileSync('./examples/car_cdr.lisp', 'utf8');
  const cursor = new Cursor(code);
  const parser = new Parser(code, cursor);
  const lists = parser.collect();
  lists.forEach(list => {
    evalExpression(list);
  });
  // console.dir(Scope.current.symtable, {depth: null});
}

if (require.main === module) {
  main();
}
