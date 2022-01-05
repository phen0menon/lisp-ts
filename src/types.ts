export const enum NodeType {
  Symbol = 'Symbol',
  String = 'String',
  Number = 'Number',
  Boolean = 'Boolean',
  List = 'List',
  Func = 'Func',
}

export type NodeBool = boolean;

export type NodeSymbol = string;

export type NodeNumeric = number;

export type NodeValueList = Array<AnyNode>;

export type NodeBuiltinEval = (node: AnyNode) => AnyNode;

export type NodeFuncDef = {
  args: Node<NodeValueList>;
  body: Node<NodeValueList>;
};

export type NodeValue =
  | NodeFuncDef
  | NodeBuiltinEval
  | NodeValueList
  | NodeNumeric
  | NodeSymbol
  | NodeBool;

export enum NodeCallableFlags {
  Null,
  Builtin = 1 << 0,
  UserDefined = 1 << 1,
}
export interface Node<V extends NodeValue> {
  val: V;
  type: NodeType;
  flags: NodeCallableFlags;
}

export type AnyNode = Node<NodeValue>;

export type Symtable = Map<string, AnyNode>;

export type Scope = {
  symtable: Symtable;
  prev: Scope;
};
