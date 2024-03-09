import type { StringKeyOf, StringLiteral, ValueOf } from './types/common';
import type {
  BaseEnvironment,
  FunctionCollection,
  GraphQLEnum,
  TypeCollection,
} from './types/graphql-types';
import type { Parse } from './types/parser';
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

/**
 * GraphQL schema type.
 */
export type Schema<
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

/**
 * Validate a GraphQL schema.
 *
 * It just returns the input schema itself and is only used to validate in TypeScript that the
 * schema is correct.
 * @param schema The schema to validate.
 * @returns
 */
export const schema = <
  T extends
    | {
        Query?: FunctionCollection;
        Mutation?: FunctionCollection;
        Subscription?: FunctionCollection;
      }
    | TypeCollection,
>(
  schema: Schema<T>,
) => schema;

/**
 * Infer the type of a GraphQL schema in TypeScript.
 * @param _ The schema to infer.
 * @returns
 */
export const infer = <
  $ extends
    | {
        Query?: FunctionCollection;
        Mutation?: FunctionCollection;
        Subscription?: FunctionCollection;
      }
    | TypeCollection,
>(
  _: $,
) => {
  const createInfiniteProxy = <T extends object>() =>
    new Proxy({} as T, {
      get: (): any => createInfiniteProxy(),
    });
  return createInfiniteProxy<{
    [P in StringKeyOf<Omit<$, 'Query' | 'Mutation' | 'Subscription'>>]: Exclude<
      Parse<$[P], $ & BaseEnvironment>,
      null
    >;
  }>();
};

/**
 * Create a GraphQL enum type.
 * @param values The values of the enum.
 * @returns
 */
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

export const getTypesEnums = ($: TypeCollection): string[] =>
  Object.keys(Object.entries($).filter(isGraphQLEnum));
