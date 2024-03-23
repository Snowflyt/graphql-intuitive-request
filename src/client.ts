import { GraphQLClient as RequestClient } from 'graphql-request';
import { createClient as createWSClient } from 'graphql-ws';

import { buildQueryString } from './query-builder';
import { createAllSelector, parseSelector } from './selector';
import { createTypeParser } from './type-parser';
import { capitalize, mapObject, mapObjectValues, omit, pick, requiredKeysCount } from './utils';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - `schema` is only used in doc
import type { schema } from './types';
import type { MutationFunction, QueryFunction, SubscriptionFunction } from './types/client-tools';
import type { Obj, QueryPromise, SimpleSpread, SubscriptionResponse } from './types/common';
import type { OperationCollection, TypeCollection } from './types/graphql-types';
import type { QueryNode } from './types/query-node';
import type { ValidateSchema } from './types/validator';
import type { Client as WSClient, ClientOptions as WSClientOptions } from 'graphql-ws';

interface AbstractClient {
  getRequestClient: () => RequestClient;
  getWSClient: () => WSClient;
}

/**
 * The GraphQL client.
 */
export type Client<$, TQueries = {}, TMutations = {}, TSubscriptions = {}> = SimpleSpread<
  AbstractClient,
  Obj.IfNotEmpty<
    TQueries,
    // HACK: Spread `$` immediately to make type information more readable
    { query: QueryFunction<TQueries, { [P in keyof $]: $[P] }> }
  >,
  Obj.IfNotEmpty<
    TMutations,
    // HACK: Spread `$` immediately to make type information more readable
    { mutation: MutationFunction<TMutations, { [P in keyof $]: $[P] }> }
  >,
  Obj.IfNotEmpty<
    TSubscriptions,
    // HACK: Spread `$` immediately to make type information more readable
    { subscription: SubscriptionFunction<TSubscriptions, { [P in keyof $]: $[P] }> }
  >
>;

const _createClient = <
  T,
  $ = Omit<T, 'Query' | 'Mutation' | 'Subscription'>,
  TQueries = Obj.Get<T, 'Query', {}>,
  TMutations = Obj.Get<T, 'Mutation', {}>,
  TSubscriptions = Obj.Get<T, 'Subscription', {}>,
