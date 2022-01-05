import {UndefinedSymbolError} from './errors';
import {AnyNode, Scope as TScope} from './types';

export class Scope {
  static current: TScope = this.create();

  static create(): TScope {
    const scope = {
      symtable: new Map<string, AnyNode>(),
      prev: null as TScope,
    };
    return scope;
  }

  static enter() {
    const scope = this.create();
    scope.prev = this.current;
    this.current = scope;
  }

  static exit() {
    const {prev} = this.current;
    delete this.current;
    this.current = prev;
  }

  static insertToSymtable(key: string, val: AnyNode): void {
    this.current.symtable.set(key, val);
  }

  static getFromSymtable(key: string) {
    let iter = this.current;
    while (true) {
      if (iter.symtable.has(key)) return iter.symtable.get(key);
      if (!iter.prev) return null;
      iter = iter.prev;
    }
  }
}

export function assertSymbolInSymtable(symbol: AnyNode) {
  const {symtable} = Scope.current;
  const strSymbol = symbol.val.toString();
  if (!symtable.has(strSymbol)) {
    throw new UndefinedSymbolError(strSymbol);
  }
}

export function assertKeyNotInSymtable(key: string) {
  const {symtable} = Scope.current;
  if (symtable.has(key)) {
    throw new Error(`Duplicate symbol found: ${key}`);
  }
}
