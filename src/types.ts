import { scope } from 'arktype';

import type { ValueOf } from './types/common';
import type {
  FunctionCollection,
  TypeCollection,
  TypesOptions,
} from './types/graphql-types';

export const graphQLBaseTypes = ['ID', 'Int', 'Float', 'String', 'Boolean'];
export const simpleVariantOf = (types: string[]) =>
  types.flatMap((type) => [
    type,
    `${type}!`,
    `[${type}]`,
    `[${type}!]`,
    `[${type}!]!`,
  ]);

const graphQLDefaults = scope({
  True: 'true',
  False: 'false',
  Null: 'null',

  ID: 'string | "ID"',
  Int: 'number | 0',
  Float: 'number | 1',
  String: 'string | "String"',
  Boolean: 'boolean',
}).compile();
export const typesOptions: TypesOptions = {
  standard: false,
  includes: [graphQLDefaults],
};

export type Types<
  T extends
    | {
        Query?: FunctionCollection;
        Mutation?: FunctionCollection;
        Subscription?: FunctionCollection;
      }
    | TypeCollection,
> = ValueOf<Omit<T, 'Query' | 'Mutation' | 'Subscription'>> extends
  | Record<string, `${any}`>
  | `${any}`
  ? Parameters<typeof scope<T, TypesOptions>>[0]
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

export const getTypesEnums = <T extends Types<T>>(types: T): string[] =>
  Object.keys(
    Object.entries(types).filter(
      ([, type]) => typeof type === 'string' && type.includes('|'),
    ),
  );
