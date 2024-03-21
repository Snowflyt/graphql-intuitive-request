/******************
 * Client related *
 ******************/
/**
 * An enhanced `Promise` used to represent a GraphQL request that can be converted to query string
 * or request body.
 */
export interface QueryPromise<T> extends Promise<T> {
  toQueryString: () => string;
  toRequestBody: () => {
    query: string;
    variables: Record<string, unknown>;
  };
}

/**
 * The return type of a subscription that can be subscribed to and converted to query string or
 * request body.
 */
export interface SubscriptionResponse<T> {
  subscribe: (
    subscriber: (data: T) => void,
    onError?: (error: any) => void,
    onComplete?: () => void,
  ) => () => void;
  toQueryString: () => string;
  toRequestBody: () => {
    query: string;
    variables: Record<string, unknown>;
  };
}

/*************
 * Constants *
 *************/
// prettier-ignore
export type Letter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M'
  | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z' 
  | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o'
  | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z';
export type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

/**************
 * Predicates *
 **************/
/**
 * Judge whether two types are exactly the same.
 */
export type Equals<T, U> = (<G>() => G extends T ? 1 : 2) extends <G>() => G extends U ? 1 : 2
  ? true
  : false;

export type And<T, U> = T extends true ? (U extends true ? true : false) : false;
export type Or<T, U> = T extends true ? true : U extends true ? true : false;

/**
 * Judge whether a type is `any` or `unknown`.
 */
export type IsTopType<T> = (any extends T ? true : false) extends true ? true : false;

/**
 * Judge whether a type is any.
 *
 * It is a precise judgement, which means only `IsAny<any>` returns true.
 */
export type IsAny<T> = boolean extends (T extends never ? true : false) ? true : false;

/**
 * Judge whether a type is unknown.
 */
export type IsUnknown<T> = (any extends T ? IsTopTypeUnknown<T> : false) extends true
  ? true
  : false;
type IsTopTypeUnknown<T> = (T extends {} ? true : false) extends false ? true : false;

/**
 * Judge whether a type is never.
 *
 * It is a precise judgement, which means only `IsNever<never>` returns true.
 */
export type IsNever<T> = [T] extends [never] ? true : false;

/**
 * Judge whether a type is a function.
 *
 * Note that `IsFunction<any>` returns `boolean`,
 * and `IsFunction<never>` returns `never`,
 * so make sure you have considered that before you use it.
 */
export type IsFunction<T> = T extends (...args: any) => unknown ? true : false;

/**
 * Judge whether a type can be null.
 *
 * Note that `CanBeNull<any>` and `CanBeNull<unknown>` return true,
 * so make sure you have considered that before you use it.
 *
 * Also, remember that `CanBeNull<null>` returns true.
 */
export type CanBeNull<T> = null extends string ? unknown : null extends T ? true : false;

/**
 * Judge whether a type can be undefined.
 *
 * Note that `CanBeUndefined<any>` and `CanBeUndefined<unknown>` return true,
 * so make sure you have considered that before you use it.
 *
 * Also, remember that `CanBeUndefined<undefined>` returns true.
 */
export type CanBeUndefined<T> = null extends string ? unknown : undefined extends T ? true : false;

/*****************
 * Utility types *
 *****************/
/**
 * Get only the string keys of an object type.
 */
export type StringKeyOf<O> = keyof O & string;

/**
 * Exclude never values from an object.
 *
 * Note that `ExcludeNeverValues<any>` and `ExcludeNeverValues<never>` returns `unknown`,
 * so make sure you have considered that before you use it.
 */
export type ExcludeNeverValues<T extends Record<string, any>> = ExcludeNeverKeys<
  T,
  TuplifyLiteralStringUnion<Exclude<keyof T, number | symbol>>
>;
type ExcludeNeverKeys<T extends Record<string, any>, KS> = KS extends [
  infer K extends `${any}`,
  ...infer Rest extends `${any}`[],
]
  ? SimpleMerge<ExcludeNeverKey<T, K>, ExcludeNeverKeys<T, Rest>>
  : unknown;
