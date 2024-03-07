import { GraphQLClient as RequestClient } from 'graphql-request';
import { createClient as createWSClient } from 'graphql-ws';

import { buildQueryString } from './query-builder';
import { createAllSelector, parseSelector } from './selector';
import { createTypeParser } from './type-parser';
import { capitalize, omit, pick, requiredKeysCount } from './utils';

import type { Types } from './types';
import type { ObjectSelector } from './types/ast-builder';
import type { ParseNodes } from './types/ast-parser';
import type {
  Cast,
  QueryPromise,
  RequiredFields,
  RequiredFieldsCount,
  StringLiteral,
  SubscriptionResponse,
  TrimEnd,
  TuplifyLiteralStringUnion,
  WithDefault,
} from './types/common';
import type {
  FunctionCollection,
  ParseReturnType,
  TypeCollection,
  VariablesOf,
  WrapByType,
} from './types/graphql-types';
import type { QueryNode } from './types/query-node';
import type { Client as WSClient, ClientOptions as WSClientOptions } from 'graphql-ws';

type OperationResponse<
  TMethod extends 'query' | 'mutation' | 'subscription',
  T,
> = TMethod extends 'subscription' ? SubscriptionResponse<T> : QueryPromise<T>;

type ByMixin<
  TVariables extends Record<string, string>,
  $,
  R,
> = RequiredFieldsCount<TVariables> extends 0
  ? ByMixinHelper<TVariables, TuplifyLiteralStringUnion<keyof TVariables>, $, R>
  : RequiredFieldsCount<TVariables> extends 1
  ? ByMixinHelper<TVariables, [RequiredFields<TVariables>], $, R>
  : Record<string, never>;
type ByMixinHelper<TVariables, TKeys, $, R, Result = unknown> = TKeys extends readonly [
  infer TKey,
  ...infer TRest extends any[],
]
  ? ByMixinHelper<
      TVariables,
      TRest,
      $,
      R,
      Result &
        Record<
          `by${Capitalize<TrimEnd<Cast<TKey, string>, '?'>>}`,
          (
            arg: NonNullable<
              VariablesOf<TVariables, $>[Cast<
                TrimEnd<Cast<TKey, string>, '?'>,
                keyof VariablesOf<TVariables, $>
              >]
            >,
          ) => R
        >
    >
  : Result;

type OperationFunction<
  TMethod extends 'query' | 'mutation' | 'subscription',
  TTypes extends TypeCollection,
  TOperations extends FunctionCollection,
> = <ON extends keyof TOperations>(
  operationName: ON,
) => ParseReturnType<TOperations[ON][1], TTypes> extends {
  result: infer R;
  type: infer T;
}
  ? R extends object
    ? VariablesOf<TOperations[ON][0], TTypes> extends Record<string, never>
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
              variables: VariablesOf<TOperations[ON][0], TTypes>,
            ) => OperationResponse<
              TMethod,
              WrapByType<ParseNodes<TQueryNodes>, Cast<T, StringLiteral>>
            >;
          } & ByMixin<
            TOperations[ON][0],
            TTypes,
            OperationResponse<TMethod, WrapByType<ParseNodes<TQueryNodes>, Cast<T, StringLiteral>>>
          > &
            (RequiredFieldsCount<TOperations[ON][0]> extends 0
              ? OperationResponse<
                  TMethod,
                  WrapByType<ParseNodes<TQueryNodes>, Cast<T, StringLiteral>>
                >
              : unknown);
          by: (
            variables: VariablesOf<TOperations[ON][0], TTypes>,
          ) => OperationResponse<TMethod, WrapByType<R, Cast<T, StringLiteral>>>;
        } & ByMixin<
          TOperations[ON][0],
          TTypes,
          OperationResponse<TMethod, WrapByType<R, Cast<T, StringLiteral>>>
        > &
          (RequiredFieldsCount<TOperations[ON][0]> extends 0
            ? OperationResponse<TMethod, WrapByType<R, Cast<T, StringLiteral>>>
            : unknown)
    : TOperations[typeof operationName][0] extends Record<string, never>
    ? OperationResponse<TMethod, WrapByType<R, Cast<T, StringLiteral>>>
    : {
        by: (
          variables: VariablesOf<TOperations[typeof operationName][0], TTypes>,
        ) => OperationResponse<TMethod, WrapByType<R, Cast<T, StringLiteral>>>;
      } & ByMixin<
        TOperations[ON][0],
        TTypes,
        OperationResponse<TMethod, WrapByType<R, Cast<T, StringLiteral>>>
      > &
        (RequiredFieldsCount<TOperations[ON][0]> extends 0
          ? OperationResponse<TMethod, WrapByType<R, Cast<T, StringLiteral>>>
          : unknown)
  : never;

