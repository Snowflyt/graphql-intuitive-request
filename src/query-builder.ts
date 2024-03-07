import { parseSelector } from './selector';
import { ObjectSelector } from './types/ast-builder';

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
  operationType: 'query' | 'mutation' | 'subscription',
  operationName: string,
  variableTypes: Record<string, string>,
  ast: readonly QueryNode[],
) => {
  const definitionHeader = `${operationType} ${operationName}${
    Object.keys(variableTypes).length > 0
      ? `(${Object.entries(variableTypes)
          .map(([key, value]) => `$${key}: ${value}`)
          .join(', ')})`
      : ''
  } {`;
  const operationHeader = `${operationName}${
    Object.keys(variableTypes).length > 0
      ? `(${Object.keys(variableTypes)
          .map((key) => `${key}: $${key}`)
          .join(', ')})`
      : ''
  }`;
  const operationBody = ast.length > 0 ? ` ${buildQueryAst(ast)}` : '';
  const queryString = `${definitionHeader}\n  ${operationHeader}${operationBody}\n}`;
  return queryString;
};

const operationString =
  (method: 'query' | 'mutation' | 'subscription') => (operationName: string) => ({
    variables: (variableTypes: Record<string, string>) => ({
      select: <T extends object = any>(selector: ObjectSelector<T, readonly QueryNode[]>) => ({
        build: () => {
          const ast = parseSelector(selector);
          return buildQueryString(method, operationName, variableTypes, ast);
        },
      }),
      build: () => buildQueryString(method, operationName, variableTypes, []),
    }),
    select: <T extends object = any>(selector: ObjectSelector<T, readonly QueryNode[]>) => ({
      build: () => {
        const ast = parseSelector(selector);
        return buildQueryString(method, operationName, {}, ast);
      },
    }),
    build: () => buildQueryString('query', operationName, {}, []),
  });

export const queryString = operationString('query');
export const mutationString = operationString('mutation');
export const subscriptionString = operationString('subscription');
