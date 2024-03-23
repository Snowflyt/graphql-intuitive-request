import { parseSelector } from './selector';
import { createTypeParser } from './type-parser';
import { mapObjectValues } from './utils';

import type { ObjectSelector } from './types/ast-builder';
import type { TypeCollection } from './types/graphql-types';
import type { QueryNode } from './types/query-node';

const path2variableName = (path: readonly string[]) => '__var__' + path.join('__sep__');

const buildQueryAst = (
  ast: readonly QueryNode[],
  indent: number,
  type: string,
  $: TypeCollection,
  path: readonly string[] = [],
): { queryString: string; variables: Record<string, { type: string; value: unknown }> } => {
  let _variables: Record<string, { type: string; value: unknown }> = {};
  const queryString = `{\n${ast
    .map(
      (node) =>
        `${' '.repeat(indent)}${node.key}${
          Object.keys(node.args).length > 0
            ? '(' +
              Object.entries(node.args)
                .map(([key, value]) => {
                  const variableName = path2variableName([...path, node.key, key]);
                  const valueType = $[type][node.key as never][0][key] as string;
                  _variables[variableName] = { type: valueType, value };
                  return `${key}: $${variableName}`;
                })
                .join(', ') +
              ')'
            : ''
        }${
          node.children !== null
            ? ' ' +
              (() => {
                const { queryString, variables } = buildQueryAst(
                  node.children as QueryNode[],
                  indent + 2,
                  createTypeParser($).extractCoreType(
                    Array.isArray($[type][node.key as never])
                      ? $[type][node.key as never][1]
                      : $[type][node.key as never],
                  ),
                  $,
                  [...path, node.key],
                );
                _variables = { ..._variables, ...variables };
                return queryString;
              })()
            : ''
        }`,
    )
    .join('\n')}\n${' '.repeat(indent - 2)}}`;
  return { queryString, variables: _variables };
};

export const buildQueryString = (
  type: 'query' | 'mutation' | 'subscription',
  name: string,
  inputType: Record<string, string>,
  returnType: string,
  $: TypeCollection,
  ast: readonly QueryNode[],
): { queryString: string; variables: Record<string, unknown> } => {
  const [operationBody, variables] =
    ast.length > 0
      ? (() => {
          const { queryString, variables } = buildQueryAst(
            ast,
            4,
            createTypeParser($).extractCoreType(returnType),
            $,
          );
          return [' ' + queryString, variables];
        })()
      : ['', {}];
  const definitionHeader = `${type} ${name}${
    Object.keys({ ...inputType, ...variables }).length > 0
      ? '(' +
        Object.entries({ ...inputType, ...variables })
          .map(([key, value]) => `$${key}: ${typeof value === 'string' ? value : value.type}`)
          .join(', ') +
        ')'
      : ''
  } {`;
  const operationHeader = `${name}${
    Object.keys(inputType).length > 0
      ? `(${Object.keys(inputType)
          .map((key) => `${key}: $${key}`)
          .join(', ')})`
      : ''
  }`;

  const queryString = `${definitionHeader}\n  ${operationHeader}${operationBody}\n}`;
  return { queryString, variables: mapObjectValues(variables, (v) => v.value) };
};

const createInfiniteGetter = (): any => new Proxy({}, { get: () => createInfiniteGetter() });

const operationString = (type: 'query' | 'mutation' | 'subscription') => (name: string) => ({
  input: (inputType: Record<string, string>) => ({
    select: <T extends object = any>(selector: ObjectSelector<T, readonly QueryNode[]>) => ({
      build: () => {
        const ast = parseSelector(selector);
        return buildQueryString(type, name, inputType, '', createInfiniteGetter(), ast).queryString;
      },
    }),
    build: () =>
      buildQueryString(type, name, inputType, '', createInfiniteGetter(), []).queryString,
  }),
  select: <T extends object = any>(selector: ObjectSelector<T, readonly QueryNode[]>) => ({
    build: () => {
      const ast = parseSelector(selector);
      return buildQueryString(type, name, {}, '', createInfiniteGetter(), ast).queryString;
    },
  }),
  build: () => buildQueryString('query', name, {}, '', createInfiniteGetter(), []).queryString,
});

/**
 * Create a GraphQL query string for a query operation.
 */
export const queryString = operationString('query');
/**
 * Create a GraphQL query string for a mutation operation.
 */
export const mutationString = operationString('mutation');
/**
 * Create a GraphQL query string for a subscription operation.
 */
export const subscriptionString = operationString('subscription');
