import type { scope } from 'arktype';

export type TypesOptions = {
  standard: false;
  includes: [
    ReturnType<
      ReturnType<
        typeof scope<{
          True: 'true';
          False: 'false';
          Null: 'null';

          ID: 'string | "ID"';
          Int: 'number | 0';
          Float: 'number | 1';
          String: 'string | "String"';
          Boolean: 'boolean';
        }>
      >['compile']
    >,
  ];
};

export type TypeRepresentation = Record<string, `${any}`> | `${any}`;
export type TypeCollection = Record<string, TypeRepresentation>;
export type FunctionRepresentation = [Record<string, `${any}`>, `${any}`];
export type FunctionCollection = Record<string, FunctionRepresentation>;

export type ParseReturnType<
  T extends `${any}`,
  TTypes extends TypeCollection,
> = ParseReturnTypeHelper<T, TTypes> extends infer R
  ? [R] extends [Array<infer U> | null]
    ? null extends R
      ? null extends U
        ? { result: U; type: 'Array<unknown | null> | null' }
        : { result: U; type: 'Array<unknown> | null' }
      : null extends U
      ? { result: U; type: 'Array<unknown | null>' }
      : { result: U; type: 'Array<unknown>' }
    : [R] extends [infer U | null]
    ? null extends R
      ? { result: U; type: 'unknown | null' }
      : { result: U; type: 'unknown' }
    : never
  : never;
type ParseReturnTypeHelper<
  T extends `${any}`,
  TTypes extends TypeCollection,
> = ReturnType<
  ReturnType<
    typeof scope<
      { __return__: T },
      {
        standard: false;
        includes: [
          ReturnType<ReturnType<typeof scope<TTypes, TypesOptions>>['compile']>,
        ];
      }
    >
  >['compile']
>['__return__']['infer'];

export type WrapByType<
  T,
  TType extends `${any}`,
> = TType extends 'Array<unknown | null> | null'
  ? Array<T | null> | null
  : TType extends 'Array<unknown> | null'
  ? Array<T> | null
  : TType extends 'Array<unknown | null>'
  ? Array<T | null>
  : TType extends 'Array<unknown>'
  ? Array<T>
  : TType extends 'unknown | null'
  ? T | null
  : T;

type InferScope<T, KS extends keyof T> = {
  [P in KS]: T[P] extends Type ? T[P]['infer'] : never;
};
export type VariablesOf<TVariables, TTypes> = InferScope<
  ReturnType<
    ReturnType<
      typeof scope<
        TVariables,
        {
          standard: false;
          includes: [
            ReturnType<
              ReturnType<typeof scope<TTypes, TypesOptions>>['compile']
            >,
          ];
        }
      >
    >['compile']
  >,
  keyof TVariables
>;
