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
// eslint-disable-next-line @typescript-eslint/ban-types
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
  ? ExcludeNeverKey<T, K> & ExcludeNeverKeys<T, Rest>
  : unknown;
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
 * Remove optional fields from an object.
 */
export type RequiredFieldsOnly<T> = {
  [K in keyof T as T[K] extends Required<T>[K] ? K : never]: T[K];
};

/**
 * Get the length of an object.
 */
export type ObjectLength<T> = TuplifyLiteralStringUnion<keyof T>['length'];

/**
 * Get keys not ends with `?` from an object.
 */
export type RequiredFields<T extends Record<string, string>> = keyof {
  [K in keyof T as K extends `${any}?` ? never : K]: void;
};

/**
 * Get the count of keys not ends with `?` from an object.
 */
export type RequiredFieldsCount<T extends Record<string, string>> =
  ObjectLength<{
    [K in keyof T as K extends `${any}?` ? never : K]: void;
  }>;

/**
 * Trim the end of a string.
 */
export type TrimEnd<
  T extends string,
  U extends string,
> = T extends `${infer S}${U}` ? TrimEnd<S, U> : T;

/**
 * Get the value type of an object.
 */
export type ValueOf<T> = T[keyof T];

/**
 * Assign a default type for an optional type.
 */
export type WithDefault<T, D> = unknown extends T ? D : T;

/**
 * Force a type to be a specific type.
 */
export type Cast<T, U> = T extends U ? T : never;

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
