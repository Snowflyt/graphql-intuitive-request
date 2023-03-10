import { GraphQLObjectType } from 'graphql';
import { GraphQLClient } from 'graphql-request';
import type { ParseNodes } from '../universal/ast-parser';
import type { ClassType, QueryPromise } from '../universal/common';
import type {
    MaybeNull,
    NullablePrimitiveTypeAndArray,
    ParseNullablePrimitiveTypeAndArray,
    VariablesOf,
    VariablesType,
} from '../universal/graphql-types';
import type { QueryNode } from '../universal/query-nodes';
import type { ObjectSelector } from './ast-builder';

export declare const createObjectSelectorOn: <
  T extends Record<string, any>,
  const R extends readonly QueryNode[],
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
  private readonly client;

  constructor(endpoint: string, requestConfig?: GraphQLClient['requestConfig']);

  getGraphQLClient(): GraphQLClient;

  query(operationName: string): () => QueryPromise<void>;
  query<const VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
  ): (variables: VariablesOf<VT>) => QueryPromise<void>;
  query<T extends NullablePrimitiveTypeAndArray, const VT extends VariablesType>(
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

  mutation(operationName: string): () => QueryPromise<void>;
  mutation<const VT extends VariablesType>(
    operationName: string,
    variablesType: VT,
  ): (variables: VariablesOf<VT>) => QueryPromise<void>;
  mutation<T extends NullablePrimitiveTypeAndArray, const VT extends VariablesType>(
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
}
