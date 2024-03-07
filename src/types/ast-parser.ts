import type { IsNever, Merge } from './common';
import type {
  ArrayQueryNode,
  BooleanQueryNode,
  NullableQueryNode,
  NumberQueryNode,
  ObjectQueryNode,
  QueryNode,
  StringQueryNode,
} from './query-node';

type GetArrayQueryNodeType<T> = T extends NullableQueryNode<infer N>
  ? GetArrayQueryNodeType<N> | null
  : T extends ArrayQueryNode<any, infer C>
  ? Array<GetArrayQueryNodeType<C>>
  : T extends StringQueryNode<any, infer AV>
  ? IsNever<AV> extends true
    ? string
    : AV
  : T extends NumberQueryNode
  ? number
  : T extends BooleanQueryNode
  ? boolean
  : never;

type GetQueryNodeType<T> = T extends NullableQueryNode<infer N>
  ? GetQueryNodeType<N> | null
  : T extends StringQueryNode<any, infer AV>
  ? IsNever<AV> extends true
    ? string
    : AV
  : T extends NumberQueryNode
  ? number
  : T extends BooleanQueryNode
  ? boolean
  : T extends ArrayQueryNode<any, infer C>
  ? C extends ObjectQueryNode<any, infer CS>
    ? Array<ParseNodes<CS>>
    : Array<GetArrayQueryNodeType<C>>
  : T extends ObjectQueryNode<any, infer C>
  ? ParseNodes<C>
  : never;

type ParseNode<T> = T extends QueryNode
  ? { [K in T['key']]: GetQueryNodeType<T> }
  : Record<never, never>;

export type ParseNodes<T extends readonly QueryNode[]> = T extends readonly [
  infer H extends QueryNode,
  ...infer TT extends readonly QueryNode[],
]
  ? Merge<ParseNode<H>, ParseNodes<TT>>
  : unknown;

export type ParseNodesByType<
  T extends readonly QueryNode[],
  TType extends `${any}`,
> = TType extends 'Array<Object | null> | null'
  ? Array<ParseNodes<T> | null> | null
  : TType extends 'Array<Object> | null'
  ? Array<ParseNodes<T>> | null
  : TType extends 'Array<Object | null>'
  ? Array<ParseNodes<T> | null>
  : TType extends 'Array<Object>'
  ? Array<ParseNodes<T>>
  : TType extends 'Object | null'
  ? ParseNodes<T> | null
  : ParseNodes<T>;
