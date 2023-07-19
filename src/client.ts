import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLType,
  GraphQLUnionType,
} from 'graphql';
import { GraphQLClient as RequestClient } from 'graphql-request';
import {
  Client as WSClient,
  ClientOptions as WSOptions,
  createClient as createWSClient,
} from 'graphql-ws';

import type {
  ObjectSelector,
  ObjectSelectorBuilder,
} from './types/ast-builder';
import type { ParseNodes } from './types/ast-parser';
import type {
  ClassType,
  QueryPromise,
  SubscriptionResponse,
} from './types/common';
import type {
  MaybeNull,
  NullablePrimitiveTypeAndArray,
  ParseNullablePrimitiveTypeAndArray,
  ValidReturnType,
  VariableType,
  VariablesOf,
  VariablesType,
} from './types/graphql-types';
import type { QueryNode } from './types/query-nodes';

const getBuilder = <T>(): ObjectSelectorBuilder<T> => {
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

export const NullableStringConstructor = String.bind(
  null,
) as MaybeNull<StringConstructor>;
NullableStringConstructor.__nullable = true;
export const NullableBooleanConstructor = Boolean.bind(
  null,
) as MaybeNull<BooleanConstructor>;
NullableBooleanConstructor.__nullable = true;

const isGraphQLType = (value: unknown): value is GraphQLType =>
  value instanceof GraphQLScalarType ||
  value instanceof GraphQLObjectType ||
  value instanceof GraphQLInterfaceType ||
  value instanceof GraphQLUnionType ||
  value instanceof GraphQLEnumType ||
  value instanceof GraphQLInputObjectType ||
  value instanceof GraphQLList;

const isStringConstructor = (value: unknown): value is StringConstructor =>
  value === String || value === NullableStringConstructor;

const isBooleanConstructor = (value: unknown): value is BooleanConstructor =>
  value === Boolean || value === NullableBooleanConstructor;

const isOneElementTuple = (value: unknown): value is readonly [unknown] =>
  Array.isArray(value) && value.length === 1;

const getVariableTypeString = (
  variableType: VariableType,
  exclamationMarkAdded: boolean = false,
): string => {
  // If the type is not a nullable type marked by the `Nullable` function,
  // add the '!' suffix to the type name,
  // and set exclamationMarkAdded to true to avoid adding the '!' suffix again.
  if (
    !exclamationMarkAdded &&
    !('__nullable' in variableType && variableType.__nullable === true)
  ) {
    return `${getVariableTypeString(variableType, true)}!`;
  }
  // If the type is GraphQLType, just use the type name.
  if (isGraphQLType(variableType)) {
    return variableType.toString();
  }
  // If the type is an one-element tuple, we need to add '[]' around the type name.
  if (isOneElementTuple(variableType)) {
    return `[${getVariableTypeString(variableType[0], false)}]`;
  }
  // If the type is StringConstructor or BooleanConstructor,
  // we use the name of the type as the type name.
  if (isStringConstructor(variableType) || isBooleanConstructor(variableType)) {
    return variableType.name;
  }
  // Else, the type is a **function**,
  // and is not StringConstructor or BooleanConstructor,
  // it means it's a class type,
  // we use the name of the class as the type name.
  return variableType.name;
};

const buildQueryAst = (ast: readonly QueryNode[], indent: number = 4): string =>
  `{\n${ast
    .map(
      (node) =>
        `${' '.repeat(indent)}${
          node.children !== null
            ? `${node.key} ${buildQueryAst(
                node.children as QueryNode[],
                indent + 2,
              )}`
            : node.key
        }`,
    )
    .join('\n')}\n${' '.repeat(indent - 2)}}`;

const buildQueryString = <const VT extends object>(
  operationType: 'query' | 'mutation' | 'subscription',
  operationName: string,
  variablesType: VT,
  ast: readonly QueryNode[],
) => {
  const definitionHeader = `${operationType} ${operationName}${
    Object.keys(variablesType).length > 0
      ? `(${Object.entries(variablesType)
          .map(
            ([key, value]) => `$${key}: ${getVariableTypeString(value, false)}`,
          )
          .join(', ')})`
      : ''
  } {`;
  const operationHeader = `${operationName}${
    Object.keys(variablesType).length > 0
      ? `(${Object.keys(variablesType)
          .map((key) => `${key}: $${key}`)
          .join(', ')})`
      : ''
  }`;
  const operationBody = ast.length > 0 ? ` ${buildQueryAst(ast)}` : '';
  const queryString = `${definitionHeader}\n  ${operationHeader}${operationBody}\n}`;
  return queryString;
};

export const createObjectSelectorOn = <
  T extends Record<string, any>,
  const R extends readonly QueryNode[],
>(
  objectType: ClassType<T> | GraphQLObjectType<T>,
  selector: ObjectSelector<T, R>,
): ObjectSelector<T, R> => selector;

export function createQueryStringFor(
  operationType: 'query' | 'mutation',
  operationName: string,
): string;
export function createQueryStringFor(
  operationType: 'query' | 'mutation',
  operationName: string,
  variablesType: VariablesType,
): string;
export function createQueryStringFor<C extends Record<string, any>>(
  operationType: 'query' | 'mutation',
  operationName: string,
  variablesType: VariablesType,
  returnType:
    | ClassType<C>
    | GraphQLObjectType<C>
    | readonly [ClassType<C>]
    | readonly [GraphQLObjectType<C>],
  selector: ObjectSelector<C, readonly QueryNode[]>,
): string;
export function createQueryStringFor<
  C extends Record<string, any>,
  const R extends readonly QueryNode[],
>(
  operationType: 'query' | 'mutation',
  operationName: string,
  variablesType: VariablesType = {} as any,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  returnType: ValidReturnType = undefined,
  selector?: ObjectSelector<C, R>,
): string {
  const ast =
    selector === undefined
      ? []
      : (selector(getBuilder()) as readonly QueryNode[]);
  return buildQueryString(operationType, operationName, variablesType, ast);
}

export class GraphQLIntuitiveClient {
  private readonly url: string;
  private readonly config?: RequestClient['requestConfig'];
  private readonly requestClient: RequestClient;
  private wsClient?: WSClient;

  constructor(url: string, config?: RequestClient['requestConfig']) {
    this.url = url;
    this.config = config;
    this.requestClient = new RequestClient(url, config);
  }

  withWebSocketClient(options: WSOptions): GraphQLIntuitiveClient {
    if (this.wsClient !== undefined) {
      throw new Error('WebSocket client already exists.');
    }
    this.wsClient = createWSClient(options);
    return this;
  }

  getRequestClient(): RequestClient {
    return this.requestClient;
  }

  getWSClient(): WSClient | undefined {
    return this.wsClient;
  }

  query(operationName: string): () => QueryPromise<void>;
  query<const VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
  ): (variables: VariablesOf<VT>) => QueryPromise<void>;
  query<
    T extends NullablePrimitiveTypeAndArray,
    const VT extends VariablesType,
  >(
    operationName: string,
    variablesType: VT,
    returnType: T,
  ): (
    variables: VariablesOf<VT>,
  ) => QueryPromise<ParseNullablePrimitiveTypeAndArray<T>>;
  query<C extends Record<string, any>, const VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType: MaybeNull<ClassType<C>> | MaybeNull<GraphQLObjectType<C>>,
  ): <const R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => QueryPromise<ParseNodes<R> | null>;
  query<C extends Record<string, any>, const VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType: ClassType<C> | GraphQLObjectType<C>,
  ): <const R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => QueryPromise<ParseNodes<R>>;
  query<C extends Record<string, any>, const VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType:
      | MaybeNull<readonly [MaybeNull<ClassType<C>>]>
      | MaybeNull<readonly [MaybeNull<GraphQLObjectType<C>>]>,
  ): <const R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => QueryPromise<Array<ParseNodes<R> | null> | null>;
  query<C extends Record<string, any>, const VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType:
      | MaybeNull<readonly [ClassType<C>]>
      | MaybeNull<readonly [GraphQLObjectType<C>]>,
  ): <const R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => QueryPromise<Array<ParseNodes<R>> | null>;
  query<C extends Record<string, any>, const VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType:
      | readonly [MaybeNull<ClassType<C>>]
      | readonly [MaybeNull<GraphQLObjectType<C>>],
  ): <const R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => QueryPromise<Array<ParseNodes<R> | null>>;
  query<C extends Record<string, any>, const VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType: readonly [ClassType<C>] | readonly [GraphQLObjectType<C>],
  ): <const R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => QueryPromise<Array<ParseNodes<R>>>;
  query<C extends Record<string, any>, const VT extends VariablesType>(
    operationName: string,
    variablesType: VT = {} as any,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    returnType: ValidReturnType = undefined,
  ) {
    return <const R extends readonly QueryNode[]>(
      variables?: VariablesOf<VT>,
      selector?: ObjectSelector<C, R>,
    ) => {
      variables ??= {} as any;
      const ast =
        selector === undefined
          ? []
          : (selector(getBuilder()) as readonly QueryNode[]);
      const queryString = buildQueryString(
        'query',
        operationName,
        variablesType,
        ast,
      );
      const result = this.requestClient
        .request(queryString, variables)
        .then((data) => {
          return (data as any)[operationName];
        });
      (result as any).toQueryString = () => queryString;
      (result as any).toRequestBody = () => ({
        query: queryString,
        variables,
      });
      return result as any;
    };
  }

  mutation(operationName: string): () => QueryPromise<void>;
  mutation<const VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
  ): (variables: VariablesOf<VT>) => QueryPromise<void>;
  mutation<
    T extends NullablePrimitiveTypeAndArray,
    const VT extends VariablesType,
  >(
    operationName: string,
    variablesType: VT,
    returnType: T,
  ): (
    variables: VariablesOf<VT>,
  ) => QueryPromise<ParseNullablePrimitiveTypeAndArray<T>>;
  mutation<C extends Record<string, any>, const VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType: MaybeNull<ClassType<C>> | MaybeNull<GraphQLObjectType<C>>,
  ): <const R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => QueryPromise<ParseNodes<R> | null>;
  mutation<C extends Record<string, any>, const VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType: ClassType<C> | GraphQLObjectType<C>,
  ): <const R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => QueryPromise<ParseNodes<R>>;
  mutation<C extends Record<string, any>, const VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType:
      | MaybeNull<readonly [MaybeNull<ClassType<C>>]>
      | MaybeNull<readonly [MaybeNull<GraphQLObjectType<C>>]>,
  ): <const R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => QueryPromise<Array<ParseNodes<R> | null> | null>;
  mutation<C extends Record<string, any>, const VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType:
      | MaybeNull<readonly [ClassType<C>]>
      | MaybeNull<readonly [GraphQLObjectType<C>]>,
  ): <const R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => QueryPromise<Array<ParseNodes<R>> | null>;
  mutation<C extends Record<string, any>, const VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType:
      | readonly [MaybeNull<ClassType<C>>]
      | readonly [MaybeNull<GraphQLObjectType<C>>],
  ): <const R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => QueryPromise<Array<ParseNodes<R> | null>>;
  mutation<C extends Record<string, any>, const VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType: readonly [ClassType<C>] | readonly [GraphQLObjectType<C>],
  ): <const R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => QueryPromise<Array<ParseNodes<R>>>;
  mutation<C extends Record<string, any>, const VT extends VariablesType>(
    operationName: string,
    variablesType: VT = {} as any,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    returnType: ValidReturnType = undefined,
  ) {
    return <const R extends readonly QueryNode[]>(
      variables?: VariablesOf<VT>,
      selector?: ObjectSelector<C, R>,
    ) => {
      variables ??= {} as any;
      const ast =
        selector === undefined
          ? []
          : (selector(getBuilder()) as readonly QueryNode[]);
      const queryString = buildQueryString(
        'mutation',
        operationName,
        variablesType,
        ast,
      );
      const result = this.requestClient
        .request(queryString, variables)
        .then((data) => {
          return (data as any)[operationName];
        });
      (result as any).toQueryString = () => queryString;
      (result as any).toRequestBody = () => ({
        query: queryString,
        variables,
      });
      return result as any;
    };
  }

  subscription(operationName: string): () => SubscriptionResponse<void>;
  subscription<const VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
  ): (variables: VariablesOf<VT>) => SubscriptionResponse<void>;
  subscription<
    T extends NullablePrimitiveTypeAndArray,
    const VT extends VariablesType,
  >(
    operationName: string,
    variablesType: VT,
    returnType: T,
  ): (
    variables: VariablesOf<VT>,
  ) => SubscriptionResponse<ParseNullablePrimitiveTypeAndArray<T>>;
  subscription<C extends Record<string, any>, const VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType: MaybeNull<ClassType<C>> | MaybeNull<GraphQLObjectType<C>>,
  ): <const R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => SubscriptionResponse<ParseNodes<R> | null>;
  subscription<C extends Record<string, any>, const VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType: ClassType<C> | GraphQLObjectType<C>,
  ): <const R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => SubscriptionResponse<ParseNodes<R>>;
  subscription<C extends Record<string, any>, const VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType:
      | MaybeNull<readonly [MaybeNull<ClassType<C>>]>
      | MaybeNull<readonly [MaybeNull<GraphQLObjectType<C>>]>,
  ): <const R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => SubscriptionResponse<Array<ParseNodes<R> | null> | null>;
  subscription<C extends Record<string, any>, const VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType:
      | MaybeNull<readonly [ClassType<C>]>
      | MaybeNull<readonly [GraphQLObjectType<C>]>,
  ): <const R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => SubscriptionResponse<Array<ParseNodes<R>> | null>;
  subscription<C extends Record<string, any>, const VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType:
      | readonly [MaybeNull<ClassType<C>>]
      | readonly [MaybeNull<GraphQLObjectType<C>>],
  ): <const R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => SubscriptionResponse<Array<ParseNodes<R> | null>>;
  subscription<C extends Record<string, any>, const VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType: readonly [ClassType<C>] | readonly [GraphQLObjectType<C>],
  ): <const R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => SubscriptionResponse<Array<ParseNodes<R>>>;
  subscription<C extends Record<string, any>, const VT extends VariablesType>(
    operationName: string,
    variablesType: VT = {} as any,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    returnType: ValidReturnType = undefined,
  ) {
    return <const R extends readonly QueryNode[]>(
      variables?: VariablesOf<VT>,
      selector?: ObjectSelector<C, R>,
    ) => {
      variables ??= {} as any;
      const ast =
        selector === undefined
          ? []
          : (selector(getBuilder()) as readonly QueryNode[]);
      const queryString = buildQueryString(
        'subscription',
        operationName,
        variablesType,
        ast,
      );
      return {
        subscribe: (
          subscriber: (data: any) => void,
          onError?: (error: any) => void,
          onComplete?: () => void,
        ) => {
          if (this.wsClient === undefined) {
            throw new Error(
              'Cannot subscribe to a subscription without a WebSocket client. ' +
                'Use the `withWebSocketClient` method to provide one.',
            );
          }
          const wsClient = this.wsClient;
          const unsubscribe = wsClient.subscribe(
            {
              query: queryString,
              variables,
            },
            {
              next: (value) => {
                if (value.errors) {
                  onError?.(value.errors);
                }
                if (value.data) {
                  subscriber(value.data[operationName]);
                }
              },
              error: (error) => {
                onError?.(error);
              },
              complete: () => {
                onComplete?.();
              },
            },
          );
          return unsubscribe;
        },
        toQueryString: () => queryString,
        toRequestBody: () => ({
          query: queryString,
          variables,
        }),
      } as SubscriptionResponse<any>;
    };
  }
}
