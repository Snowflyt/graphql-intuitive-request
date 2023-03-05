import { GraphQLClient } from 'graphql-request';
import type { ParseAst, QueryBuilder, Selector } from './types/ts5/ast';
import type { Processed, QueryPromise, Type } from './types/universal/common';
import type { Float as Float_, GraphQLType, ID as ID_, Int as Int_, NullableType } from './types/universal/graphql-types';
import type { QueryNode } from './types/universal/query-nodes';

const getBuilder = <T>(): QueryBuilder<T> => {
  return new Proxy(
    {},
    {
      get: (_, prop) => {
        const result = ((selector: any) => {
          result.children = selector(getBuilder());
          return result;
        }) as any;
        result.key = prop;
        result.children = null;
        return result;
      },
    },
  ) as any;
};

const ID: typeof ID_ = Symbol('ID') as typeof ID_;
const Int: typeof Int_ = Symbol('Int') as typeof Int_;
const Float: typeof Float_ = Symbol('Float') as typeof Float_;

const Nullable = <T>(type: T): NullableType<T> => {
  (type as NullableType<T>).nullable = true;
  return type as NullableType<T>;
};

class GraphQLIntuitiveClient {
  private readonly client: GraphQLClient;

  constructor(endpoint: string, requestConfig?: GraphQLClient['requestConfig']) {
    this.client = new GraphQLClient(endpoint, requestConfig);
  }

  static query<T, const U extends Record<string, GraphQLType>>(
    clazz: Type<T>,
    variablesType: U = {} as any,
  ) {
    return (
      operationName: string,
      selector: Selector<T, readonly QueryNode[]>,
      variables: { [P in keyof U]: Processed<U[P]> } = {} as any,
    ) => {
      const builder = getBuilder<T>();
      const ast = selector(builder);
      const queryString = GraphQLIntuitiveClient.buildQueryString(
        'query',
        operationName,
        variablesType,
        ast,
      );
      return {
        toQueryString: () => queryString,
        toRequestBody: () => ({
          query: queryString,
          variables,
        }),
      };
    }
  }

  static mutation<T, const U extends Record<string, GraphQLType>>(
    clazz: Type<T>,
    variablesType: U = {} as any,
  ) {
    return (
      operationName: string,
      selector: Selector<T, readonly QueryNode[]>,
      variables: { [P in keyof U]: Processed<U[P]> } = {} as any,
    ) => {
      const builder = getBuilder<T>();
      const ast = selector(builder);
      const queryString = GraphQLIntuitiveClient.buildQueryString(
        'mutation',
        operationName,
        variablesType,
        ast,
      );
      return {
        toQueryString: () => queryString,
        toRequestBody: () => ({
          query: queryString,
          variables,
        }),
      };
    }
  }

  getGraphQLClient() {
    return this.client;
  }

  query<T, const U extends Record<string, GraphQLType>>(
    clazz: Type<T>,
    variablesType?: U,
  ): (<const R extends readonly QueryNode[]>(
    operationName: string,
    selector: Selector<T, R>,
    variables?: { [P in keyof U]: Processed<U[P]> },
  ) => QueryPromise<ParseAst<R>>) & ((operationName: string) =>
    <const R extends readonly QueryNode[]>(
      selector: Selector<T, R>,
      variables?: { [P in keyof U]: Processed<U[P]> },
    ) => QueryPromise<ParseAst<R>>);
  query<T, const U extends Record<string, GraphQLType>>(
    clazz: [Type<T>],
    variablesType?: U,
  ): (<const R extends readonly QueryNode[]>(
    operationName: string,
    selector: Selector<T, R>,
    variables?: { [P in keyof U]: Processed<U[P]> },
  ) => QueryPromise<Array<ParseAst<R>>>) & ((operationName: string) =>
    <const R extends readonly QueryNode[]>(
      selector: Selector<T, R>,
      variables?: { [P in keyof U]: Processed<U[P]> },
    ) => QueryPromise<Array<ParseAst<R>>>);
  query<T, const U extends Record<string, GraphQLType>>(
    clazz: Type<T> | [Type<T>],
    variablesType: U = {} as any,
  ) {
    return <const R extends readonly QueryNode[]>(
      operationName: string,
      selector?: Selector<T, R>,
      variables?: { [P in keyof U]: Processed<U[P]> },
    ) => {
      if (selector === undefined) {
        return async <const R extends readonly QueryNode[]>(
          selector: Selector<T, R>,
          variables: { [P in keyof U]: Processed<U[P]> } = {} as any,
        ) => {
          const ast = selector(getBuilder()) as readonly QueryNode[];
          const queryString = GraphQLIntuitiveClient.buildQueryString(
            'query',
            operationName,
            variablesType,
            ast,
          );
          const result = this.client.request(
            queryString,
            variables as any,
          ).then((data) => {
            return (data as any)[operationName];
          });
          (result as any).toQueryString = () => queryString;
          (result as any).toRequestBody = () => ({
            query: queryString,
            variables,
          });
          return result;
        };
      } else {
        variables ??= {} as any;
        const ast = selector(getBuilder()) as readonly QueryNode[];
        const queryString = GraphQLIntuitiveClient.buildQueryString(
          'query',
          operationName,
          variablesType,
          ast,
        );
        const result = this.client.request(
          queryString,
          variables as any,
        ).then((data) => {
          return (data as any)[operationName];
        });
        (result as any).toQueryString = () => queryString;
        (result as any).toRequestBody = () => ({
          query: queryString,
          variables,
        });
        return result;
      }
    };
  }