type AbstractClient = {
  getRequestClient: () => RequestClient;
  getWSClient: () => WSClient;
};

export type Client<
  TTypes extends TypeCollection,
  TQueries extends FunctionCollection = Record<string, never>,
  TMutations extends FunctionCollection = Record<string, never>,
  TSubscriptions extends FunctionCollection = Record<string, never>,
> = AbstractClient &
  (TQueries extends Record<string, never>
    ? Record<string, never>
    : { query: OperationFunction<'query', TTypes, TQueries> }) &
  (TMutations extends Record<string, never>
    ? Record<string, never>
    : { mutation: OperationFunction<'mutation', TTypes, TMutations> }) &
  (TSubscriptions extends Record<string, never>
    ? Record<string, never>
    : {
        subscription: OperationFunction<'subscription', TTypes, TSubscriptions>;
      });

const _createClient = <
  T extends
    | {
        Query?: FunctionCollection;
        Mutation?: FunctionCollection;
        Subscription?: FunctionCollection;
      }
    | TypeCollection,
  TTypes extends TypeCollection = Cast<
    Omit<T, 'Query' | 'Mutation' | 'Subscription'>,
    TypeCollection
  >,
  TQueries extends FunctionCollection = Cast<
    WithDefault<T['Query'], Record<string, never>>,
    FunctionCollection
  >,
  TMutations extends FunctionCollection = Cast<
    WithDefault<T['Mutation'], Record<string, never>>,
    FunctionCollection
  >,
  TSubscriptions extends FunctionCollection = Cast<
    WithDefault<T['Subscription'], Record<string, never>>,
    FunctionCollection
  >,
