import type { Digit, IsTopType, IsUnknown, Letter, SimpleMerge, Str, StringKeyOf } from './common';
import type { BaseEnvironment, GraphQLEnum, SimpleVariantOf } from './graphql-types';

/*******************
 * Message-related *
 *******************/
type BadDefinitionType = number | bigint | boolean | symbol | null | undefined;
type Domain =
  | 'string'
  | 'number'
  | 'bigint'
  | 'boolean'
  | 'symbol'
  | 'undefined'
  | 'object'
  | 'null';
type DomainOf<TData> = IsTopType<TData> extends true
  ? Domain
  : TData extends object
  ? 'object'
  : TData extends string
  ? 'string'
  : TData extends number
  ? 'number'
  : TData extends boolean
  ? 'boolean'
  : TData extends undefined
  ? 'undefined'
  : TData extends null
  ? 'null'
  : TData extends bigint
  ? 'bigint'
  : TData extends symbol
  ? 'symbol'
  : never;

/*************
 * Functions *
 *************/
namespace Scanner {
  export interface State {
    unscanned: string;
    last: string;
    terminated: boolean;
    error: string | null;
    coreType: string;
    hasUnclosedLeftBracket: boolean;
  }

  export type New<TString extends string> = {
    unscanned: TString;
    last: never;
    terminated: false;
    error: null;
    coreType: '';
    hasUnclosedLeftBracket: false;
  };

  export type Next<TState extends State, $> = Str.Head<
    TState['unscanned']
  > extends infer C extends string
    ? [C] extends [never]
      ? SimpleMerge<
          TState,
          {
            terminated: true;
            error: TState['hasUnclosedLeftBracket'] extends true
              ? TState['last'] extends '!'
                ? "Missing expected ']'"
                : "Missing expected ']' or '!'"
              : TState['coreType'] extends StringKeyOf<$>
              ? null
              : `'${TState['coreType']}' is unresolvable`;
          }
        >
      : SimpleMerge<
          TState,
          SimpleMerge<
            {
              unscanned: Str.Tail<TState['unscanned']>;
              last: C;
            },
            [TState['last']] extends [never]
              ? C extends '['
                ? { hasUnclosedLeftBracket: true }
                : C extends '_' | Letter
                ? { coreType: C }
                : { error: `Unexpected character '${C}'` }
              : TState['last'] extends ']'
              ? C extends '!'
                ? {}
                : { error: `Unexpected character '${C}'` }
              : TState['last'] extends '!'
              ? [TState['hasUnclosedLeftBracket'], C] extends [true, ']']
                ? { hasUnclosedLeftBracket: false }
                : C extends ']'
                ? { error: "Missing expected '[' at the beginning" }
                : { error: `Unexpected character '${C}'` }
              : C extends ']'
              ? TState['hasUnclosedLeftBracket'] extends true
                ? {
                    hasUnclosedLeftBracket: false;
                    error: TState['coreType'] extends StringKeyOf<$>
                      ? null
                      : `'${TState['coreType']}' is unresolvable`;
                  }
                : { error: "Missing expected '[' at the beginning" }
              : C extends '!'
              ? TState['coreType'] extends ''
                ? { error: "Missing expected type before '!'" }
                : {
                    error: TState['coreType'] extends StringKeyOf<$>
                      ? null
                      : `'${TState['coreType']}' is unresolvable`;
                  }
              : C extends '_' | Letter | Digit
              ? { coreType: `${TState['coreType']}${C}` }
              : { error: `Unexpected character '${C}'` }
          >
        >
    : never;
}

type _ValidateString<TDef extends string, TState extends Scanner.State, $> = Scanner.Next<
  TState,
  $
> extends infer TNext
  ? TNext extends Scanner.State
    ? TNext['error'] extends null
      ? TNext['terminated'] extends true
        ? TDef
        : _ValidateString<TDef, TNext, $>
      : TNext['error']
    : never
  : never;

type ValidateString<
  TDef extends string,
  $,
  TFlags extends { isReturnType: boolean } = { isReturnType: false },
