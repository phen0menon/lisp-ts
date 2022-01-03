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
} from './builtins';
import {evalExpression} from './eval';
import {createBuiltinObject} from './helpers';
import {Parser} from './parser';
import {symtable} from './symtable';

symtable.set('+', createBuiltinObject(handleBuiltinAddOperator));
symtable.set('-', createBuiltinObject(handleBuiltinSubOperator));
symtable.set('*', createBuiltinObject(handleBuiltinMultOperator));
symtable.set('/', createBuiltinObject(handleBuiltinDivOperator));
symtable.set('%', createBuiltinObject(handleBuiltinModOperator));
symtable.set('setq', createBuiltinObject(handleBuiltinSetq));
symtable.set('print', createBuiltinObject(handleBuiltinPrint));
symtable.set('defun', createBuiltinObject(handleBuiltinDefun));

function main(): void {
  const code = readFileSync('./examples/basic.lisp', 'utf8');
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
