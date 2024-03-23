import type { ParseDef } from './parser';

export type GraphQLNonNull<T extends string> = `${T}!`;
export type GraphQLList<T extends string> = `[${T}]`;

export interface GraphQLEnum<S extends string = string> {
  __graphQLType: 'enum';
  values: readonly S[];
}

export type GraphQLTypeVariant =
  | 'SIMPLE'
  | 'SIMPLE-NULLABLE'
  | 'LIST'
  | 'LIST-NULLABLE'
  | 'NULLABLE-LIST'
  | 'NULLABLE-LIST-NULLABLE';

/**
 * Get simple variant of a GraphQL type (i.e. non-nullable and list variants of a type).
 */
export type SimpleVariantOf<T extends string> =
  | T
  | `${T}!`
  | `[${T}]`
  | `[${T}]!`
  | `[${T}!]`
  | `[${T}!]!`;

/**
 * Base GraphQL type aliases.
 */
export interface BaseEnvironment {
  ID: string;
  Int: number;
  Float: number;
  String: string;
  Boolean: boolean;
}

export type ObjectDefinition = Record<string, string | [Record<string, string>, string]>;
export type ScalarDefinition = string;
export type TypeDefinition = ObjectDefinition | ScalarDefinition | GraphQLEnum;
export type TypeCollection = Record<string, TypeDefinition>;
export type OperationDefinition = ['=>', string] | [Record<string, string>, '=>', string];
export type OperationCollection = Record<string, OperationDefinition>;

export type WrapByVariant<T, TVariant extends string> = TVariant extends 'NULLABLE-LIST-NULLABLE'
  ? Array<T | null> | null
  : TVariant extends 'LIST-NULLABLE'
  ? Array<T> | null
  : TVariant extends 'NULLABLE-LIST'
  ? Array<T | null>
  : TVariant extends 'LIST'
  ? Array<T>
  : TVariant extends 'SIMPLE-NULLABLE'
  ? T | null
  : T;

export type ParseInputDef<TInputDef, $> = ParseDef<
  TInputDef,
  $ & BaseEnvironment,
  { treatNullableTypeAsOptional: true }
>['type'];
