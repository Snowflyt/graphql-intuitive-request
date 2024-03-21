import type { Merge, StringKeyOf, StringLiteral } from './common';
import type { GraphQLEnum, GraphQLList, GraphQLNonNull } from './graphql-types';

type TryResolve<
  T extends StringKeyOf<$>,
  $,
  TFlags extends { treatNullableTypeAsOptional: boolean } = { treatNullableTypeAsOptional: false },
> = $[T] extends StringLiteral | Record<string, StringLiteral>
  ? Parse<$[T], $, TFlags>
  : $[T] extends GraphQLEnum<infer S>
  ? S
  : $[T];

export type Parse<
  T,
  $,
  TFlags extends { treatNullableTypeAsOptional: boolean } = { treatNullableTypeAsOptional: false },
> = T extends Record<string, StringLiteral>
  ? TFlags['treatNullableTypeAsOptional'] extends true
    ? Merge<
        {
          [P in keyof T as P extends `${string}?`
            ? never
            : T[P] extends `${string}!`
            ? P
            : never]: Parse<T[P], $, TFlags>;
        },
        {
          [P in keyof T as P extends `${infer K}?`
            ? K
            : T[P] extends `${string}!`
            ? never
            : P]?: Parse<T[P], $, TFlags>;
        }
      >
    : Merge<
        { [P in keyof T as P extends `${string}?` ? never : P]: Parse<T[P], $, TFlags> },
        { [P in keyof T as P extends `${infer K}?` ? K : never]?: Parse<T[P], $, TFlags> }
      >
  : T extends GraphQLNonNull<infer U extends StringKeyOf<$>>
  ? // HACK: I use this ugly `infer R` instead of just `Exclude<..., null>` because the latter will
    // cause a infinite loop when compiling—I don't know why, but it works.
    TryResolve<U, $, TFlags> extends infer R
    ? R extends U | null
      ? U
      : R
    : never
  : T extends StringKeyOf<$>
  ? TryResolve<T, $, TFlags> | null
  : T extends GraphQLNonNull<GraphQLList<infer U>>
  ? // HACK: I use this ugly `infer R` instead of just `Exclude<..., null>` because the latter will
    // cause a infinite loop when compiling—I don't know why, but it works.
    Parse<U, $, TFlags>[] extends infer R
    ? R extends U | null
      ? U
      : R
    : never
  : T extends GraphQLList<infer U>
  ? Parse<U, $, TFlags>[] | null
  : T;
