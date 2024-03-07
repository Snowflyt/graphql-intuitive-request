export type QueryNode =
  | PrimitiveQueryNode
  | ArrayQueryNode
  | ObjectQueryNode
  | NullableQueryNode<PrimitiveQueryNode | ArrayQueryNode | ObjectQueryNode>;

export interface StringQueryNode<K extends string = any, TAvailableValues extends string = string> {
  key: K;
  children: null;
  availableValues: TAvailableValues;
  __type: 'string';
}

export interface NumberQueryNode<K extends string = any> {
  key: K;
  children: null;
  __type: 'number';
}

export interface BooleanQueryNode<K extends string = any> {
  key: K;
  children: null;
  __type: 'boolean';
}

export type PrimitiveQueryNode = StringQueryNode | NumberQueryNode | BooleanQueryNode;

export interface ArrayQueryNode<K extends string = any, C extends QueryNode = any> {
  key: K;
  children: C;
  __type: 'array';
}

export interface ObjectQueryNode<K extends string = any, C extends readonly QueryNode[] = any> {
  key: K;
  children: C;
  __type: 'object';
}

export type NullableQueryNode<N> = N & {
  __nullable: true;
};