type ExcludeNeverKey<T extends Record<string, any>, K extends `${any}`> = IsNever<T[K]> extends true
  ? {}
  : { [P in K]: T[P] };
export type TuplifyLiteralStringUnion<T> = TuplifyUnion<T>;
type TuplifyUnion<T, L = LastOf<T>, N = [T] extends [never] ? true : false> = true extends N
  ? []
  : Push<TuplifyUnion<Exclude<T, L>>, L>;
type Push<T extends any[], V> = [...T, V];
type LastOf<T> = UnionToIntersection<T extends any ? () => T : never> extends () => infer R
  ? R
  : never;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

/**
 * Remove optional fields from an object.
 */
export type RequiredFieldsOnly<T> = {
  [K in keyof T as T[K] extends Required<T>[K] ? K : never]: T[K];
};

/**
 * Get keys of entries that value ends with `!` and key does not end with `?` from an object.
 */
export type RequiredFields<I> = keyof {
  [K in keyof I as K extends `${string}?` ? never : I[K] extends `${string}!` ? K : never]: void;
};

/**
 * Get the count of entries that value ends with `!` and key does not end with `?` from an object.
 */
export type RequiredFieldsCount<I> = Obj.Length<{
  [K in keyof I as K extends `${string}?` ? never : I[K] extends `${string}!` ? K : never]: void;
}>;

/**
 * Merge two objects together. Optional keys are not considered.
 */
export type SimpleMerge<L, R> = _Id<{
  [P in keyof L | keyof R]: P extends keyof R ? R[P] : P extends keyof L ? L[P] : never;
}>;

/**
 * Merge multiple objects together. Optional keys are not considered.
 */
export type SimpleSpread<A, B, C = {}, D = {}, E = {}, F = {}, G = {}, H = {}, I = {}> = _Id<
  A & B & C & D & E & F & G & H & I
>;

/**
 * Merge two objects together. Optional keys are considered.
 *
 * @example
 * ```typescript
 * type A = { a: number; b?: string };
 * type B = { a: boolean; c: string };
 * type R = Merge<A, B>;
 * //   ^?: { a: boolean; b?: string; c: string }
 * ```
 */
export type Merge<L, R> = _Id<
  Pick<L, Exclude<keyof L, keyof R>> &
    Pick<R, Exclude<keyof R, _OptionalKeyOf<R>>> &
    Pick<R, Exclude<_OptionalKeyOf<R>, keyof L>> &
    _SpreadProperties<L, R, _OptionalKeyOf<R> & keyof L>
>;
type _OptionalKeyOf<O> = { [K in keyof O]-?: {} extends { [P in K]: O[K] } ? K : never }[keyof O];
type _SpreadProperties<L, R, K extends keyof L & keyof R> = {
  [P in K]: L[P] | Exclude<R[P], undefined>;
};
/**
 * Evaluate the type of an object eagerly to make type information more readable.
 */
export type _Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;

/********************
 * Object utilities *
 ********************/
export namespace Obj {
  /**
   * Get the value of a key from an object type, or `D` (defaults to `never`) if the key does not
   * exist.
   */
  export type Get<O, K, D = never> = K extends keyof O ? O[K] : D;

  /**
   * Get the length of an object.
   */
  export type Length<T> = TuplifyLiteralStringUnion<keyof T>['length'];

  /**
   * Judge whether an object is empty.
   */
  export type IsEmpty<O> = Length<O> extends 0 ? true : false;

  export type IfEmpty<O, T, F = O> = IsEmpty<O> extends true ? T : F;
  export type IfNotEmpty<O, T, F = O> = IsEmpty<O> extends true ? F : T;
}

/********************
 * String utilities *
 ********************/
export namespace Str {
  export type Head<S extends string> = S extends `${infer H}${string}` ? H : never;
  export type Tail<S extends string> = S extends `${string}${infer T}` ? T : never;

  export type IsEmpty<S extends string> = S extends '' ? true : false;

  /**
   * Trim the end of a string.
   */
  export type TrimEnd<T extends string, U extends string> = T extends `${infer S}${U}`
    ? TrimEnd<S, U>
    : T;
}
