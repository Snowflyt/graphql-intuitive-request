import type { GraphQLClient } from 'graphql-request';
import type { Processed, QueryPromise, Type } from '../universal/common';
import type { GraphQLType, NullableType } from '../universal/graphql-types';
import type { QueryNode } from '../universal/query-nodes';
import type { ParseAst, Selector } from './ast';

declare const Nullable: <T>(type: T) => NullableType<T>;

declare class GraphQLIntuitiveClient {
  private readonly client;

  constructor(endpoint: string, headers?: Record<string, string>);

  getGraphQLClient(): GraphQLClient;

  query<T, const U extends Record<string, GraphQLType>>(
    clazz: Type<T>,
    variablesType?: U
  ): (<const R extends readonly QueryNode[]>(
    operationName: string,
    selector: Selector<T, R>,
    variables?: { [P in keyof U]: Processed<U[P]> },
  ) => QueryPromise<ParseAst<R>>) &
    ((
      operationName: string
    ) => <const R extends readonly QueryNode[]>(
      selector: Selector<T, R>,
      variables?: { [P in keyof U]: Processed<U[P]> },
    ) => QueryPromise<ParseAst<R>>);
  query<T, const U extends Record<string, GraphQLType>>(
    clazz: [Type<T>],
    variablesType?: U
  ): (<const R extends readonly QueryNode[]>(
    operationName: string,
    selector: Selector<T, R>,
    variables?: { [P in keyof U]: Processed<U[P]> },
  ) => QueryPromise<Array<ParseAst<R>>>) &
    ((
      operationName: string
    ) => <const R extends readonly QueryNode[]>(
      selector: Selector<T, R>,
      variables?: { [P in keyof U]: Processed<U[P]> },
    ) => QueryPromise<Array<ParseAst<R>>>);

  mutation<T, const U extends Record<string, GraphQLType>>(
    clazz: Type<T>,
    variablesType?: U
  ): (<const R extends readonly QueryNode[]>(
    operationName: string,
    selector: Selector<T, R>,
    variables?: { [P in keyof U]: Processed<U[P]> },
  ) => QueryPromise<ParseAst<R>>) &
    ((
      operationName: string
    ) => <const R extends readonly QueryNode[]>(
      selector: Selector<T, R>,
      variables?: { [P in keyof U]: Processed<U[P]> },
    ) => QueryPromise<ParseAst<R>>);
  mutation<T, const U extends Record<string, GraphQLType>>(
    clazz: [Type<T>],
    variablesType?: U
  ): (<const R extends readonly QueryNode[]>(
    operationName: string,
    selector: Selector<T, R>,
    variables?: { [P in keyof U]: Processed<U[P]> }
  ) => QueryPromise<Array<ParseAst<R>>>) &
    ((
      operationName: string
    ) => <const R extends readonly QueryNode[]>(
      selector: Selector<T, R>,
      variables?: { [P in keyof U]: Processed<U[P]> }
    ) => QueryPromise<Array<ParseAst<R>>>);

  private processNullableVariable;

  private getVariableTypeString;

  private buildQueryString;

  private buildQueryAst;
}

export { ID, Int, Float, Nullable, GraphQLIntuitiveClient };
