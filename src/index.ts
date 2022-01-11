import { readFileSync } from 'fs';

import { createContext, initBuiltins } from './context';
import { Cursor } from './cursor';
import { evalExpression } from './eval';
import { createBuiltinObject, nil } from './helpers';
import { collectLists } from './parser';
import { Scope } from './scope';

function main(): void {
  const code = readFileSync('./examples/reverse.lisp', 'utf8');
  const ctx = createContext({ text: code });
  initBuiltins(ctx);
  // const cursor = new Cursor(code);
  const lists = collectLists(ctx);
  lists.forEach(list => {
    evalExpression(ctx, list);
  });
  // console.dir(Scope.current.symtable, {depth: null});
}

if (require.main === module) {
  main();
}
