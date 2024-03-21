import { GraphQLClient as RequestClient } from 'graphql-request';
import { createClient as createWSClient } from 'graphql-ws';

import { buildQueryString } from './query-builder';
import { createAllSelector, parseSelector } from './selector';
import { createTypeParser } from './type-parser';
import { capitalize, omit, pick, requiredKeysCount } from './utils';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - `schema` is only used in doc
import type { schema } from './types';
import type { ObjectSelector } from './types/ast-builder';
import type { ParseNodes } from './types/ast-parser';
import type {
  Cast,
  Get,
  QueryPromise,
  RequiredFields,
  RequiredFieldsCount,
  StringLiteral,
  SubscriptionResponse,
  TrimEnd,
  TuplifyLiteralStringUnion,
} from './types/common';
import type {
  FunctionCollection,
  ParseInput,
  ParseReturnType,
  TypeCollection,
  WrapByType,
} from './types/graphql-types';
import type { QueryNode } from './types/query-node';
import type { ValidateSchema } from './types/validator';
import type { Client as WSClient, ClientOptions as WSClientOptions } from 'graphql-ws';

type OperationResponse<
  TMethod extends 'query' | 'mutation' | 'subscription',
  T,
> = TMethod extends 'subscription' ? SubscriptionResponse<T> : QueryPromise<T>;

type ByMixin<TInput extends Record<string, string>, $, R> = RequiredFieldsCount<TInput> extends 0
  ? ByMixinHelper<TInput, TuplifyLiteralStringUnion<keyof TInput>, $, R>
  : RequiredFieldsCount<TInput> extends 1
  ? ByMixinHelper<TInput, [RequiredFields<TInput>], $, R>
  : Record<string, never>;
type ByMixinHelper<TInput, TKeys, $, R, Result = unknown> = TKeys extends readonly [
  infer TKey,
  ...infer TRest extends any[],
]
  ? ByMixinHelper<
      TInput,
      TRest,
      $,
      R,
      Result &
        Record<
          `by${Capitalize<TrimEnd<Cast<TKey, string>, '?'>>}`,
          (
            arg: NonNullable<
              ParseInput<TInput, $>[Cast<
                TrimEnd<Cast<TKey, string>, '?'>,
                keyof ParseInput<TInput, $>
              >]
            >,
          ) => R
        >
    >
  : Result;

type NormalizeFunctionRepresentation<F> = F extends ['=>', infer TReturn]
  ? [Record<string, never>, '=>', TReturn]
  : F;

type OperationFunction<
  TMethod extends 'query' | 'mutation' | 'subscription',
  $ extends TypeCollection,
  TOperations extends FunctionCollection,
> = <ON extends keyof TOperations>(
  operationName: ON,
) => NormalizeFunctionRepresentation<TOperations[ON]> extends [
  infer TInput extends Record<string, string>,
  '=>',
  infer TReturn extends StringLiteral,
]
  ? ParseReturnType<TReturn, $> extends {
      result: infer R;
      type: infer T;
    }
    ? [R] extends [object]
      ? ParseInput<TInput, $> extends Record<string, never>
        ? {
            select: <const TQueryNodes extends readonly QueryNode[]>(
              selector: ObjectSelector<R, TQueryNodes>,
            ) => OperationResponse<
              TMethod,
              WrapByType<ParseNodes<TQueryNodes>, Cast<T, StringLiteral>>
            >;
          } & OperationResponse<TMethod, WrapByType<R, Cast<T, StringLiteral>>>
        : {
            select: <const TQueryNodes extends readonly QueryNode[]>(
              selector: ObjectSelector<R, TQueryNodes>,
            ) => {
              by: (
                input: ParseInput<TInput, $>,
              ) => OperationResponse<
                TMethod,
                WrapByType<ParseNodes<TQueryNodes>, Cast<T, StringLiteral>>
              >;
            } & ByMixin<
              TInput,
              $,
              OperationResponse<
                TMethod,
                WrapByType<ParseNodes<TQueryNodes>, Cast<T, StringLiteral>>
              >
            > &
              (RequiredFieldsCount<TInput> extends 0
                ? OperationResponse<
                    TMethod,
                    WrapByType<ParseNodes<TQueryNodes>, Cast<T, StringLiteral>>
                  >
                : unknown);
            by: (
              input: ParseInput<TInput, $>,
            ) => OperationResponse<TMethod, WrapByType<R, Cast<T, StringLiteral>>>;
          } & ByMixin<
            TInput,
            $,
            OperationResponse<TMethod, WrapByType<R, Cast<T, StringLiteral>>>
          > &
            (RequiredFieldsCount<TInput> extends 0
              ? OperationResponse<TMethod, WrapByType<R, Cast<T, StringLiteral>>>
              : unknown)
      : TInput extends Record<string, never>
      ? OperationResponse<TMethod, WrapByType<R, Cast<T, StringLiteral>>>
      : {
          by: (
            input: ParseInput<TInput, $>,
          ) => OperationResponse<TMethod, WrapByType<R, Cast<T, StringLiteral>>>;
        } & ByMixin<TInput, $, OperationResponse<TMethod, WrapByType<R, Cast<T, StringLiteral>>>> &
          (RequiredFieldsCount<TInput> extends 0
            ? OperationResponse<TMethod, WrapByType<R, Cast<T, StringLiteral>>>
            : unknown)
    : never
  : never;

