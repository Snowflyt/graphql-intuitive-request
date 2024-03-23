import type {
  CanBeNull,
  CanBeUndefined,
  ExcludeNeverValues,
  IsAny,
  IsFunction,
  IsNever,
  IsUnknown,
  Obj,
  StringKeyOf,
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
  [K in StringKeyOf<T>]: GetQueryNode<K, T[K]>;
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
  TLastInput = never,
> = IsAny<V> extends true
  ? unknown
  : IsUnknown<V> extends true
  ? unknown
  : IsNever<V> extends true
  ? never
  : IsFunction<V> extends true
  ? never
  : CanBeUndefined<V> extends true
  ? GetQueryNode<K, Exclude<V, undefined>, true, TLastInput> extends infer R
    ? R extends (...args: any[]) => unknown
      ? R
      : IsNever<TLastInput> extends true
      ? NullableQueryNode<R>
      : Obj.IsAllOptional<TLastInput> extends true
      ? NullableQueryNode<R> & ((input: TLastInput) => NullableQueryNode<R>)
      : (input: TLastInput) => NullableQueryNode<R>
    : never
  : CanBeNull<V> extends true
  ? GetQueryNode<K, Exclude<V, null>, true, TLastInput> extends infer R
    ? R extends (...args: any[]) => unknown
      ? R
      : IsNever<TLastInput> extends true
      ? NullableQueryNode<R>
      : Obj.IsAllOptional<TLastInput> extends true
      ? NullableQueryNode<R> & ((input: TLastInput) => NullableQueryNode<R>)
      : (input: TLastInput) => NullableQueryNode<R>
    : never
  : [V] extends [[infer TInput, infer TOutput]]
  ? GetQueryNode<K, TOutput, false, TInput>
  : [V] extends [Array<infer E>]
  ? IsPrimitiveOrNestedPrimitiveArray<E> extends true
    ? GetQueryNode<K, E> extends QueryNode
      ? IsNever<GetQueryNode<K, E>> extends true
        ? never
        : IsNever<TLastInput> extends true
        ? ArrayQueryNode<K, GetQueryNode<K, E>>
        : Obj.IsAllOptional<TLastInput> extends true
        ? ArrayQueryNode<K, GetQueryNode<K, E>> &
            ((input: TLastInput) => ArrayQueryNode<K, GetQueryNode<K, E>>)
        : (input: TLastInput) => ArrayQueryNode<K, GetQueryNode<K, E>>
      : never
    : E extends object
    ? E extends Array<any>
      ? never
      : TIsLastNullable extends true
      ? IsNever<TLastInput> extends true
        ? <const R extends readonly QueryNode[]>(
            definition: ObjectSelector<E, R>,
          ) => NullableQueryNode<ArrayQueryNode<K, ObjectQueryNode<K, R>>>
        : Obj.IsAllOptional<TLastInput> extends true
        ? {
            <const R extends readonly QueryNode[]>(
              input: TLastInput,
              definition: ObjectSelector<E, R>,
            ): NullableQueryNode<ArrayQueryNode<K, ObjectQueryNode<K, R>>>;
            <const R extends readonly QueryNode[]>(
              definition: ObjectSelector<E, R>,
            ): NullableQueryNode<ArrayQueryNode<K, ObjectQueryNode<K, R>>>;
          }
        : <const R extends readonly QueryNode[]>(
            input: TLastInput,
            definition: ObjectSelector<E, R>,
          ) => NullableQueryNode<ArrayQueryNode<K, ObjectQueryNode<K, R>>>
      : IsNever<TLastInput> extends true
      ? <const R extends readonly QueryNode[]>(
          definition: ObjectSelector<E, R>,
        ) => ArrayQueryNode<K, ObjectQueryNode<K, R>>
      : Obj.IsAllOptional<TLastInput> extends true
      ? {
          <const R extends readonly QueryNode[]>(
            input: TLastInput,
            definition: ObjectSelector<E, R>,
          ): ArrayQueryNode<K, ObjectQueryNode<K, R>>;
          <const R extends readonly QueryNode[]>(definition: ObjectSelector<E, R>): ArrayQueryNode<
            K,
            ObjectQueryNode<K, R>
          >;
        }
      : <const R extends readonly QueryNode[]>(
          input: TLastInput,
          definition: ObjectSelector<E, R>,
        ) => ArrayQueryNode<K, ObjectQueryNode<K, R>>
    : never
  : [V] extends [object]
  ? TIsLastNullable extends true
    ? IsNever<TLastInput> extends true
      ? <const R extends readonly QueryNode[]>(
          definition: ObjectSelector<V, R>,
        ) => NullableQueryNode<ObjectQueryNode<K, R>>
      : Obj.IsAllOptional<TLastInput> extends true
      ? {
          <const R extends readonly QueryNode[]>(
            input: TLastInput,
            definition: ObjectSelector<V, R>,
          ): NullableQueryNode<ObjectQueryNode<K, R>>;
          <const R extends readonly QueryNode[]>(
            definition: ObjectSelector<V, R>,
          ): NullableQueryNode<ObjectQueryNode<K, R>>;
        }
      : <const R extends readonly QueryNode[]>(
          input: TLastInput,
          definition: ObjectSelector<V, R>,
        ) => NullableQueryNode<ObjectQueryNode<K, R>>
    : IsNever<TLastInput> extends true
    ? <const R extends readonly QueryNode[]>(
        definition: ObjectSelector<V, R>,
      ) => ObjectQueryNode<K, R>
    : Obj.IsAllOptional<TLastInput> extends true
    ? {
        <const R extends readonly QueryNode[]>(
          input: TLastInput,
          definition: ObjectSelector<V, R>,
        ): ObjectQueryNode<K, R>;
        <const R extends readonly QueryNode[]>(definition: ObjectSelector<V, R>): ObjectQueryNode<
          K,
          R
        >;
      }
    : <const R extends readonly QueryNode[]>(
        input: TLastInput,
        definition: ObjectSelector<V, R>,
      ) => ObjectQueryNode<K, R>
  : [V] extends [string]
  ? TIsLastNullable extends true
    ? StringQueryNode<K, V>
    : IsNever<TLastInput> extends true
    ? StringQueryNode<K, V>
    : Obj.IsAllOptional<TLastInput> extends true
    ? StringQueryNode<K, V> & ((input: TLastInput) => StringQueryNode<K, V>)
    : (input: TLastInput) => StringQueryNode<K, V>
  : [V] extends [number]
  ? TIsLastNullable extends true
    ? NumberQueryNode<K>
    : IsNever<TLastInput> extends true
    ? NumberQueryNode<K>
    : Obj.IsAllOptional<TLastInput> extends true
    ? NumberQueryNode<K> & ((input: TLastInput) => NumberQueryNode<K>)
    : (input: TLastInput) => NumberQueryNode<K>
  : [V] extends [boolean]
  ? TIsLastNullable extends true
    ? BooleanQueryNode<K>
    : IsNever<TLastInput> extends true
    ? BooleanQueryNode<K>
    : Obj.IsAllOptional<TLastInput> extends true
    ? BooleanQueryNode<K> & ((input: TLastInput) => BooleanQueryNode<K>)
    : (input: TLastInput) => BooleanQueryNode<K>
  : never;
