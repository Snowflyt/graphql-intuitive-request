import type { StringLiteral } from './common';
import type { Parse } from './parser';

export type GraphQLNonNull<T extends string> = `${T}!`;
export type GraphQLList<T extends string> = `[${T}]`;

export interface GraphQLEnum<S extends StringLiteral = StringLiteral> {
  __graphQLType: 'enum';
  values: readonly S[];
}

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

export type TypeRepresentation = Record<string, StringLiteral> | StringLiteral;
export type TypeCollection = Record<string, TypeRepresentation | GraphQLEnum>;
export type FunctionRepresentation = [Record<string, StringLiteral>, StringLiteral];
export type FunctionCollection = Record<string, FunctionRepresentation>;

export type ParseReturnType<T extends StringLiteral, $ extends TypeCollection> = T extends 'void'
  ? { result: void; type: 'unknown' }
  : Parse<T, $ & BaseEnvironment> extends infer R
  ? [R] extends [Array<infer U> | null]
    ? null extends R
      ? null extends U
        ? { result: U; type: 'Array<unknown | null> | null' }
        : { result: U; type: 'Array<unknown> | null' }
      : null extends U
      ? { result: U; type: 'Array<unknown | null>' }
      : { result: U; type: 'Array<unknown>' }
    : [R] extends [infer U | null]
    ? null extends R
      ? { result: U; type: 'unknown | null' }
      : { result: U; type: 'unknown' }
    : never
  : never;

export type WrapByType<
  T,
  TType extends StringLiteral,
> = TType extends 'Array<unknown | null> | null'
  ? Array<T | null> | null
  : TType extends 'Array<unknown> | null'
  ? Array<T> | null
  : TType extends 'Array<unknown | null>'
  ? Array<T | null>
  : TType extends 'Array<unknown>'
  ? Array<T>
  : TType extends 'unknown | null'
  ? T | null
  : T;

export type VariablesOf<TVariables, $> = Parse<TVariables, $ & BaseEnvironment>;