>(
  requestClient: RequestClient,
  wsClient: WSClient,
  rawTypes: Types<T>,
): Client<TTypes, TQueries, TMutations, TSubscriptions> => {
  const cancelledPromises = new WeakSet<Promise<any>>();

  const $ = omit(rawTypes, 'Query', 'Mutation', 'Subscription') as TypeCollection;

  const queries = (rawTypes.Query ?? {}) as FunctionCollection;
  const mutations = (rawTypes.Mutation ?? {}) as FunctionCollection;
  const subscriptions = (rawTypes.Subscription ?? {}) as FunctionCollection;

  const typeParser = createTypeParser($);
  const compileOperations = (
    operations: FunctionCollection,
  ): Record<
    string,
    {
      variableTypes: Record<string, string>;
      returnType: string;
      hasVariables: boolean;
      isReturnTypeSimple: boolean;
    }
  > =>
    Object.entries(operations).reduce(
      (prev, [operationName, [variablesType, returnType]]) => ({
        ...prev,
        [operationName]: {
          variableTypes: Object.entries(variablesType).reduce(
            (prev, [variableName, variableType]) => ({
              ...prev,
              [variableName.replace(/\?$/, '')]: variableName.endsWith('?')
                ? typeParser.nullable(variableType)
                : variableType,
            }),
            {},
          ),
          returnType,
          hasVariables: Object.keys(variablesType).length > 0,
          isReturnTypeSimple: typeParser.isSimpleType(returnType),
        },
      }),
      {},
    );

  const preCompiledQueries = compileOperations(queries);
  const preCompiledMutations = compileOperations(mutations);
  const preCompiledSubscriptions = compileOperations(subscriptions);

  const buildOperationResponse = <TMethod extends 'query' | 'mutation' | 'subscription'>(
    method: TMethod,
    operationName: string,
    variableTypes: Record<string, string>,
    variables: Record<string, any>,
    ast: readonly QueryNode[],
  ): TMethod extends 'subscription' ? SubscriptionResponse<any> : QueryPromise<any> => {
    const queryString = buildQueryString(method, operationName, variableTypes, ast);

    if (method === 'subscription')
      return {
        subscribe: (
          subscriber: (data: any) => void,
          onError?: (error: any) => void,
          onComplete?: () => void,
        ) =>
          wsClient.subscribe(
            { query: queryString, variables },
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
        toRequestBody: () => ({ query: queryString, variables }),
      } as any;

    const result: any = Promise.resolve(null).then(() => {
      if (cancelledPromises.has(result)) return;

      return requestClient
        .request(queryString, variables)
        .then((data) => (data as any)[operationName]);
    });
    result.toQueryString = () => queryString;
    result.toRequestBody = () => ({ query: queryString, variables });
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
      if (!operation.hasVariables) {
        const ast = operation.isReturnTypeSimple
          ? []
          : parseSelector(createAllSelector(operation.returnType, $));
        result = buildOperationResponse(method, operationName, {}, {}, ast);

        if (operation.isReturnTypeSimple) return result;
      }

      if (operation.hasVariables) {
        if (requiredKeysCount(rawOperation[0]) === 0) {
          const ast = operation.isReturnTypeSimple
            ? []
            : parseSelector(createAllSelector(operation.returnType, $));
          result = buildOperationResponse(method, operationName, {}, {}, ast);
        }

        result.by = (variables: any) => {
          cancelledPromises.add(result);
          const ast = operation.isReturnTypeSimple
            ? []
            : parseSelector(createAllSelector(operation.returnType, $));
          return buildOperationResponse(
            method,
            operationName,
            pick(operation.variableTypes, ...Object.keys(variables)),
            variables,
            ast,
          );
        };

        if (requiredKeysCount(rawOperation[0]) === 1) {
          const variableName = Object.keys(operation.variableTypes)[0];
          result[`by${capitalize(variableName)}`] = (arg: any) =>
            result.by({ [variableName]: arg });
        }
        if (requiredKeysCount(rawOperation[0]) === 0) {
          for (const variableName of Object.keys(operation.variableTypes)) {
            result[`by${capitalize(variableName)}`] = (arg: any) =>
              result.by({ [variableName]: arg });
          }
        }

        if (operation.isReturnTypeSimple) return result;
      }

      result.select = (selector: any) => {
        if (!operation.hasVariables) {
          cancelledPromises.add(result);
          const ast = parseSelector(selector);
          return buildOperationResponse(method, operationName, {}, {}, ast);
        }

        if (requiredKeysCount(rawOperation[0]) === 0) {
          cancelledPromises.add(result);
          const by = result.by;
          const select = result.select;
          const ast = parseSelector(selector);
          result = buildOperationResponse(method, operationName, {}, {}, ast);
          if (by) result.by = by;
          result.select = select;
        }

        const res: any = {
          by: (variables: any) => {
            cancelledPromises.add(result);
            const ast = parseSelector(selector);
            return buildOperationResponse(
              method,
              operationName,
              pick(operation.variableTypes, ...Object.keys(variables)),
              variables,
              ast,
            );
          },
        };

        if (requiredKeysCount(rawOperation[0]) === 1) {
          const variableName = Object.keys(operation.variableTypes)[0];
          res[`by${capitalize(variableName)}`] = (arg: any) => res.by({ [variableName]: arg });
        }
        if (requiredKeysCount(rawOperation[0]) === 0) {
          for (const variableName of Object.keys(operation.variableTypes)) {
            res[`by${capitalize(variableName)}`] = (arg: any) => res.by({ [variableName]: arg });
          }
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

export type ClientOptions = RequestClient['requestConfig'];
export type WSOptions = WSClientOptions;

export const createClient = (url: string, options?: RequestClient['requestConfig']) => ({
  withWebSocketClient: (wsOptions: WSOptions) => ({
    withSchema: <
      T extends
        | {
            Query?: FunctionCollection;
            Mutation?: FunctionCollection;
            Subscription?: FunctionCollection;
          }
        | TypeCollection,
      TTypes extends TypeCollection = Cast<
        Omit<T, 'Query' | 'Mutation' | 'Subscription'>,
        TypeCollection
      >,
      TQueries extends FunctionCollection = Cast<
        WithDefault<T['Query'], Record<string, never>>,
        FunctionCollection
      >,
      TMutations extends FunctionCollection = Cast<
        WithDefault<T['Mutation'], Record<string, never>>,
        FunctionCollection
      >,
      TSubscriptions extends FunctionCollection = Cast<
        WithDefault<T['Subscription'], Record<string, never>>,
        FunctionCollection
      >,
    >(
      types: Types<T>,
    ): Client<TTypes, TQueries, TMutations, TSubscriptions> => {
      const requestClient = new RequestClient(url, options);
      const wsClient = createWSClient(wsOptions);
      return _createClient(requestClient, wsClient, types) as never;
    },
  }),

  withSchema: <
    T extends
      | {
          Query?: FunctionCollection;
          Mutation?: FunctionCollection;
          Subscription?: FunctionCollection;
        }
      | TypeCollection,
    TTypes extends TypeCollection = Cast<
      Omit<T, 'Query' | 'Mutation' | 'Subscription'>,
      TypeCollection
    >,
    TQueries extends FunctionCollection = Cast<
      WithDefault<T['Query'], Record<string, never>>,
      FunctionCollection
    >,
    TMutations extends FunctionCollection = Cast<
      WithDefault<T['Mutation'], Record<string, never>>,
      FunctionCollection
    >,
  >(
    types: Types<T>,
  ): Client<TTypes, TQueries, TMutations> => {
    const requestClient = new RequestClient(url, options);
    return _createClient(requestClient, null as never, types) as never;
  },
});
