import { createTypeParser } from './type-parser';

import type {
  ObjectSelector,
  ObjectSelectorBuilder,
} from './types/ast-builder';
import type { TypeCollection } from './types/graphql-types';
import type { QueryNode } from './types/query-nodes';

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

export const createAllSelector = <
  T extends string,
  TTypes extends TypeCollection,
>(
  type: T,
  types: TTypes,
): any => {
  const typeParser = createTypeParser(types);

  const extractCoreType = (type: string, preParse: boolean = true): string => {
    let result = preParse ? typeParser.parse(type) : type;
    if (result.endsWith('!')) result = result.slice(0, -1);
    if (result.startsWith('[') && result.endsWith(']'))
      result = result.slice(1, -1);
    if (result.endsWith('!')) result = result.slice(0, -1);
    return result;
  };
  const spread = (coreType: string) =>
    types[coreType] as Record<string, string>;

  const buildSelector = (coreType: string) => (o: any) => {
    return Object.entries(spread(coreType)).map(([key, value]) => {
      const coreType = extractCoreType(value);
      return typeParser.isSimpleType(coreType)
        ? o[key]
        : o[key](buildSelector(coreType));
    });
  };

  return buildSelector(extractCoreType(type, false));
};

export const parseSelector = (selector: any): readonly QueryNode[] =>
  selector(createBuilder());

export const selectorBuilder = <T extends Record<string, any>>() => ({
  select: <R extends readonly QueryNode[]>(
    selector: ObjectSelector<T, R>,
  ): ObjectSelector<T, R> => selector,
});
