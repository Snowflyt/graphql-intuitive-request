import type { Merge, StringKeyOf } from './common';
import type { GraphQLEnum, GraphQLList, GraphQLNonNull } from './graphql-types';

type TryResolve<
  T extends StringKeyOf<$>,
  $,
  TOptions extends { treatNullableTypeAsOptional?: boolean },
> = $[T] extends string | Record<string, string>
  ? _Parse<$[T], $, TOptions>
  : $[T] extends GraphQLEnum<infer S>
  ? S
  : $[T];

export type ParseDef<
  TDef,
  $,
  TOptions extends { treatNullableTypeAsOptional?: boolean; acceptVoid?: boolean } = {},
> = [TOptions['acceptVoid'], TDef] extends [true, 'void']
  ? { type: void; coreType: void; variant: 'SIMPLE' }
  : [_Parse<TDef, $, TOptions>] extends [infer TType]
  ? [TType] extends [Array<infer U> | null]
    ? null extends TType
      ? null extends U
        ? { type: TType; coreType: U; variant: 'NULLABLE-LIST-NULLABLE' }
        : { type: TType; coreType: U; variant: 'LIST-NULLABLE' }
      : null extends U
      ? { type: TType; coreType: U; variant: 'NULLABLE-LIST' }
      : { type: TType; coreType: U; variant: 'LIST' }
    : [TType] extends [infer U | null]
    ? null extends TType
      ? { type: TType; coreType: U; variant: 'SIMPLE-NULLABLE' }
      : { type: TType; coreType: U; variant: 'SIMPLE' }
    : never
  : never;

type _Parse<
  TDef,
  $,
  TOptions extends { treatNullableTypeAsOptional?: boolean },
> = TDef extends Record<string, string>
  ? TOptions['treatNullableTypeAsOptional'] extends true
    ? Merge<
        {
          [P in keyof TDef as P extends `${string}?`
            ? never
            : TDef[P] extends `${string}!`
            ? P
            : never]: _Parse<TDef[P], $, TOptions>;
        },
        {
          [P in keyof TDef as P extends `${infer K}?`
            ? K
            : TDef[P] extends `${string}!`
            ? never
            : P]?: _Parse<TDef[P], $, TOptions>;
        }
      >
    : Merge<
        { [P in keyof TDef as P extends `${string}?` ? never : P]: _Parse<TDef[P], $, TOptions> },
        { [P in keyof TDef as P extends `${infer K}?` ? K : never]?: _Parse<TDef[P], $, TOptions> }
      >
  : TDef extends GraphQLNonNull<infer U extends StringKeyOf<$>>
  ? // HACK: I use this ugly `infer R` instead of just `Exclude<..., null>` because the latter will
    // cause a infinite loop when compiling—I don't know why, but it works.
    TryResolve<U, $, TOptions> extends infer R
    ? R extends U | null
      ? U
      : R
    : never
  : TDef extends StringKeyOf<$>
  ? TryResolve<TDef, $, TOptions> | null
  : TDef extends GraphQLNonNull<GraphQLList<infer U>>
  ? // HACK: I use this ugly `infer R` instead of just `Exclude<..., null>` because the latter will
    // cause a infinite loop when compiling—I don't know why, but it works.
    _Parse<U, $, TOptions>[] extends infer R
    ? R extends U | null
      ? U
      : R
    : never
  : TDef extends GraphQLList<infer U>
  ? _Parse<U, $, TOptions>[] | null
  : TDef;
