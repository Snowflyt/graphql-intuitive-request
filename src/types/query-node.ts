export type QueryNode =
  | ScalarQueryNode
  | ArrayQueryNode
  | ObjectQueryNode
  | NullableQueryNode<ScalarQueryNode | ArrayQueryNode | ObjectQueryNode>;

export interface ScalarQueryNode<K extends string = any, T = any> {
  key: K;
  args: Record<string, unknown>;
  children: null;
  __type: 'scalar';
  __scalarType: T;
}

export interface ArrayQueryNode<K extends string = any, C extends QueryNode = any> {
  key: K;
  args: Record<string, unknown>;
  children: C;
  __type: 'array';
}

export interface ObjectQueryNode<K extends string = any, C extends readonly QueryNode[] = any> {
  key: K;
  args: Record<string, unknown>;
  children: C;
  __type: 'object';
}

export type NullableQueryNode<N> = N & {
  __nullable: true;
};
