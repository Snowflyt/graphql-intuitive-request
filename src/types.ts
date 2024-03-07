import type { StringLiteral, ValueOf } from './types/common';
import type {
  BaseEnvironment,
  FunctionCollection,
  GraphQLEnum,
  TypeCollection,
} from './types/graphql-types';
import type { Validate } from './types/validator';

export const GRAPHQL_BASE_TYPES = ['ID', 'Int', 'Float', 'String', 'Boolean'] as const;

export const simpleVariantOf = (types: string[]) =>
  types.flatMap((type) => [
    type,
    `${type}!`,
    `[${type}]`,
    `[${type}]!`,
    `[${type}!]`,
    `[${type}!]!`,
  ]);

export type Types<
  T extends
    | {
        Query?: FunctionCollection;
        Mutation?: FunctionCollection;
        Subscription?: FunctionCollection;
      }
    | TypeCollection,
> = ValueOf<Omit<T, 'Query' | 'Mutation' | 'Subscription'>> extends
  | Record<string, StringLiteral>
  | StringLiteral
  | GraphQLEnum
  ? Validate<T, BaseEnvironment>
  : never;

export const types = <
  T extends
    | {
        Query?: FunctionCollection;
        Mutation?: FunctionCollection;
        Subscription?: FunctionCollection;
      }
    | TypeCollection,
>(
  types: Types<T>,
) => types;

export const enumOf = <S extends StringLiteral>(...values: S[]): GraphQLEnum<S> => ({
  __graphQLType: 'enum',
  values,
});

export const isGraphQLEnum = (value: unknown): value is GraphQLEnum =>
  typeof value === 'object' &&
  value !== null &&
  '__graphQLType' in value &&
  value.__graphQLType === 'enum' &&
  'values' in value &&
  Array.isArray(value.values) &&
  value.values.every((v) => typeof v === 'string');

export const getTypesEnums = <T extends Types<T>>($: T): string[] =>
  Object.keys(Object.entries($).filter(isGraphQLEnum));
