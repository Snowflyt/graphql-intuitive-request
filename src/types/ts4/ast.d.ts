import type { Merge } from '../universal/common';
import type {
  ArrayBooleanQueryNode,
  ArrayNullableBooleanQueryNode,
  ArrayNullableNumberQueryNode,
  ArrayNullableObjectQueryNode,
  ArrayNullableStringQueryNode,
  ArrayNumberQueryNode,
  ArrayObjectQueryNode,
  ArrayStringQueryNode,
  BooleanQueryNode,
  NullableArrayBooleanQueryNode,
  NullableArrayNullableBooleanQueryNode,
  NullableArrayNullableNumberQueryNode,
  NullableArrayNullableObjectQueryNode,
  NullableArrayNullableStringQueryNode,
  NullableArrayNumberQueryNode,
  NullableArrayObjectQueryNode,
  NullableArrayStringQueryNode,
  NullableBooleanQueryNode,
  NullableNumberQueryNode,
  NullableObjectQueryNode,
  NullableStringQueryNode,
  NumberQueryNode,
  ObjectQueryNode,
  QueryNode,
  StringQueryNode,
} from '../universal/query-nodes';

export type QueryBuilder<T> = {
  [P in keyof T]: T[P] extends string
    ? StringQueryNode<P>
    : T[P] extends string | null
    ? NullableStringQueryNode<P>
    : T[P] extends string[]
    ? ArrayStringQueryNode<P>
    : T[P] extends Array<string | null>
    ? ArrayNullableStringQueryNode<P>
    : T[P] extends string[] | null
    ? NullableArrayStringQueryNode<P>
    : T[P] extends Array<string | null> | null
    ? NullableArrayNullableStringQueryNode<P>
    : T[P] extends number
    ? NumberQueryNode<P>
    : T[P] extends number | null
    ? NullableNumberQueryNode<P>
    : T[P] extends number[]
    ? ArrayNumberQueryNode<P>
    : T[P] extends Array<number | null>
    ? ArrayNullableNumberQueryNode<P>
    : T[P] extends number[] | null
    ? NullableArrayNumberQueryNode<P>
    : T[P] extends Array<number | null> | null
    ? NullableArrayNullableNumberQueryNode<P>
    : T[P] extends boolean
    ? BooleanQueryNode<P>
    : T[P] extends boolean | null
    ? NullableBooleanQueryNode<P>
    : T[P] extends boolean[]
    ? ArrayBooleanQueryNode<P>
    : T[P] extends Array<boolean | null>
    ? ArrayNullableBooleanQueryNode<P>
    : T[P] extends boolean[] | null
    ? NullableArrayBooleanQueryNode<P>
    : T[P] extends Array<boolean | null> | null
    ? NullableArrayNullableBooleanQueryNode<P>
    : T[P] extends Array<infer U extends object>
    ? <R extends readonly QueryNode[]>(
        selector: Selector<U, R>,
      ) => ArrayObjectQueryNode<P, R>
    : T[P] extends Array<infer U extends object | null>
    ? <R extends readonly QueryNode[]>(
        selector: Selector<U, R>,
      ) => ArrayNullableObjectQueryNode<P, R>
    : T[P] extends Array<infer U extends object> | null
    ? <R extends readonly QueryNode[]>(
        selector: Selector<U, R>,
      ) => NullableArrayObjectQueryNode<P, R>
    : T[P] extends Array<infer U extends object | null> | null
    ? <R extends readonly QueryNode[]>(
        selector: Selector<U, R>,
      ) => NullableArrayNullableObjectQueryNode<P, R>
    : T[P] extends object
    ? <R extends readonly QueryNode[]>(
        selector: Selector<T[P], R>,
      ) => ObjectQueryNode<P, R>
    : T[P] extends object | null
    ? <R extends readonly QueryNode[]>(
        selector: Selector<T[P], R>,
      ) => NullableObjectQueryNode<P, R>
    : never;
};

export type Selector<T, R> = (builder: QueryBuilder<T>) => R;

export type ParseAst<T> = T extends readonly [infer H, ...infer TT]
  ? H extends StringQueryNode<infer K>
    ? Merge<{ [P in K]: string }, ParseAst<TT>>
    : H extends NullableStringQueryNode<infer K>
    ? Merge<{ [P in K]: string | null }, ParseAst<TT>>
    : H extends ArrayStringQueryNode<infer K>
    ? Merge<{ [P in K]: string[] }, ParseAst<TT>>
    : H extends ArrayNullableStringQueryNode<infer K>
    ? Merge<{ [P in K]: Array<string | null> }, ParseAst<TT>>
    : H extends NullableArrayStringQueryNode<infer K>
    ? Merge<{ [P in K]: string[] | null }, ParseAst<TT>>
    : H extends NullableArrayNullableStringQueryNode<infer K>
    ? Merge<{ [P in K]: Array<string | null> | null }, ParseAst<TT>>
    : H extends NumberQueryNode<infer K>
    ? Merge<{ [P in K]: number }, ParseAst<TT>>
    : H extends NullableNumberQueryNode<infer K>
    ? Merge<{ [P in K]: number | null }, ParseAst<TT>>
    : H extends ArrayNumberQueryNode<infer K>
    ? Merge<{ [P in K]: number[] }, ParseAst<TT>>
    : H extends ArrayNullableNumberQueryNode<infer K>
    ? Merge<{ [P in K]: Array<number | null> }, ParseAst<TT>>
    : H extends NullableArrayNumberQueryNode<infer K>
    ? Merge<{ [P in K]: number[] | null }, ParseAst<TT>>
    : H extends NullableArrayNullableNumberQueryNode<infer K>
    ? Merge<{ [P in K]: Array<number | null> | null }, ParseAst<TT>>
    : H extends BooleanQueryNode<infer K>
    ? Merge<{ [P in K]: boolean }, ParseAst<TT>>
    : H extends NullableBooleanQueryNode<infer K>
    ? Merge<{ [P in K]: boolean | null }, ParseAst<TT>>
    : H extends ArrayBooleanQueryNode<infer K>
    ? Merge<{ [P in K]: boolean[] }, ParseAst<TT>>
    : H extends ArrayNullableBooleanQueryNode<infer K>
    ? Merge<{ [P in K]: Array<boolean | null> }, ParseAst<TT>>
    : H extends NullableArrayBooleanQueryNode<infer K>
    ? Merge<{ [P in K]: boolean[] | null }, ParseAst<TT>>
    : H extends NullableArrayNullableBooleanQueryNode<infer K>
    ? Merge<{ [P in K]: Array<boolean | null> | null }, ParseAst<TT>>
    : H extends ArrayObjectQueryNode<infer K, infer R>
    ? Merge<{ [P in K]: Array<ParseAst<R>> }, ParseAst<TT>>
    : H extends ArrayNullableObjectQueryNode<infer K, infer R>
    ? Merge<{ [P in K]: Array<ParseAst<R> | null> }, ParseAst<TT>>
    : H extends NullableArrayObjectQueryNode<infer K, infer R>
    ? Merge<{ [P in K]: Array<ParseAst<R>> | null }, ParseAst<TT>>
    : H extends NullableArrayNullableObjectQueryNode<infer K, infer R>
    ? Merge<{ [P in K]: Array<ParseAst<R> | null> | null }, ParseAst<TT>>
    : H extends ObjectQueryNode<infer K, infer R>
    ? Merge<{ [P in K]: ParseAst<R> }, ParseAst<TT>>
    : H extends NullableObjectQueryNode<infer K, infer R>
    ? Merge<{ [P in K]: ParseAst<R> | null }, ParseAst<TT>>
    : never
  : unknown;