>(
  requestClient: RequestClient,
  wsClient: WSClient,
  rawTypes: ValidateSchema<T>,
): Client<$, TQueries, TMutations, TSubscriptions> => {
  const cancelledPromises = new WeakSet<Promise<any>>();

  const _rawTypes = rawTypes as
    | TypeCollection
    | {
        Query?: OperationCollection;
        Mutation?: OperationCollection;
        Subscription?: OperationCollection;
      };

  const $ = omit(_rawTypes, 'Query', 'Mutation', 'Subscription') as TypeCollection;

  type NormalizedOperations = ReturnType<typeof normalizeOperations>;
  const normalizeOperations = (collection: OperationCollection) =>
    mapObjectValues(collection, (value) =>
      value.length === 3
        ? { inputType: value[0], returnType: value[2] }
        : { inputType: {}, returnType: value[1] },
    );

  const queries = normalizeOperations((_rawTypes.Query as OperationCollection) ?? {});
  const mutations = normalizeOperations((_rawTypes.Mutation as OperationCollection) ?? {});
  const subscriptions = normalizeOperations((_rawTypes.Subscription as OperationCollection) ?? {});

  const typeParser = createTypeParser($);
  const compileOperations = (operations: NormalizedOperations) =>
    mapObjectValues(operations, ({ inputType, returnType }) => ({
      inputType: mapObject(inputType, ([name, type]) => [
        name.replace(/\?$/, ''),
        name.endsWith('?') ? typeParser.nullable(type) : type,
      ]),
      returnType,
      hasInput: Object.keys(inputType).length > 0,
      isReturnTypeScalar: typeParser.isScalarType(returnType),
    }));

  const preCompiledQueries = compileOperations(queries);
  const preCompiledMutations = compileOperations(mutations);
  const preCompiledSubscriptions = compileOperations(subscriptions);

  const buildOperationResponse = <TMethod extends 'query' | 'mutation' | 'subscription'>(
    method: TMethod,
    operationName: string,
    inputType: Record<string, string>,
    returnType: string,
    input: Record<string, any>,
    ast: readonly QueryNode[] | (() => readonly QueryNode[]),
  ): TMethod extends 'subscription' ? SubscriptionResponse<any> : QueryPromise<any> => {
    const { queryString, variables } = (() => {
      let cached: ReturnType<typeof buildQueryString> | null = null;
      return {
        queryString: () => {
          if (cached) return cached.queryString;
          cached = buildQueryString(
            method,
            operationName,
            inputType,
            returnType,
            $,
            typeof ast === 'function' ? ast() : ast,
          );
          return cached.queryString;
        },
        variables: () => {
          if (cached) return cached.variables;
          cached = buildQueryString(
            method,
            operationName,
            inputType,
            returnType,
            $,
            typeof ast === 'function' ? ast() : ast,
          );
          return cached.variables;
        },
      };
    })();

    if (method === 'subscription')
      return {
        subscribe: (
          subscriber: (data: any) => void,
          onError?: (error: any) => void,
          onComplete?: () => void,
        ) =>
          wsClient.subscribe(
            { query: queryString(), variables: { ...input, ...variables() } },
            {
              next: (value) => {
                if (value.errors) onError?.(value.errors);
                if (value.data) subscriber(value.data[operationName]);
              },
              error: (error) => {
                onError?.(error);
              },
              complete: () => {
                onComplete?.();
              },
            },
          ),
        toQueryString: () => queryString(),
        toRequestBody: () => ({ query: queryString(), variables: { ...input, ...variables() } }),
      } as any;

    const result: any = Promise.resolve(null).then(() => {
      if (cancelledPromises.has(result)) return;

      return requestClient
        .request(queryString(), { ...input, ...variables() })
        .then((data) => (data as any)[operationName]);
    });
    result.toQueryString = () => queryString();
    result.toRequestBody = () => ({
      query: queryString(),
      variables: { ...input, ...variables() },
    });
    return result;
  };

  const buildOperationFunction =
    (method: 'query' | 'mutation' | 'subscription') => (operationName: string, input?: any) => {
      const rawOperation =
        method === 'query'
          ? queries[operationName]
          : method === 'mutation'
          ? mutations[operationName]
          : subscriptions[operationName];
      const operation =
        method === 'query'
          ? preCompiledQueries[operationName]
          : method === 'mutation'
          ? preCompiledMutations[operationName]
          : preCompiledSubscriptions[operationName];

      let result: any = {};
      if (!operation.hasInput || input !== undefined) {
        const ast = () =>
          operation.isReturnTypeScalar
            ? []
            : parseSelector(createAllSelector(operation.returnType, $));
        result =
          input === undefined
            ? buildOperationResponse(method, operationName, {}, operation.returnType, {}, ast)
            : buildOperationResponse(
                method,
                operationName,
                pick(operation.inputType, ...Object.keys(input)),
                operation.returnType,
                input,
                ast,
              );

        if (operation.isReturnTypeScalar) return result;
      }

      if (operation.hasInput && input === undefined) {
        if (requiredKeysCount(rawOperation.inputType) === 0) {
          // eslint-disable-next-line sonarjs/no-identical-functions
          const ast = () =>
            operation.isReturnTypeScalar
              ? []
              : parseSelector(createAllSelector(operation.returnType, $));
          result = buildOperationResponse(method, operationName, {}, operation.returnType, {}, ast);
        }

        result.by = (input: any) => {
          cancelledPromises.add(result);
          // eslint-disable-next-line sonarjs/no-identical-functions
          const ast = () =>
            operation.isReturnTypeScalar
              ? []
              : parseSelector(createAllSelector(operation.returnType, $));
          return buildOperationResponse(
            method,
            operationName,
            pick(operation.inputType, ...Object.keys(input)),
            operation.returnType,
            input,
            ast,
          );
        };

        if (requiredKeysCount(rawOperation.inputType) === 1) {
          const name = Object.keys(operation.inputType)[0];
          result[`by${capitalize(name)}`] = (arg: any) => result.by({ [name]: arg });
        }
        if (requiredKeysCount(rawOperation.inputType) === 0) {
          for (const name of Object.keys(operation.inputType)) {
            result[`by${capitalize(name)}`] = (arg: any) => result.by({ [name]: arg });
          }
        }

        if (operation.isReturnTypeScalar) return result;
      }

      result.select = (selector: any) => {
        if (!operation.hasInput || input !== undefined) {
          cancelledPromises.add(result);
          const ast = parseSelector(selector);
          return input === undefined
            ? buildOperationResponse(method, operationName, {}, operation.returnType, {}, ast)
            : buildOperationResponse(
                method,
                operationName,
                pick(operation.inputType, ...Object.keys(input)),
                operation.returnType,
                input,
                ast,
              );
        }

        if (requiredKeysCount(rawOperation.inputType) === 0) {
          cancelledPromises.add(result);
          const by = result.by;
          const select = result.select;
          const ast = parseSelector(selector);
          result = buildOperationResponse(method, operationName, {}, operation.returnType, {}, ast);
          if (by) result.by = by;
          result.select = select;
        }

        const res: any = {
          by: (input: any) => {
            cancelledPromises.add(result);
            const ast = parseSelector(selector);
            return buildOperationResponse(
              method,
              operationName,
              pick(operation.inputType, ...Object.keys(input)),
              operation.returnType,
              input,
              ast,
            );
          },
        };

        if (requiredKeysCount(rawOperation.inputType) === 1) {
          const name = Object.keys(operation.inputType)[0];
          res[`by${capitalize(name)}`] = (arg: any) => res.by({ [name]: arg });
        }
        if (requiredKeysCount(rawOperation.inputType) === 0) {
          for (const name of Object.keys(operation.inputType))
            res[`by${capitalize(name)}`] = (arg: any) => res.by({ [name]: arg });
        }

        return res;
      };

      return result;
    };

  return {
    query: buildOperationFunction('query'),
    mutation: buildOperationFunction('mutation'),
    subscription: buildOperationFunction('subscription'),

    getRequestClient: () => requestClient,
    getWSClient: () => wsClient,
  } as any;
};

