import type {
  CanBeNull,
  CanBeUndefined,
  ExcludeNeverValues,
  IsAny,
  IsFunction,
  IsNever,
  IsUnknown,
} from './common';
import type {
  ArrayQueryNode,
  BooleanQueryNode,
  NullableQueryNode,
  NumberQueryNode,
  ObjectQueryNode,
  QueryNode,
  StringQueryNode,
} from './query-node';

export type ObjectSelectorBuilder<T> = ExcludeNeverValues<{
  [K in Exclude<keyof T, number | symbol>]: GetQueryNode<K, T[K]>;
}>;

export type ObjectSelector<T extends object, R extends readonly QueryNode[]> = (
  builder: ObjectSelectorBuilder<T>,
) => R;

type IsPrimitiveOrNestedPrimitiveArray<T> = T extends string | number | boolean | null
  ? true
  : T extends Array<infer E> | null
  ? IsPrimitiveOrNestedPrimitiveArray<E> extends true
    ? true
    : false
  : false;

type GetQueryNode<
  K extends string,
  V,
  TIsLastNullable extends boolean = false,
> = IsAny<V> extends true
  ? unknown
  : IsUnknown<V> extends true
  ? unknown
  : IsNever<V> extends true
  ? never
  : IsFunction<V> extends true
  ? never
  : CanBeUndefined<V> extends true
  ? GetQueryNode<K, Exclude<V, undefined>, true> extends infer R
    ? R extends (...args: any[]) => unknown
      ? R
      : NullableQueryNode<R>
    : never
  : CanBeNull<V> extends true
  ? GetQueryNode<K, Exclude<V, null>, true> extends infer R
    ? R extends (...args: any[]) => unknown
      ? R
      : NullableQueryNode<R>
    : never
  : [V] extends [Array<infer E>]
  ? IsPrimitiveOrNestedPrimitiveArray<E> extends true
    ? GetQueryNode<K, E> extends QueryNode
      ? IsNever<GetQueryNode<K, E>> extends true
        ? never
        : ArrayQueryNode<K, GetQueryNode<K, E>>
      : never
    : E extends object
    ? E extends Array<any>
      ? never
      : TIsLastNullable extends true
      ? <const R extends readonly QueryNode[]>(
          definition: ObjectSelector<E, R>,
        ) => NullableQueryNode<ArrayQueryNode<K, ObjectQueryNode<K, R>>>
      : <const R extends readonly QueryNode[]>(
          definition: ObjectSelector<E, R>,
        ) => ArrayQueryNode<K, ObjectQueryNode<K, R>>
    : never
  : [V] extends [object]
  ? TIsLastNullable extends true
    ? <const R extends readonly QueryNode[]>(
        definition: ObjectSelector<V, R>,
      ) => NullableQueryNode<ObjectQueryNode<K, R>>
    : <const R extends readonly QueryNode[]>(
        definition: ObjectSelector<V, R>,
      ) => ObjectQueryNode<K, R>
  : [V] extends [string]
  ? StringQueryNode<K, V>
  : [V] extends [number]
  ? NumberQueryNode<K>
  : [V] extends [boolean]
  ? BooleanQueryNode<K>
  : never;