> = TDef extends ''
  ? // Provide better intellisense for empty string
    | SimpleVariantOf<Exclude<StringKeyOf<$>, 'Query' | 'Mutation' | 'Subscription'>>
      | (TFlags['isReturnType'] extends true ? 'void' : never)
  : [TFlags['isReturnType'], TDef] extends [true, 'void']
  ? 'void'
  : _ValidateString<TDef, Scanner.New<TDef>, $>;

export type ValidateOperations<TDef, $> = TDef extends BadDefinitionType | string
  ? `Value of 'Query', 'Mutation' or 'Subscription' must be a plain object (was ${DomainOf<TDef>})`
  : TDef extends readonly unknown[]
  ? `Value of 'Query', 'Mutation' or 'Subscription' must be a plain object (was array)`
  : { [P in keyof TDef]: ValidateOperation<TDef[P], $> };

export type ValidateOperation<TDef, $> = TDef extends readonly ['=>', infer TOutput]
  ? TOutput extends string
    ? ['=>', ValidateString<TOutput, $, { isReturnType: true }>]
    : ['=>', `Output type must be a string (was ${DomainOf<TOutput>})`]
  : TDef extends readonly [infer TInput extends Record<PropertyKey, unknown>, '=>', infer TOutput]
  ? TOutput extends BadDefinitionType | object
    ? [TInput, '=>', `Output type must be a string (was ${DomainOf<TOutput>})`]
    : [
        { [P in keyof TInput]: ValidateDefinition<TInput[P], $, true, true> },
        '=>',
        ValidateString<TOutput & string, $, { isReturnType: true }>,
      ]
  : TDef extends readonly [infer TInput, '=>', infer TOutput]
  ? [`Input type must be a plain object (was ${DomainOf<TInput>})`, '=>', TOutput]
  : `Operation definition must be either ['=>', Output] or [Input, '=>', Output]`;

type ValidateFieldWithArgs<TInput, TOutput, $> = TOutput extends BadDefinitionType | object
  ? [TInput, `Output type must be a string (was ${DomainOf<TOutput>})`]
  : [
      { [P in keyof TInput]: ValidateDefinition<TInput[P], $, true, true> },
      ValidateString<TOutput & string, $>,
    ];

export type ValidateDefinition<
  TDef,
  $,
  TNested extends boolean = false,
  TIsInput extends boolean = false,
> = TDef extends BadDefinitionType
  ? TNested extends true
    ? TIsInput extends true
      ? `Field definitions must be strings (was ${DomainOf<TDef>})`
      : `Field definitions must be strings or 2-element tuples (was ${DomainOf<TDef>})`
    : `Type definitions must be strings, enums or plain objects (was ${DomainOf<TDef>})`
  : TDef extends readonly unknown[]
  ? TNested extends true
    ? TIsInput extends true
      ? `Field definitions must be strings (was array)`
      : TDef extends readonly [infer TInput extends Record<PropertyKey, unknown>, infer TOutput]
      ? ValidateFieldWithArgs<TInput, TOutput, $>
      : TDef extends readonly [infer TInput, infer TOutput]
      ? [`Input type must be a plain object (was ${DomainOf<TInput>})`, TOutput]
      : `Field definitions must be strings or 2-element tuples (was array)`
    : `Type definitions must be strings, enums or plain objects (was array)`
  : TDef extends string
  ? ValidateString<TDef, $>
  : TDef extends GraphQLEnum
  ? TDef
  : IsUnknown<TDef> extends true
  ? StringKeyOf<$>
  : TNested extends true
  ? `Field definitions must be strings (was ${DomainOf<TDef>})`
  : { [P in keyof TDef]: ValidateDefinition<TDef[P], $, true> };

/**
 * Validate GraphQL schema definition.
 */
export type ValidateSchema<TAliases, TEnvironment = BaseEnvironment> = {
  [P in StringKeyOf<TAliases>]: P extends StringKeyOf<TEnvironment>
    ? `Type '${P}' is already defined`
    : P extends 'Query' | 'Mutation' | 'Subscription'
    ? ValidateOperations<TAliases[P], TAliases & TEnvironment>
    : ValidateDefinition<TAliases[P], TAliases & TEnvironment>;
};
