export const enum NodeType {
  Symbol = 'Symbol',
  String = 'String',
  Number = 'Number',
  Boolean = 'Boolean',
  List = 'List',
  Func = 'Func',
  Nil = 'Nil',
}

export type NodeValue =
  | NodeFuncDef
  | NodeBuiltinEval
  | NodeValueList
  | NodeNumeric
  | NodeSymbol
  | NodeBool
  | NodeNil;

export type InterpreterLocation = {
  line: number;
  column: number;
};

export enum NodeCallableFlags {
  Null,
  Builtin = 1 << 0,
  UserDefined = 1 << 1,
  Lambda = 1 << 2,
  Evaluated = 1 << 3,
}

export interface Node<V extends NodeValue> {
  val: V;
  type: NodeType;
  flags: NodeCallableFlags;
}

export type NodeNil = 'nil';

export type NodeBool = boolean;

export type NodeSymbol = string;

export type NodeNumeric = number;

export type NodeValueList = Array<AnyNode>;

export type NodeBuiltinEval = (node: AnyNode) => AnyNode;

export type NodeFuncDef = {
  args: Node<NodeValueList>;
  body: Node<NodeValueList>;
};

export type AnyNode = Node<NodeValue>;

export type Symtable = Map<string, AnyNode>;

export type Scope = {
  symtable: Symtable;
  prev: Scope;
};

export const enum Symbols {
  LPAR = '(',
  RPAR = ')',
  SPACE = ' ',
  NSPACE = '',
  CR = '\r',
  LF = '\n',
  DQUOTE = '"',
}