  mutation<T, const U extends Record<string, GraphQLType>>(
    clazz: Type<T>,
    variablesType?: U,
  ): (<const R extends readonly QueryNode[]>(
    operationName: string,
    selector: Selector<T, R>,
    variables?: { [P in keyof U]: Processed<U[P]> },
  ) => QueryPromise<ParseAst<R>>) & ((operationName: string) =>
    <const R extends readonly QueryNode[]>(
      selector: Selector<T, R>,
      variables?: { [P in keyof U]: Processed<U[P]> },
    ) => QueryPromise<ParseAst<R>>);
  mutation<T, const U extends Record<string, GraphQLType>>(
    clazz: [Type<T>],
    variablesType?: U,
  ): (<const R extends readonly QueryNode[]>(
    operationName: string,
    selector: Selector<T, R>,
    variables?: { [P in keyof U]: Processed<U[P]> },
  ) => QueryPromise<Array<ParseAst<R>>>) & ((operationName: string) =>
    <const R extends readonly QueryNode[]>(
      selector: Selector<T, R>,
      variables?: { [P in keyof U]: Processed<U[P]> },
    ) => QueryPromise<Array<ParseAst<R>>>);
  mutation<T, const U extends Record<string, GraphQLType>>(
    clazz: Type<T> | [Type<T>],
    variablesType: U = {} as any,
  ) {
    return <const R extends readonly QueryNode[]>(
      operationName: string,
      selector?: Selector<T, R>,
      variables?: { [P in keyof U]: Processed<U[P]> },
    ) => {
      if (selector === undefined) {
        return async <const R extends readonly QueryNode[]>(
          selector: Selector<T, R>,
          variables: { [P in keyof U]: Processed<U[P]> } = {} as any,
        ) => {
          const ast = selector(getBuilder()) as readonly QueryNode[];
          const queryString = GraphQLIntuitiveClient.buildQueryString(
            'mutation',
            operationName,
            variablesType,
            ast,
          );
          const result = this.client.request(
            queryString,
            variables as any,
          ).then((data) => {
            return (data as any)[operationName];
          });
          (result as any).toQueryString = () => queryString;
          (result as any).toRequestBody = () => ({
            query: queryString,
            variables,
          });
          return result;
        };
      } else {
        variables ??= {} as any;
        const ast = selector(getBuilder()) as readonly QueryNode[];
        const queryString = GraphQLIntuitiveClient.buildQueryString(
          'mutation',
          operationName,
          variablesType,
          ast,
        );
        const result = this.client.request(
          queryString,
          variables as any,
        ).then((data) => {
          return (data as any)[operationName];
        });
        (result as any).toQueryString = () => queryString;
        (result as any).toRequestBody = () => ({
          query: queryString,
          variables,
        });
        return result;
      }
    };
  }

  private static processNullableVariable(variable: GraphQLType, typeString: string) {
    return (variable as NullableType<GraphQLType>).nullable
      ? `${typeString}`
      : `${typeString}!`;
  }

  private static getVariableTypeString(variable: GraphQLType): string {
    if (variable instanceof Array) {
      return GraphQLIntuitiveClient.processNullableVariable(
        variable,
        `[${GraphQLIntuitiveClient.getVariableTypeString(variable[0])}]`,
      );
    } else if (variable === String) {
      return GraphQLIntuitiveClient.processNullableVariable(variable, 'String');
    } else if (variable === Int) {
      return GraphQLIntuitiveClient.processNullableVariable(variable, 'Int');
    } else if (variable === Float) {
      return GraphQLIntuitiveClient.processNullableVariable(variable, 'Float');
    } else if (variable === Boolean) {
      return GraphQLIntuitiveClient.processNullableVariable(variable, 'Boolean');
    } else if (variable === ID) {
      return GraphQLIntuitiveClient.processNullableVariable(variable, 'ID');
    } else {
      return GraphQLIntuitiveClient.processNullableVariable(variable, variable.name);
    }
  }

  private static buildQueryString<VT extends object>(
    operationType: 'query' | 'mutation',
    operationName: string,
    variablesType: VT,
    ast: readonly QueryNode[],
  ) {
    const query = `${operationType} ${operationName}${
      Object.keys(variablesType).length > 0
        ? `(${Object.entries(variablesType)
            .map(
              ([key, value]) => `$${key}: ${GraphQLIntuitiveClient.getVariableTypeString(value)}`,
            )
            .join(', ')})`
        : ''
    } {
      ${operationName}${
      Object.keys(variablesType).length > 0
        ? `(${Object.keys(variablesType)
            .map((key) => `${key}: $${key}`)
            .join(', ')})`
        : ''
    } ${GraphQLIntuitiveClient.buildQueryAst(ast)}
    }`;
    return query;
  }

  private static buildQueryAst(ast: readonly QueryNode[]): string {
    return `{
      ${ast
        .map((node) =>
          node.children !== null
            ? `${node.key} ${GraphQLIntuitiveClient.buildQueryAst(node.children as QueryNode[])}`
            : node.key,
        )
        .join(' ')}
    }`;
  }
}

export { ID, Int, Float, Nullable, GraphQLIntuitiveClient };
