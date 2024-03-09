import type {
  Constructor,
  Digit,
  IsTopType,
  IsUnknown,
  Letter,
  SimpleMerge,
  Str,
  StringKeyOf,
} from './common';
import type { GraphQLEnum, SimpleVariantOf } from './graphql-types';

/*********************
 * Message functions *
 *********************/
type WriteDuplicateAliasesMessage<TName extends string> = `Type '${TName}' is already defined`;

type WriteBadDefinitionTypeMessage<TActual extends string> =
  `Type definitions must be strings or objects (was ${TActual})`;
type BadDefinitionType = number | bigint | boolean | symbol | null | undefined;
type ObjectKindSet = Record<string, Constructor>;
type DefaultObjectKindSet = {
  readonly Array: ArrayConstructor;
  readonly Date: DateConstructor;
  readonly Error: ErrorConstructor;
  readonly Function: FunctionConstructor;
  readonly Map: MapConstructor;
  readonly RegExp: RegExpConstructor;
  readonly Set: SetConstructor;
  readonly Object: ObjectConstructor;
  readonly String: StringConstructor;
  readonly Number: NumberConstructor;
  readonly Boolean: BooleanConstructor;
  readonly WeakMap: WeakMapConstructor;
  readonly WeakSet: WeakSetConstructor;
  readonly Promise: PromiseConstructor;
};
type ObjectKindOf<
  TData,
  TKinds extends ObjectKindSet = DefaultObjectKindSet,
> = IsTopType<TData> extends true
  ? undefined | keyof TKinds
  : TData extends object
  ? object extends TData
    ? keyof TKinds
    : {
        [kind in keyof TKinds]: TKinds[kind] extends Constructor<TData>
          ? kind
          : TData extends (...args: any[]) => unknown
          ? 'Function'
          : 'Object';
      }[keyof TKinds]
  : undefined;
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
type Evaluate<T> = { [P in keyof T]: T[P] };

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
                : C extends '_' | Letter | Digit
                ? { coreType: C }
                : { error: `Unexpected character '${C}'` }
              : TState['last'] extends ']'
              ? C extends '!'
                ? NonNullable<unknown>
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
              : C extends Letter | Digit
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

type ValidateString<TDef extends string, $> = TDef extends ''
  ? SimpleVariantOf<StringKeyOf<$>> // Provide better intellisense for empty string
  : _ValidateString<TDef, Scanner.New<TDef>, $>;

type ValidateDefinition<TDef, $> = TDef extends string
  ? ValidateString<TDef, $>
  : TDef extends GraphQLEnum
  ? TDef
  : TDef extends BadDefinitionType
  ? WriteBadDefinitionTypeMessage<
      ObjectKindOf<TDef> extends string ? ObjectKindOf<TDef> : DomainOf<TDef>
    >
  : IsUnknown<TDef> extends true
  ? StringKeyOf<$>
  : TDef extends readonly [infer TVariables, 'void']
  ? [ValidateDefinition<TVariables, $>, 'void']
  : Evaluate<{ [P in keyof TDef]: ValidateDefinition<TDef[P], $> }>;

/**
 * Validate GraphQL type aliases.
 */
export type Validate<TAliases, TEnvironment> = Evaluate<{
  [P in keyof TAliases]: P extends StringKeyOf<TEnvironment>
    ? WriteDuplicateAliasesMessage<P & string>
    : ValidateDefinition<TAliases[P], TAliases & TEnvironment>;
}>;
