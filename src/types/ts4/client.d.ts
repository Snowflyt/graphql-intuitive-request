import { GraphQLObjectType } from 'graphql';
import { GraphQLClient as RequestClient } from 'graphql-request';
import { Client as WSClient, ClientOptions as WSOptions } from 'graphql-ws';
import type { ParseNodes } from '../universal/ast-parser';
import type {
  ClassType,
  QueryPromise,
  SubscriptionResponse,
} from '../universal/common';
import type {
  MaybeNull,
  NullablePrimitiveTypeAndArray,
  ParseNullablePrimitiveTypeAndArray,
  VariablesOf,
  VariablesType,
} from '../universal/graphql-types';
import type { QueryNode } from '../universal/query-nodes';
import type { ObjectSelector } from './ast-builder';

export declare const NullableStringConstructor: MaybeNull<StringConstructor>;
export declare const NullableBooleanConstructor: MaybeNull<BooleanConstructor>;

export declare const createObjectSelectorOn: <
  T extends Record<string, any>,
  R extends readonly QueryNode[],
>(
  objectType: ClassType<T> | GraphQLObjectType<T, any>,
  selector: ObjectSelector<T, R>,
) => ObjectSelector<T, R>;

export declare function createQueryStringFor(
  operationType: 'query' | 'mutation',
  operationName: string,
): string;
export declare function createQueryStringFor(
  operationType: 'query' | 'mutation',
  operationName: string,
  variablesType: VariablesType,
): string;
export declare function createQueryStringFor<C extends Record<string, any>>(
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

export declare class GraphQLIntuitiveClient {
  private readonly url;

  private readonly config?;

  private readonly requestClient;

  private wsClient?;

  constructor(url: string, config?: RequestClient['requestConfig']);

  withWebSocketClient(options: WSOptions): GraphQLIntuitiveClient;

  getRequestClient(): RequestClient;

  getWSClient(): WSClient | undefined;

  query(operationName: string): () => QueryPromise<void>;
  query<VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
  ): (variables: VariablesOf<VT>) => QueryPromise<void>;
  query<T extends NullablePrimitiveTypeAndArray, VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType: T,
  ): (
    variables: VariablesOf<VT>,
  ) => QueryPromise<ParseNullablePrimitiveTypeAndArray<T>>;
  query<C extends Record<string, any>, VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType: MaybeNull<ClassType<C>> | MaybeNull<GraphQLObjectType<C>>,
  ): <R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => QueryPromise<ParseNodes<R> | null>;
  query<C extends Record<string, any>, VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType: ClassType<C> | GraphQLObjectType<C>,
  ): <R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => QueryPromise<ParseNodes<R>>;
  query<C extends Record<string, any>, VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType:
      | MaybeNull<readonly [MaybeNull<ClassType<C>>]>
      | MaybeNull<readonly [MaybeNull<GraphQLObjectType<C>>]>,
  ): <R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => QueryPromise<Array<ParseNodes<R> | null> | null>;
  query<C extends Record<string, any>, VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType:
      | MaybeNull<readonly [ClassType<C>]>
      | MaybeNull<readonly [GraphQLObjectType<C>]>,
  ): <R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => QueryPromise<Array<ParseNodes<R>> | null>;
  query<C extends Record<string, any>, VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType:
      | readonly [MaybeNull<ClassType<C>>]
      | readonly [MaybeNull<GraphQLObjectType<C>>],
  ): <R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => QueryPromise<Array<ParseNodes<R> | null>>;
  query<C extends Record<string, any>, VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType: readonly [ClassType<C>] | readonly [GraphQLObjectType<C>],
  ): <R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => QueryPromise<Array<ParseNodes<R>>>;

  mutation(operationName: string): () => QueryPromise<void>;
  mutation<VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
  ): (variables: VariablesOf<VT>) => QueryPromise<void>;
  mutation<T extends NullablePrimitiveTypeAndArray, VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType: T,
  ): (
    variables: VariablesOf<VT>,
  ) => QueryPromise<ParseNullablePrimitiveTypeAndArray<T>>;
  mutation<C extends Record<string, any>, VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType: MaybeNull<ClassType<C>> | MaybeNull<GraphQLObjectType<C>>,
  ): <R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => QueryPromise<ParseNodes<R> | null>;
  mutation<C extends Record<string, any>, VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType: ClassType<C> | GraphQLObjectType<C>,
  ): <R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => QueryPromise<ParseNodes<R>>;
  mutation<C extends Record<string, any>, VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType:
      | MaybeNull<readonly [MaybeNull<ClassType<C>>]>
      | MaybeNull<readonly [MaybeNull<GraphQLObjectType<C>>]>,
  ): <R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => QueryPromise<Array<ParseNodes<R> | null> | null>;
  mutation<C extends Record<string, any>, VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType:
      | MaybeNull<readonly [ClassType<C>]>
      | MaybeNull<readonly [GraphQLObjectType<C>]>,
  ): <R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => QueryPromise<Array<ParseNodes<R>> | null>;
  mutation<C extends Record<string, any>, VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType:
      | readonly [MaybeNull<ClassType<C>>]
      | readonly [MaybeNull<GraphQLObjectType<C>>],
  ): <R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => QueryPromise<Array<ParseNodes<R> | null>>;
  mutation<C extends Record<string, any>, VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType: readonly [ClassType<C>] | readonly [GraphQLObjectType<C>],
  ): <R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => QueryPromise<Array<ParseNodes<R>>>;

  subscription(operationName: string): () => SubscriptionResponse<void>;
  subscription<VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
  ): (variables: VariablesOf<VT>) => SubscriptionResponse<void>;
  subscription<
    T extends NullablePrimitiveTypeAndArray,
    VT extends VariablesType,
  >(
    operationName: string,
    variablesType: VT,
    returnType: T,
  ): (
    variables: VariablesOf<VT>,
  ) => SubscriptionResponse<ParseNullablePrimitiveTypeAndArray<T>>;
  subscription<C extends Record<string, any>, VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType: MaybeNull<ClassType<C>> | MaybeNull<GraphQLObjectType<C>>,
  ): <R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => SubscriptionResponse<ParseNodes<R> | null>;
  subscription<C extends Record<string, any>, VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType: ClassType<C> | GraphQLObjectType<C>,
  ): <R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => SubscriptionResponse<ParseNodes<R>>;
  subscription<C extends Record<string, any>, VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType:
      | MaybeNull<readonly [MaybeNull<ClassType<C>>]>
      | MaybeNull<readonly [MaybeNull<GraphQLObjectType<C>>]>,
  ): <R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => SubscriptionResponse<Array<ParseNodes<R> | null> | null>;
  subscription<C extends Record<string, any>, VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType:
      | MaybeNull<readonly [ClassType<C>]>
      | MaybeNull<readonly [GraphQLObjectType<C>]>,
  ): <R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => SubscriptionResponse<Array<ParseNodes<R>> | null>;
  subscription<C extends Record<string, any>, VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType:
      | readonly [MaybeNull<ClassType<C>>]
      | readonly [MaybeNull<GraphQLObjectType<C>>],
  ): <R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => SubscriptionResponse<Array<ParseNodes<R> | null>>;
  subscription<C extends Record<string, any>, VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
    returnType: readonly [ClassType<C>] | readonly [GraphQLObjectType<C>],
  ): <R extends readonly QueryNode[]>(
    variables: VariablesOf<VT>,
    selector: ObjectSelector<C, R>,
  ) => SubscriptionResponse<Array<ParseNodes<R>>>;
}
