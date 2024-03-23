import { createTypeParser } from './type-parser';
import { requiredKeysCount } from './utils';

import type { ObjectSelector, ObjectSelectorBuilder } from './types/ast-builder';
import type { ParseNodes } from './types/ast-parser';
import type { ObjectDefinition, TypeCollection } from './types/graphql-types';
import type { QueryNode } from './types/query-node';

const createBuilder = <T>(): ObjectSelectorBuilder<T> =>
  new Proxy(
    {},
    {
      get: (_, prop) => {
        const result: any = (
          ...as:
            | [input: Record<string, string>, selector: ObjectSelector<any, any>]
            | [selector: ObjectSelector<any, any>]
        ) => {
          const [args, selector] = as.length === 1 ? [{}, as[0]] : as;
          result.args = args;
          result.children = selector(createBuilder());
          return result;
        };
        result.key = prop;
        result.args = {};
        result.children = null;
        return result;
      },
    },
  ) as any;

export const createAllSelector = <T extends string, $ extends TypeCollection>(
  type: T,
  $: $,
): any => {
  const parser = createTypeParser($);

  const spread = (coreType: string) => $[coreType] as ObjectDefinition;

  const buildSelector = (coreType: string) => (o: any) => {
    return Object.entries(spread(coreType)).map(([key, value]) => {
      if (typeof value !== 'string' && requiredKeysCount(value[0]) > 0)
        throw new Error(
          `All input fields of '${coreType}.${key}' must be optional to automatically select all fields`,
        );
      const _coreType = parser.extractCoreType(typeof value === 'string' ? value : value[1]);
      return parser.isScalarType(_coreType) ? o[key] : o[key](buildSelector(_coreType));
    });
  };

  return buildSelector(parser.extractCoreType(type));
};

export const parseSelector = (selector: any): readonly QueryNode[] => selector(createBuilder());

/**
 * Build an object selector.
 * @returns
 */
export const selectorBuilder = <T extends Record<string, any>>() => ({
  select: <const R extends readonly QueryNode[]>(selector: ObjectSelector<T, R>) =>
    selector as ObjectSelector<T, R> & {
      infer: ParseNodes<R>;
      inferAsNullable: ParseNodes<R> | null;
      inferAsList: ParseNodes<R>[];
      inferAsListNullable: (ParseNodes<R> | null)[];
      inferAsNullableList: ParseNodes<R>[] | null;
      inferAsNullableListNullable: (ParseNodes<R> | null)[] | null;
    },
});
