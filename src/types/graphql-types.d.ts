import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLType,
  GraphQLUnionType,
} from 'graphql';

import type { ClassType, IsAny } from './common';

export type MaybeNull<T> = T & {
  __nullable: true;
};

export type ValidReturnType =
  | ClassType<C>
  | GraphQLObjectType<C>
  | readonly [ClassType<C>]
  | readonly [GraphQLObjectType<C>]
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | GraphQLScalarType
  | void;

export type NullablePrimitiveTypeAndArray =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | GraphQLScalarType
  | readonly [NullablePrimitiveTypeAndArray];

export type ParseNullablePrimitiveTypeAndArray<T> = IsAny<T> extends true
  ? any
  : T extends MaybeNull<infer U>
  ? ParseNullablePrimitiveTypeAndArray<U> | null
  : T extends GraphQLScalarType<any, infer U>
  ? U
  : T extends StringConstructor
  ? string
  : T extends NumberConstructor
  ? number
  : T extends BooleanConstructor
  ? boolean
  : T extends readonly [infer U extends NullablePrimitiveTypeAndArray]
  ? Array<ParseNullablePrimitiveTypeAndArray<U>>
  : never;

export type GraphQLBasicType =
  | StringConstructor
  | BooleanConstructor
  | GraphQLScalarType
  | GraphQLUnionType
  | GraphQLEnumType;

export type VariableType =
  | StringConstructor
  | BooleanConstructor
  | GraphQLType
  | ClassType<unknown>
  | readonly [VariableType];

export type VariablesType = Record<string, VariableType>;

export type ProcessedVariableType<T> = IsAny<T> extends true
  ? unknown
  : T extends MaybeNull<infer U>
  ? ProcessedVariableType<U> | null
  : T extends GraphQLScalarType<any, infer U>
  ? U
  : T extends GraphQLObjectType<infer U>
  ? // eslint-disable-next-line @typescript-eslint/ban-types
    U extends Function | symbol
    ? Record<never, never>
    : IsAny<U> extends true
    ? Record<never, never>
    : U
  : T extends GraphQLInterfaceType | GraphQLInputObjectType
  ? Record<never, never>
  : T extends GraphQLUnionType | GraphQLEnumType
  ? unknown
  : T extends StringConstructor
  ? string
  : T extends BooleanConstructor
  ? boolean
  : T extends readonly [infer U extends VariableType]
  ? Array<ProcessedVariableType<U>>
  : T extends GraphQLList<infer U>
  ? Array<ProcessedVariableType<U>>
  : T extends ClassType<infer U>
  ? U
  : unknown;

export type VariablesOf<T extends VariablesType> = {
  [K in keyof T]: ProcessedVariableType<T[K]>;
};
