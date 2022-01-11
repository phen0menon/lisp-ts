import { UndefinedSymbolError } from './errors';
import { AnyNode, Scope as TScope, Symtable } from './types';

export class Scope {
  private current: TScope = this.create();

  get() {
    return this.current;
  }

  create(map?: Symtable): TScope {
    const scope = {
      symtable: map ?? new Map<string, AnyNode>(),
      prev: null as TScope,
    };
    return scope;
  }

  enter(map?: Symtable) {
    const scope = this.create(map);
    scope.prev = this.current;
    this.current = scope;
  }

  exit() {
    const { prev } = this.current;
    delete this.current;
    this.current = prev;
  }

  insertToSymtable(key: string, val: AnyNode): void {
    this.current.symtable.set(key, val);
  }

  getFromSymtable<T extends Object>(key: T) {
    let iter = this.current;
    while (true) {
      if (iter.symtable.has(key.toString())) return iter.symtable.get(key.toString());
      if (!iter.prev) return null;
      iter = iter.prev;
    }
  }
}

export function assertSymbolInSymtable(symtable: Symtable, symbol: AnyNode): void {
  const strSymbol = symbol.val.toString();
  if (!symtable.has(strSymbol)) {
    throw new UndefinedSymbolError(strSymbol);
  }
}

export function assertKeyNotInSymtable(symtable: Symtable, key: string) {
  if (symtable.has(key)) {
    throw new Error(`Duplicate symbol found: ${key}`);
  }
}