/**
 * Configuration used for the internally-used `graphql-request` client.
 */
export type ClientOptions = RequestClient['requestConfig'];
/**
 * Configuration used for the GraphQL over WebSocket client (from `graphql-ws`).
 */
export type WSOptions = WSClientOptions;

/**
 * Create a new GraphQL client.
 * @param url The URL of the GraphQL server.
 * @param options The options for the internally-used `graphql-request` client used by the client.
 * @returns
 */
export const createClient = (url: string, options?: RequestClient['requestConfig']) => ({
  /**
   * Register a WebSocket client to be used for subscriptions.
   * @param wsOptions The options for the WebSocket client (from `graphql-ws`).
   * @returns
   */
  withWebSocketClient: (wsOptions: WSOptions) => ({
    /**
     * Register a GraphQL schema to be used by the client.
     *
     * If you want to define the schema externally, you can use the {@link schema} function.
     * @param types
     * @returns
     */
    withSchema: <
      T,
      $ = Omit<T, 'Query' | 'Mutation' | 'Subscription'>,
      TQueries = Obj.Get<T, 'Query', {}>,
      TMutations = Obj.Get<T, 'Mutation', {}>,
      TSubscriptions = Obj.Get<T, 'Subscription', {}>,
    >(
      types: ValidateSchema<T>,
    ): Client<$, TQueries, TMutations, TSubscriptions> => {
      const requestClient = new RequestClient(url, options);
      const wsClient = createWSClient(wsOptions);
      return _createClient(requestClient, wsClient, types) as never;
    },
  }),

  withSchema: <
    T,
    $ = Omit<T, 'Query' | 'Mutation' | 'Subscription'>,
    TQueries = Obj.Get<T, 'Query', {}>,
    TMutations = Obj.Get<T, 'Mutation', {}>,
  >(
    types: ValidateSchema<T>,
  ): Client<$, TQueries, TMutations> => {
    const requestClient = new RequestClient(url, options);
    return _createClient(requestClient, null as never, types) as never;
  },
});

/**
 * Infer the client type from a GraphQL schema.
 */
export type InferClientFromSchema<TSchema> = Client<
  Omit<TSchema, 'Query' | 'Mutation' | 'Subscription'>,
  Obj.Get<TSchema, 'Query', {}>,
  Obj.Get<TSchema, 'Mutation', {}>,
  Obj.Get<TSchema, 'Subscription', {}>
>;
