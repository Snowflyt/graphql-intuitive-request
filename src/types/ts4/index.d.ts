import type { GraphQLClient } from 'graphql-request';
import type { Processed, QueryPromise, Type } from '../universal/common';
import type {
  Float,
  GraphQLType,
  ID,
  Int,
  NullableType,
} from '../universal/graphql-types';
import type { QueryNode } from '../universal/query-nodes';
import type { ParseAst, Selector } from './ast';

declare const Nullable: <T>(type: T) => NullableType<T>;

declare class GraphQLIntuitiveClient {
  private readonly client;

  constructor(endpoint: string, requestConfig?: GraphQLClient['requestConfig']);

  static query<T, U extends Record<string, GraphQLType>>(
    clazz: Type<T>,
    variablesType?: U,
  ): (
    operationName: string,
    selector: Selector<T, readonly QueryNode[]>,
    variables?: { [P in keyof U]: Processed<U[P]> },
  ) => {
    toQueryString: () => string;
    toRequestBody: () => {
      query: string;
      variables: { [P in keyof U]: Processed<U[P]> };
    };
  };

  static mutation<T, U extends Record<string, GraphQLType>>(
    clazz: Type<T>,
    variablesType?: U,
  ): (
    operationName: string,
    selector: Selector<T, readonly QueryNode[]>,
    variables?: { [P in keyof U]: Processed<U[P]> },
  ) => {
    toQueryString: () => string;
    toRequestBody: () => {
      query: string;
      variables: { [P in keyof U]: Processed<U[P]> };
    };
  };

  getGraphQLClient(): GraphQLClient;

  query<T, U extends Record<string, GraphQLType>>(
    clazz: Type<T>,
    variablesType?: U,
  ): (<R extends readonly QueryNode[]>(
    operationName: string,
    selector: Selector<T, R>,
    variables?: { [P in keyof U]: Processed<U[P]> },
  ) => QueryPromise<ParseAst<R>>) &
    ((
      operationName: string,
    ) => <R extends readonly QueryNode[]>(
      selector: Selector<T, R>,
      variables?: { [P in keyof U]: Processed<U[P]> },
    ) => QueryPromise<ParseAst<R>>);
  query<T, U extends Record<string, GraphQLType>>(
    clazz: [Type<T>],
    variablesType?: U,
  ): (<R extends readonly QueryNode[]>(
    operationName: string,
    selector: Selector<T, R>,
    variables?: { [P in keyof U]: Processed<U[P]> },
  ) => QueryPromise<Array<ParseAst<R>>>) &
    ((
      operationName: string,
    ) => <R extends readonly QueryNode[]>(
      selector: Selector<T, R>,
      variables?: { [P in keyof U]: Processed<U[P]> },
    ) => QueryPromise<Array<ParseAst<R>>>);

  mutation<T, U extends Record<string, GraphQLType>>(
    clazz: Type<T>,
    variablesType?: U,
  ): (<R extends readonly QueryNode[]>(
    operationName: string,
    selector: Selector<T, R>,
    variables?: { [P in keyof U]: Processed<U[P]> },
  ) => QueryPromise<ParseAst<R>>) &
    ((
      operationName: string,
    ) => <R extends readonly QueryNode[]>(
      selector: Selector<T, R>,
      variables?: { [P in keyof U]: Processed<U[P]> },
    ) => QueryPromise<ParseAst<R>>);
  mutation<T, U extends Record<string, GraphQLType>>(
    clazz: [Type<T>],
    variablesType?: U,
  ): (<R extends readonly QueryNode[]>(
    operationName: string,
    selector: Selector<T, R>,
    variables?: { [P in keyof U]: Processed<U[P]> },
  ) => QueryPromise<Array<ParseAst<R>>>) &
    ((
      operationName: string,
    ) => <R extends readonly QueryNode[]>(
      selector: Selector<T, R>,
      variables?: { [P in keyof U]: Processed<U[P]> },
    ) => QueryPromise<Array<ParseAst<R>>>);

  private static processNullableVariable;

  private static getVariableTypeString;

  private static buildQueryString;

  private static buildQueryAst;
}

export { ID, Int, Float, Nullable, GraphQLIntuitiveClient };