type QueryFunction<
  TQueries extends FunctionCollection,
  $ extends TypeCollection,
> = OperationFunction<'query', $, TQueries>;
type MutationFunction<
  TMutations extends FunctionCollection,
  $ extends TypeCollection,
> = OperationFunction<'mutation', $, TMutations>;
type SubscriptionFunction<
  TSubscriptions extends FunctionCollection,
  $ extends TypeCollection,
> = OperationFunction<'subscription', $, TSubscriptions>;

type AbstractClient = {
  getRequestClient: () => RequestClient;
  getWSClient: () => WSClient;
};

/**
 * The GraphQL client.
 */
export type Client<
  $ extends TypeCollection,
  TQueries extends FunctionCollection = Record<string, never>,
  TMutations extends FunctionCollection = Record<string, never>,
  TSubscriptions extends FunctionCollection = Record<string, never>,
> = AbstractClient &
  (TQueries extends Record<string, never>
    ? Record<string, never>
    : // HACK: Spread `$` immediately to make type information more readable
      { query: QueryFunction<TQueries, { [P in keyof $]: $[P] }> }) &
  (TMutations extends Record<string, never>
    ? Record<string, never>
    : // HACK: Spread `$` immediately to make type information more readable
      { mutation: MutationFunction<TMutations, { [P in keyof $]: $[P] }> }) &
  (TSubscriptions extends Record<string, never>
    ? Record<string, never>
    : // HACK: Spread `$` immediately to make type information more readable
      { subscription: SubscriptionFunction<TSubscriptions, { [P in keyof $]: $[P] }> });

const _createClient = <
  T,
  $ extends TypeCollection = Cast<Omit<T, 'Query' | 'Mutation' | 'Subscription'>, TypeCollection>,
  TQueries extends FunctionCollection = Cast<
    Get<T, 'Query', Record<string, never>>,
    FunctionCollection
  >,
  TMutations extends FunctionCollection = Cast<
    Get<T, 'Mutation', Record<string, never>>,
    FunctionCollection
  >,
  TSubscriptions extends FunctionCollection = Cast<
    Get<T, 'Subscription', Record<string, never>>,
    FunctionCollection
  >,
