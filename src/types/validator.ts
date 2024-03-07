import type { Constructor, IsTopType, IsUnknown, StringKeyOf } from './common';
import type { GraphQLEnum, SimpleVariantOf } from './graphql-types';

/*********************
 * Message functions *
 *********************/
type WriteDuplicateAliasesMessage<TName extends string> = `Type '${TName}' is already defined`;

type WriteUnresolvableMessage<TToken extends string> = `'${TToken}' is unresolvable`;

type WriteUnexpectedCharacterMessage<TChar extends string> = `Unexpected character '${TChar}'`;

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

type ValidateString<TDef extends string, $> = TDef extends `[${infer TChild}!]!`
  ? TChild extends StringKeyOf<$>
    ? TDef
    : WriteUnresolvableMessage<TChild>
  : TDef extends `[${infer TChild}!]`
  ? TChild extends StringKeyOf<$>
    ? TDef
    : WriteUnresolvableMessage<TChild>
  : TDef extends `[${infer TChild}]!`
  ? TChild extends StringKeyOf<$>
    ? TDef
    : WriteUnresolvableMessage<TChild>
  : TDef extends `[${infer TChild}]`
  ? TChild extends StringKeyOf<$>
    ? TDef
    : WriteUnresolvableMessage<TChild>
  : TDef extends `${infer TChild}!`
  ? TChild extends StringKeyOf<$>
    ? TDef
    : WriteUnresolvableMessage<TChild>
  : TDef extends StringKeyOf<$>
  ? TDef
  : TDef extends `[${string}]!${infer U}${string}`
  ? WriteUnexpectedCharacterMessage<U>
  : TDef extends `[${string}]${infer U}${string}`
  ? WriteUnexpectedCharacterMessage<U>
  : TDef extends `[${string}!${infer U}]${string}`
  ? WriteUnexpectedCharacterMessage<U>
  : SimpleVariantOf<StringKeyOf<$>>;

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

declare const id: unique symbol;
type Nominal<T, Id extends string> = T & { readonly [id]: Id };

type Alias<TDef = NonNullable<unknown>> = Nominal<TDef, 'alias'>;

type BootstrapScope<TAliases, TEnvironment> = {
  [P in keyof TAliases]: Alias<TAliases[P]>;
} & TEnvironment;

/**
 * Validate GraphQL type aliases.
 */
export type Validate<TAliases, TEnvironment> = Evaluate<{
  [P in keyof TAliases]: P extends StringKeyOf<TEnvironment>
    ? WriteDuplicateAliasesMessage<P & string>
    : ValidateDefinition<TAliases[P], BootstrapScope<TAliases, TEnvironment>>;
}>;
