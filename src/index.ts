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
  handleBuiltinGtOperator,
  handleBuiltinPowOperator,
} from './builtins';
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
Scope.current.symtable.set('>', createBuiltinObject(handleBuiltinGtOperator));
Scope.current.symtable.set('**', createBuiltinObject(handleBuiltinPowOperator));
Scope.current.symtable.set('setq', createBuiltinObject(handleBuiltinSetq));
Scope.current.symtable.set('print', createBuiltinObject(handleBuiltinPrint));
Scope.current.symtable.set('defun', createBuiltinObject(handleBuiltinDefun));
Scope.current.symtable.set('terpri', createBuiltinObject(handleBuiltinTerpri));

function main(): void {
  const code = readFileSync('./examples/sum.lisp', 'utf8');
  const parser = new Parser(code);
  const lists = parser.collect();
  lists.forEach(list => {
    evalExpression(list);
  });

  // console.dir(symtable, {depth: null});
}

if (require.main === module) {
  main();
}
