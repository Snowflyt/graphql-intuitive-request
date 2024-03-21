import { parseSelector } from './selector';

import type { ObjectSelector } from './types/ast-builder';
import type { QueryNode } from './types/query-node';

const buildQueryAst = (ast: readonly QueryNode[], indent: number = 4): string =>
  `{\n${ast
    .map(
      (node) =>
        `${' '.repeat(indent)}${
          node.children !== null
            ? `${node.key} ${buildQueryAst(node.children as QueryNode[], indent + 2)}`
            : node.key
        }`,
    )
    .join('\n')}\n${' '.repeat(indent - 2)}}`;

export const buildQueryString = (
  type: 'query' | 'mutation' | 'subscription',
  name: string,
  inputType: Record<string, string>,
  ast: readonly QueryNode[],
) => {
  const definitionHeader = `${type} ${name}${
    Object.keys(inputType).length > 0
      ? `(${Object.entries(inputType)
          .map(([key, value]) => `$${key}: ${value}`)
          .join(', ')})`
      : ''
  } {`;
  const operationHeader = `${name}${
    Object.keys(inputType).length > 0
      ? `(${Object.keys(inputType)
          .map((key) => `${key}: $${key}`)
          .join(', ')})`
      : ''
  }`;
  const operationBody = ast.length > 0 ? ` ${buildQueryAst(ast)}` : '';
  return `${definitionHeader}\n  ${operationHeader}${operationBody}\n}`;
};

const operationString = (type: 'query' | 'mutation' | 'subscription') => (name: string) => ({
  input: (inputType: Record<string, string>) => ({
    select: <T extends object = any>(selector: ObjectSelector<T, readonly QueryNode[]>) => ({
      build: () => {
        const ast = parseSelector(selector);
        return buildQueryString(type, name, inputType, ast);
      },
    }),
    build: () => buildQueryString(type, name, inputType, []),
  }),
  select: <T extends object = any>(selector: ObjectSelector<T, readonly QueryNode[]>) => ({
    build: () => {
      const ast = parseSelector(selector);
      return buildQueryString(type, name, {}, ast);
    },
  }),
  build: () => buildQueryString('query', name, {}, []),
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
