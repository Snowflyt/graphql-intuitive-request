import { createTypeParser } from './type-parser';

import type { ObjectSelector, ObjectSelectorBuilder } from './types/ast-builder';
import type { ParseNodes } from './types/ast-parser';
import type { TypeCollection } from './types/graphql-types';
import type { QueryNode } from './types/query-node';

const createBuilder = <T>(): ObjectSelectorBuilder<T> =>
  new Proxy(
    {},
    {
      get: (_, prop) => {
        const result: any = (selector: any) => {
          result.children = selector(createBuilder());
          return result;
        };
        result.key = prop;
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

  const spread = (coreType: string) => $[coreType] as Record<string, string>;

  const buildSelector = (coreType: string) => (o: any) => {
    return Object.entries(spread(coreType)).map(([key, value]) => {
      const coreType = parser.extractCoreType(value);
      return parser.isScalarType(coreType) ? o[key] : o[key](buildSelector(coreType));
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
