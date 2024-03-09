import type { Merge, StringKeyOf, StringLiteral } from './common';
import type { GraphQLEnum, GraphQLList, GraphQLNonNull } from './graphql-types';

type TryResolve<T extends StringKeyOf<$>, $> = $[T] extends
  | StringLiteral
  | Record<string, StringLiteral>
  ? Parse<$[T], $>
  : $[T] extends GraphQLEnum<infer S>
  ? S
  : $[T];

export type Parse<T, $> = T extends Record<string, StringLiteral>
  ? Merge<
      { [P in keyof T as P extends `${string}?` ? never : P]: Parse<T[P], $> },
      { [P in keyof T as P extends `${infer K}?` ? K : never]?: Parse<T[P], $> }
    >
  : T extends GraphQLNonNull<infer U extends StringKeyOf<$>>
  ? // HACK: I use this ugly `infer R` instead of just `Exclude<..., null>` because the latter will
    // cause a infinite loop when compiling—I don't know why, but it works.
    TryResolve<U, $> extends infer R
    ? R extends U | null
      ? U
      : R
    : never
  : T extends StringKeyOf<$>
  ? TryResolve<T, $> | null
  : T extends GraphQLNonNull<GraphQLList<infer U>>
  ? // HACK: I use this ugly `infer R` instead of just `Exclude<..., null>` because the latter will
    // cause a infinite loop when compiling—I don't know why, but it works.
    Parse<U, $>[] extends infer R
    ? R extends U | null
      ? U
      : R
    : never
  : T extends GraphQLList<infer U>
  ? Parse<U, $>[] | null
  : T;
