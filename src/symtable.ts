import {Node} from './types';
import {UndefinedSymbolError} from './errors';

export const symtable = new Map<string, Node>();

export function assertIsInSymtable(symbol: Node) {
  if (!symtable.has(symbol.val.toString())) {
    throw new UndefinedSymbolError(symbol.val.toString());
  }
}
