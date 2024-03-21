import type { StringKeyOf } from './types/common';
import type { BaseEnvironment, GraphQLEnum, TypeCollection } from './types/graphql-types';
import type { ParseDef } from './types/parser';
import type { ValidateSchema } from './types/validator';

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

/**
 * Validate a GraphQL schema.
 *
 * It just returns the input schema itself and is only used to validate in TypeScript that the
 * schema is correct.
 * @param schema The schema to validate.
 * @returns
 */
export const schema = <T>(schema: ValidateSchema<T>) => schema;

/**
 * Infer the type of a GraphQL schema in TypeScript.
 * @param _ The schema to infer.
 * @returns
 */
export const infer = <$>(_: $) => {
  const createInfiniteProxy = <T extends object>() =>
    new Proxy({} as T, {
      get: (): any => createInfiniteProxy(),
    });
  return createInfiniteProxy<{
    [P in StringKeyOf<Omit<$, 'Query' | 'Mutation' | 'Subscription'>>]: Exclude<
      ParseDef<$[P], $ & BaseEnvironment>['type'],
      null
    >;
  }>();
};

/**
 * Create a GraphQL enum type.
 * @param values The values of the enum.
 * @returns
 */
export const enumOf = <S extends string>(...values: S[]): GraphQLEnum<S> => ({
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

export const getTypesEnums = ($: TypeCollection): string[] =>
  Object.keys(Object.entries($).filter(isGraphQLEnum));