>(
  requestClient: RequestClient,
  wsClient: WSClient,
  rawTypes: ValidateSchema<T>,
): Client<$, TQueries, TMutations, TSubscriptions> => {
  const cancelledPromises = new WeakSet<Promise<any>>();

  const _rawTypes = rawTypes as
    | TypeCollection
    | {
        Query?: FunctionCollection;
        Mutation?: FunctionCollection;
        Subscription?: FunctionCollection;
      };

  const $ = omit(_rawTypes, 'Query', 'Mutation', 'Subscription') as TypeCollection;

  const queries = (_rawTypes.Query ?? {}) as FunctionCollection;
  const mutations = (_rawTypes.Mutation ?? {}) as FunctionCollection;
  const subscriptions = (_rawTypes.Subscription ?? {}) as FunctionCollection;

  const typeParser = createTypeParser($);
  const compileOperations = (
    operations: FunctionCollection,
  ): Record<
    string,
    {
      inputType: Record<string, string>;
      returnType: string;
      hasInput: boolean;
      isReturnTypeSimple: boolean;
    }
  > =>
    Object.entries(operations).reduce((prev, [operationName, functionRepresentation]) => {
      const [inputType, returnType] =
        functionRepresentation.length === 3
          ? [functionRepresentation[0], functionRepresentation[2]]
          : [{}, functionRepresentation[1]];
      return {
        ...prev,
        [operationName]: {
          inputType: Object.entries(inputType).reduce(
            (prev, [name, type]) => ({
              ...prev,
              [name.replace(/\?$/, '')]: name.endsWith('?') ? typeParser.nullable(type) : type,
            }),
            {},
          ),
          returnType,
          hasInput: Object.keys(inputType).length > 0,
          isReturnTypeSimple: typeParser.isSimpleType(returnType),
        },
      };
    }, {});

  const preCompiledQueries = compileOperations(queries);
  const preCompiledMutations = compileOperations(mutations);
  const preCompiledSubscriptions = compileOperations(subscriptions);

  const buildOperationResponse = <TMethod extends 'query' | 'mutation' | 'subscription'>(
    method: TMethod,
    operationName: string,
    inputType: Record<string, string>,
    input: Record<string, any>,
    ast: readonly QueryNode[],
  ): TMethod extends 'subscription' ? SubscriptionResponse<any> : QueryPromise<any> => {
    const queryString = buildQueryString(method, operationName, inputType, ast);

    if (method === 'subscription')
      return {
        subscribe: (
          subscriber: (data: any) => void,
          onError?: (error: any) => void,
          onComplete?: () => void,
        ) =>
          wsClient.subscribe(
            { query: queryString, variables: input },
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
          ),
        toQueryString: () => queryString,
        toRequestBody: () => ({ query: queryString, variables: input }),
      } as any;

    const result: any = Promise.resolve(null).then(() => {
      if (cancelledPromises.has(result)) return;

      return requestClient.request(queryString, input).then((data) => (data as any)[operationName]);
    });
    result.toQueryString = () => queryString;
    result.toRequestBody = () => ({ query: queryString, variables: input });
    return result;
  };

  const buildOperationFunction =
    (method: 'query' | 'mutation' | 'subscription') => (operationName: string) => {
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
      if (!operation.hasInput) {
        const ast = operation.isReturnTypeSimple
          ? []
          : parseSelector(createAllSelector(operation.returnType, $));
        result = buildOperationResponse(method, operationName, {}, {}, ast);

        if (operation.isReturnTypeSimple) return result;
      }

      const inputType = rawOperation.length === 3 ? rawOperation[0] : {};

      if (operation.hasInput) {
        if (requiredKeysCount(inputType) === 0) {
          const ast = operation.isReturnTypeSimple
            ? []
            : parseSelector(createAllSelector(operation.returnType, $));
          result = buildOperationResponse(method, operationName, {}, {}, ast);
        }

        result.by = (input: any) => {
          cancelledPromises.add(result);
          const ast = operation.isReturnTypeSimple
            ? []
            : parseSelector(createAllSelector(operation.returnType, $));
          return buildOperationResponse(
            method,
            operationName,
            pick(operation.inputType, ...Object.keys(input)),
            input,
            ast,
          );
        };

        if (requiredKeysCount(inputType) === 1) {
          const name = Object.keys(operation.inputType)[0];
          result[`by${capitalize(name)}`] = (arg: any) => result.by({ [name]: arg });
        }
        if (requiredKeysCount(inputType) === 0) {
          for (const name of Object.keys(operation.inputType)) {
            result[`by${capitalize(name)}`] = (arg: any) => result.by({ [name]: arg });
          }
        }

        if (operation.isReturnTypeSimple) return result;
      }

      result.select = (selector: any) => {
        if (!operation.hasInput) {
          cancelledPromises.add(result);
          const ast = parseSelector(selector);
          return buildOperationResponse(method, operationName, {}, {}, ast);
        }

        if (requiredKeysCount(inputType) === 0) {
          cancelledPromises.add(result);
          const by = result.by;
          const select = result.select;
          const ast = parseSelector(selector);
          result = buildOperationResponse(method, operationName, {}, {}, ast);
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
              input,
              ast,
            );
          },
        };

        if (requiredKeysCount(inputType) === 1) {
          const name = Object.keys(operation.inputType)[0];
          res[`by${capitalize(name)}`] = (arg: any) => res.by({ [name]: arg });
        }
        if (requiredKeysCount(inputType) === 0) {
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
      $ extends TypeCollection = Cast<
        Omit<T, 'Query' | 'Mutation' | 'Subscription'>,
        TypeCollection
      >,
      TQueries extends FunctionCollection = Cast<
        Get<T, 'Query', Record<string, never>>,
        FunctionCollection
      >,
      TMutations extends FunctionCollection = Cast<
        Get<T, 'Mutation', Record<string, never>>,
        FunctionCollection
      >,
      TSubscriptions extends FunctionCollection = Cast<
        Get<T, 'Subscription', Record<string, never>>,
        FunctionCollection
      >,
    >(
      types: ValidateSchema<T>,
    ): Client<$, TQueries, TMutations, TSubscriptions> => {
      const requestClient = new RequestClient(url, options);
      const wsClient = createWSClient(wsOptions);
      return _createClient(requestClient, wsClient, types);
    },
  }),

  withSchema: <
    T,
    $ extends TypeCollection = Cast<Omit<T, 'Query' | 'Mutation' | 'Subscription'>, TypeCollection>,
    TQueries extends FunctionCollection = Cast<
      Get<T, 'Query', Record<string, never>>,
      FunctionCollection
    >,
    TMutations extends FunctionCollection = Cast<
      Get<T, 'Mutation', Record<string, never>>,
      FunctionCollection
    >,
  >(
    types: ValidateSchema<T>,
  ): Client<$, TQueries, TMutations> => {
    const requestClient = new RequestClient(url, options);
    return _createClient(requestClient, null as never, types);
  },
});

/**
 * Infer the client type from a GraphQL schema.
 */
export type InferClientFromSchema<
  TSchema extends
    | {
        Query?: FunctionCollection;
        Mutation?: FunctionCollection;
        Subscription?: FunctionCollection;
      }
    | TypeCollection,
> = Client<
  Cast<Omit<TSchema, 'Query' | 'Mutation' | 'Subscription'>, TypeCollection>,
  Cast<Get<TSchema, 'Query', Record<string, never>>, FunctionCollection>,
  Cast<Get<TSchema, 'Mutation', Record<string, never>>, FunctionCollection>,
  Cast<Get<TSchema, 'Subscription', Record<string, never>>, FunctionCollection>
>;
