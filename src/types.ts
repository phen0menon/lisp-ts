export const enum NodeType {
  Symbol = 'Symbol',
  String = 'String',
  Number = 'Number',
  Boolean = 'Boolean',
  List = 'List',
  Func = 'Func',
}

export type NodeValueList = Array<Node>;

export type NodeBuiltinEval = (node: Node) => Node;

export type NodeFuncDef = {
  args: Node;
  body: Node;
};

export type NodeValue = NodeFuncDef | NodeBuiltinEval | NodeValueList | number | string;

export enum NodeCallableFlags {
  Null,
  Builtin = 1 << 0,
  UserDefined = 1 << 1,
}

export interface Node {
  val: NodeValue;
  type: NodeType;
  flags: NodeCallableFlags;
}

export interface SymbolTable {
  current: Record<string, Node>;
  prev: SymbolTable;
}
