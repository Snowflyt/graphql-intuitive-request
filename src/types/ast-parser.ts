import type { Merge } from './common';
import type {
  ArrayQueryNode,
  NullableQueryNode,
  ObjectQueryNode,
  QueryNode,
  ScalarQueryNode,
} from './query-node';

type GetArrayQueryNodeType<T> = T extends NullableQueryNode<infer N>
  ? GetArrayQueryNodeType<N> | null
  : T extends ArrayQueryNode<any, infer C>
  ? Array<GetArrayQueryNodeType<C>>
  : T extends ScalarQueryNode<any, infer U>
  ? U
  : never;

type GetQueryNodeType<T> = T extends NullableQueryNode<infer N>
  ? GetQueryNodeType<N> | null
  : T extends ScalarQueryNode<any, infer U>
  ? U
  : T extends ArrayQueryNode<any, infer C>
  ? C extends ObjectQueryNode<any, infer CS>
    ? Array<ParseNodes<CS>>
    : Array<GetArrayQueryNodeType<C>>
  : T extends ObjectQueryNode<any, infer C>
  ? ParseNodes<C>
  : never;

type ParseNode<T> = T extends QueryNode ? { [K in T['key']]: GetQueryNodeType<T> } : {};

export type ParseNodes<T extends readonly QueryNode[]> = T extends readonly [
  infer H extends QueryNode,
  ...infer TT extends readonly QueryNode[],
]
  ? Merge<ParseNode<H>, ParseNodes<TT>>
  : unknown;
