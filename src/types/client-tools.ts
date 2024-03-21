///////////////////////////////////////////////////////////////////////////////////////////
/// This file contains utility types used to infer the type of `Client` from the schema ///
///////////////////////////////////////////////////////////////////////////////////////////

import type { ObjectSelector } from './ast-builder';
import type { ParseNodes } from './ast-parser';
import type {
  Obj,
  QueryPromise,
  RequiredFields,
  RequiredFieldsCount,
  SimpleMerge,
  Str,
  StringKeyOf,
  SubscriptionResponse,
  TuplifyLiteralStringUnion,
} from './common';
import type {
  BaseEnvironment,
  GraphQLTypeVariant,
  ParseInputDef,
  WrapByVariant,
} from './graphql-types';
import type { ParseDef } from './parser';
import type { QueryNode } from './query-node';

/**
 * Mixin abbreviated syntax for the `.by` method when the required fields count is 0 or 1.
 *
 * @example
 * ```typescript
 * type R1 = AbbreviatedByMixin<{ id: 'String!' }, BaseEnvironment, string>;
 * //   ^?: { byId: (id: string) => string }
 * type R2 = AbbreviatedByMixin<{ id: 'String!'; name: 'String' }, BaseEnvironment, string>;
 * //   ^?: { byId: (id: string) => string }
 * type R3 = AbbreviatedByMixin<{ id: 'String'; age: 'Int' }, BaseEnvironment, string>;
 * //   ^?: { byId: (id: string) => string; byAge: (age: number) => string }
 * ```
 */
export type AbbreviatedByMixin<TInputDef, $, TReturn> = RequiredFieldsCount<TInputDef> extends 0
  ? _AbbreviatedByMixin<TInputDef, TuplifyLiteralStringUnion<StringKeyOf<TInputDef>>, $, TReturn>
  : RequiredFieldsCount<TInputDef> extends 1
  ? _AbbreviatedByMixin<TInputDef, [RequiredFields<TInputDef>], $, TReturn>
  : {};
type _AbbreviatedByMixin<TInputDef, TFields, $, TReturn, Result = unknown> = TFields extends [
  infer TField extends string,
  ...infer TRest extends any[],
]
  ? _AbbreviatedByMixin<
      TInputDef,
      TRest,
      $,
      TReturn,
      SimpleMerge<
        Result,
        Record<
          `by${Capitalize<Str.TrimEnd<TField, '?'>>}`,
          (
            arg: NonNullable<Obj.Get<ParseInputDef<TInputDef, $>, Str.TrimEnd<TField, '?'>>>,
          ) => TReturn
        >
      >
    >
  : Result;

/**
 * Infer operation function (`.query`, `.mutation` or `.subscription`) from the schema.
 */
export type OperationFunction<
  TMethod extends 'query' | 'mutation' | 'subscription',
  $,
  TOperations,
> = <N extends keyof TOperations>(
  name: N,
) => _NormalizeFunctionRepresentation<TOperations[N]> extends [
  infer TInputDef extends Record<string, string>,
  '=>',
  infer TReturnDef extends string,
]
  ? _OperationFunction<TMethod, $, TInputDef, TReturnDef>
  : never;
type _NormalizeFunctionRepresentation<F> = F extends ['=>', infer TReturn]
  ? [{}, '=>', TReturn]
  : F;
type _OperationResponse<
  TMethod extends 'query' | 'mutation' | 'subscription',
  T,
> = TMethod extends 'subscription' ? SubscriptionResponse<T> : QueryPromise<T>;
type _OperationFunction<
  TMethod extends 'query' | 'mutation' | 'subscription',
  $,
  TInputDef extends Record<string, string>,
  TReturnDef extends string,
> = ParseDef<TReturnDef, $ & BaseEnvironment, { acceptVoid: true }> extends {
  type: infer TReturn;
  coreType: infer TCoreReturn;
  variant: infer TVariant extends GraphQLTypeVariant;
}
  ? // For operations returning an object, `.select` can be used to select fields from the response
    [TCoreReturn] extends [object]
    ? // For operations without input,
      Obj.IsEmpty<ParseInputDef<TInputDef, $>> extends true
      ? // users can either just await it to get the response (automatically select all fields, e.g. `await query('users')`), ...
        _OperationResponse<TMethod, WrapByVariant<TCoreReturn, TVariant>> & {
          // ... or use `.select` to manually select fields from the response (e.g. `await query('users').select(...)`)
          select: <const TQueryNodes extends readonly QueryNode[]>(
            selector: ObjectSelector<TCoreReturn, TQueryNodes>,
          ) => _OperationResponse<TMethod, WrapByVariant<ParseNodes<TQueryNodes>, TVariant>>;
        }
      : // For operations with input,
        SimpleMerge<
          {
            // users can either manually select fields from the response (e.g. `await query('user').select(...)...`)...
            select: <const TQueryNodes extends readonly QueryNode[]>(
              selector: ObjectSelector<TCoreReturn, TQueryNodes>,
            ) => // and then use `.by` or its abbreviated syntax to send the input and get the response...
            SimpleMerge<
              {
                by: (
                  input: ParseInputDef<TInputDef, $>,
                ) => _OperationResponse<TMethod, WrapByVariant<ParseNodes<TQueryNodes>, TVariant>>;
              },
              AbbreviatedByMixin<
                TInputDef,
                $,
                _OperationResponse<TMethod, WrapByVariant<ParseNodes<TQueryNodes>, TVariant>>
              >
            > &
              // or omit `.by` if all fields are optional and just await it after `.select`, ...
              (RequiredFieldsCount<TInputDef> extends 0
                ? _OperationResponse<TMethod, WrapByVariant<ParseNodes<TQueryNodes>, TVariant>>
                : unknown);
            // or omit `.select` and automatically select all fields and then use `.by` or its
            // abbreviated syntax to send the input and get the response, ...
            by: (
              input: ParseInputDef<TInputDef, $>,
            ) => _OperationResponse<TMethod, WrapByVariant<TCoreReturn, TVariant>>;
          },
          AbbreviatedByMixin<
            TInputDef,
            $,
            _OperationResponse<TMethod, WrapByVariant<TCoreReturn, TVariant>>
          >
        > &
          // or omit both `.select` and `.by` if all fields are optional and just await it, ...
          (RequiredFieldsCount<TInputDef> extends 0
            ? _OperationResponse<TMethod, WrapByVariant<TCoreReturn, TVariant>>
            : unknown)
    : Obj.IsEmpty<TInputDef> extends true
    ? // For operations returning a scalar without input, just await it to get the response
      _OperationResponse<TMethod, TReturn>
    : // For operations returning a scalar with input, use `.by` or its abbreviated syntax to send the input and get the response
      SimpleMerge<
        { by: (input: ParseInputDef<TInputDef, $>) => _OperationResponse<TMethod, TReturn> },
        AbbreviatedByMixin<TInputDef, $, _OperationResponse<TMethod, TReturn>>
      > &
        // or omit `.by` if all fields are optional and just await it
        (RequiredFieldsCount<TInputDef> extends 0 ? _OperationResponse<TMethod, TReturn> : unknown)
  : never;

export type QueryFunction<TQueries, $> = OperationFunction<'query', $, TQueries>;
export type MutationFunction<TMutations, $> = OperationFunction<'mutation', $, TMutations>;
export type SubscriptionFunction<TSubscriptions, $> = OperationFunction<
  'subscription',
  $,
  TSubscriptions
>;
