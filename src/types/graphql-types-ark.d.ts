import type { typesOptions } from '../client';
import type { scope, Type } from 'arktype';
import type { ScopeOptions } from 'arktype/dist/scopes/scope';

export type Types<
  T extends Record<string, any>,
  TOpts extends ScopeOptions = typeof typesOptions,
> = Parameters<typeof scope<T, TOpts>>[0];

export type VariablesTypeArk<
  VT extends Record<string, any>,
  TTypes extends Record<string, any>,
> = Types<
  VT,
  {
    standard: false;
    includes: [
      ReturnType<
        ReturnType<typeof scope<TTypes, typeof typesOptions>>['compile']
      >,
    ];
  }
>;

type InferScope<T, KS extends keyof T> = {
  [P in KS]: T[P] extends Type ? T[P]['infer'] : never;
};

export type VariablesOfArk<
  VT extends Record<string, any>,
  TTypes extends Record<string, any>,
> = InferScope<
  ReturnType<
    ReturnType<
      typeof scope<
        VT,
        {
          standard: false;
          includes: [
            ReturnType<
              ReturnType<typeof scope<TTypes, typeof typesOptions>>['compile']
            >,
          ];
        }
      >
    >['compile']
  >,
  keyof VT
>;

type BaseTypesOfArk<TTypes extends Record<string, any>> =
  | keyof TTypes
  | 'ID'
  | 'Int'
  | 'Float'
  | 'String'
  | 'Boolean';
type Nullable<T extends `${any}`> =
  | `${T} | Null`
  | `${T} |Null`
  | `${T}| Null`
  | `${T}|Null`
  | `Null | ${T}`
  | `Null| ${T}`
  | `Null |${T}`
  | `Null|${T}`;
type ArrayOf<
  T extends `${any}`,
  WithBraces extends true | false = false,
> = WithBraces extends false ? `${T}[]` : `(${T})[]`;
export type ValidReturnTypeArk<TTypes extends Record<string, any>> =
  | BaseTypesOfArk<TTypes>
  | Nullable<BaseTypesOfArk<TTypes>>
  | ArrayOf<BaseTypesOfArk<TTypes>>
  | Nullable<ArrayOf<BaseTypesOfArk<TTypes>>>
  | ArrayOf<Nullable<BaseTypesOfArk<TTypes>, true>>
  | Nullable<ArrayOf<Nullable<BaseTypesOfArk<TTypes>, true>>>;

export type InferValidReturnTypeArkInternal<
  T extends ValidReturnTypeArk<TTypes>,
  TTypes extends Record<string, any>,
> = InferValidReturnTypeArkInternalHelper<T, TTypes> extends Array<
  infer U | null
> | null
  ? { result: U; type: 'Array<Object | null> | null' }
  : InferValidReturnTypeArkInternalHelper<T, TTypes> extends Array<
      infer U
    > | null
  ? { result: U; type: 'Array<Object> | null' }
  : InferValidReturnTypeArkInternalHelper<T, TTypes> extends Array<
      infer U | null
    >
  ? { result: U; type: 'Array<Object | null>' }
  : InferValidReturnTypeArkInternalHelper<T, TTypes> extends Array<infer U>
  ? { result: U; type: 'Array<Object>' }
  : InferValidReturnTypeArkInternalHelper<T, TTypes> extends infer U | null
  ? { result: U; type: 'Object | null' }
  : {
      result: InferValidReturnTypeArkInternalHelper<T, TTypes>;
      type: 'unknown';
    };
type InferValidReturnTypeArkInternalHelper<
  T extends ValidReturnTypeArk<TTypes>,
  TTypes extends Record<string, any>,
> = ReturnType<
  ReturnType<
    typeof scope<
      { __return__: T },
      {
        standard: false;
        includes: [
          ReturnType<
            ReturnType<typeof scope<TTypes, typeof typesOptions>>['compile']
          >,
        ];
      }
    >
  >['compile']
>['__return__']['infer'];
