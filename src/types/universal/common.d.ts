export type ClassType<T> = new (...args: any[]) => T;

export type Merge<A, B> = {
  [K in keyof A | keyof B]: K extends keyof A & keyof B
    ? A[K] | B[K]
    : K extends keyof B
    ? B[K]
    : K extends keyof A
    ? A[K]
    : never;
};

export interface QueryPromise<T> extends Promise<T> {
  toQueryString: () => string;
  toRequestBody: () => {
    query: string;
    variables: Record<string, any>;
  };
}

export interface SubscriptionResponse<T> {
  subscribe: (
    subscriber: (data: T) => void,
    onError?: (error: any) => void,
    onComplete?: () => void,
  ) => () => void;
  toQueryString: () => string;
  toRequestBody: () => {
    query: string;
    variables: Record<string, any>;
  };
}

export type ExtractTypeFromPrimitiveConstructor<
  T extends StringConstructor | NumberConstructor | BooleanConstructor,
> = T extends StringConstructor
  ? string
  : T extends NumberConstructor
  ? number
  : T extends BooleanConstructor
  ? boolean
  : never;

/**
 * Judge whether a type is any.
 *
 * It is a precise judgement, which means only `IsAny<any>` returns true.
 */
export type IsAny<T> = boolean extends (T extends never ? true : false)
  ? true
  : false;

/**
 * Judge whether a type is never.
 *
 * It is a precise judgement, which means only `IsNever<never>` returns true.
 */
export type IsNever<T> = [T] extends [never] ? true : false;

/**
 * Judge whether a type is unknown.
 *
 * Note that `IsUnknown<any>` returns true,
 * so make sure you have considered that before you use it.
 */
export type IsUnknown<T> = unknown extends T ? true : false;

/**
 * Judge whether a type is a function.
 *
 * Note that `IsFunction<any>` returns `boolean`,
 * and `IsFunction<never>` returns `never`,
 * so make sure you have considered that before you use it.
 */
export type IsFunction<T> = T extends Function ? true : false;

/**
 * Exclude never values from an object.
 *
 * Note that `ExcludeNeverValues<any>` and `ExcludeNeverValues<never>`
 * returns `Record<never, never>`,
 * so make sure you have considered that before you use it.
 */
export type ExcludeNeverValues<T extends Record<string, any>> =
  ExcludeNeverKeys<
    T,
    TuplifyLiteralStringUnion<Exclude<keyof T, number | symbol>>
  >;
type ExcludeNeverKeys<T extends Record<string, any>, KS> = KS extends [
  infer K extends `${any}`,
  ...infer Rest extends `${any}`[],
]
  ? Merge<ExcludeNeverKey<T, K>, ExcludeNeverKeys<T, Rest>>
  : Record<never, never>;
type ExcludeNeverKey<
  T extends Record<string, any>,
  K extends `${any}`,
> = IsNever<T[K]> extends true
  ? Record<never, never>
  : {
      [P in K]: T[P];
    };
export type TuplifyLiteralStringUnion<T> = TuplifyUnion<T>;
type TuplifyUnion<
  T,
  L = LastOf<T>,
  N = [T] extends [never] ? true : false,
> = true extends N ? [] : Push<TuplifyUnion<Exclude<T, L>>, L>;
type Push<T extends any[], V> = [...T, V];
type LastOf<T> = UnionToIntersection<
  T extends any ? () => T : never
> extends () => infer R
  ? R
  : never;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

/**
 * Judge whether a type can be null.
 *
 * Note that `CanBeNull<any>` and `CanBeNull<unknown>` return true,
 * so make sure you have considered that before you use it.
 *
 * Also, remember that `CanBeNull<null>` returns true.
 */
export type CanBeNull<T> = null extends string
  ? unknown
  : null extends T
  ? true
  : false;

/**
 * Judge whether a type can be undefined.
 *
 * Note that `CanBeUndefined<any>` and `CanBeUndefined<unknown>` return true,
 * so make sure you have considered that before you use it.
 *
 * Also, remember that `CanBeUndefined<undefined>` returns true.
 */
export type CanBeUndefined<T> = null extends string
  ? unknown
  : undefined extends T
  ? true
  : false;
