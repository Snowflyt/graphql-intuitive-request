import { GraphQLScalarType } from 'graphql';

import { extractCoreDefinition, nullableDefinition } from './definition-utils';
import { mapObject } from './utils';

import type { StringKeyOf } from './types/common';
import type {
  BaseEnvironment,
  GraphQLEnum,
  GraphQLScalar,
  TypeCollection,
} from './types/graphql-types';
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
 * Create a GraphQL scalar type.
 * @returns
 *
 * @example
 * ```typescript
 * const dateScalar = scalar<Date>()({
 *   parse: (value) => new Date(value),
 *   serialize: (value) => value.toISOString(),
 * });
 * ```
 */
export const scalar =
  <T>() =>
  <U>({
    parse,
    serialize,
  }: {
    parse: (value: T) => U;
    serialize: (value: U) => T;
  }): GraphQLScalar<T, U> => ({ __graphQLType: 'scalar', parseValue: parse, serialize });

export const isGraphQLScalar = (
  value: unknown,
): value is GraphQLScalar<any, any> | GraphQLScalarType<any, any> =>
  (typeof value === 'object' &&
    value !== null &&
    '__graphQLType' in value &&
    value.__graphQLType === 'scalar' &&
    'parseValue' in value &&
    typeof value.parseValue === 'function' &&
    'serialize' in value &&
    typeof value.serialize === 'function') ||
  value instanceof GraphQLScalarType;

export const getTypesScalars = ($: TypeCollection): string[] =>
  Object.entries($)
    .filter(([, v]) => typeof v === 'string' || isGraphQLScalar(v))
    .map(([k]) => k);

export const transformScalarRecursively = (
  data: unknown,
  type: string,
  $: TypeCollection,
  method: 'parse' | 'serialize',
): any => {
  if (data === null || data === undefined) return data;
  if (Array.isArray(data) && type.startsWith('['))
    return data.map((v) =>
      transformScalarRecursively(v, nullableDefinition(type).slice(1, -1), $, method),
    );
  const coreType = extractCoreDefinition(type);
  const resolved = $[coreType];
  if (!resolved) return data;
  if (isGraphQLScalar(resolved))
    return method === 'parse' ? resolved.parseValue(data) : resolved.serialize(data);
  if (
    typeof data === 'object' &&
    !Array.isArray(resolved) &&
    !isGraphQLEnum(resolved) &&
    typeof resolved === 'object'
  )
    return mapObject(data as Record<string, unknown>, ([k, v]) => {
      const resolvedType = resolved[k];
      const newV = transformScalarRecursively(
        v,
        typeof resolvedType === 'string' ? resolvedType : resolvedType[1],
        $,
        method,
      );
      return [k, newV];
    });
  return data;
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
