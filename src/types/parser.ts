import type { Merge, StringKeyOf, StringLiteral } from './common';
import type { GraphQLNonNull, GraphQLList, GraphQLEnum } from './graphql-types';

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
  ? TryResolve<U, $>
  : T extends StringKeyOf<$>
  ? TryResolve<T, $> | null
  : T extends GraphQLNonNull<GraphQLList<infer U>>
  ? Parse<U, $>[]
  : T extends GraphQLList<infer U>
  ? Parse<U, $>[] | null
  : T;
