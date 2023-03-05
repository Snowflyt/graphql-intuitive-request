import type { Type } from './common';

declare const ID: unique symbol;
declare const Int: unique symbol;
declare const Float: unique symbol;

export type GraphQLPrimitiveType =
  | typeof String
  | typeof Int
  | typeof Float
  | typeof Boolean
  | typeof ID;

export type NullableType<T> = T & { nullable: true };

export type GraphQLType =
  | GraphQLPrimitiveType
  | NullableType<GraphQLPrimitiveType>
  | [GraphQLPrimitiveType]
  | [NullableType<GraphQLPrimitiveType>]
  | NullableType<[NullableType<GraphQLPrimitiveType>]>
  | Type<unknown>
  | NullableType<Type<unknown>>
  | [Type<unknown>]
  | [NullableType<Type<unknown>>]
  | NullableType<[NullableType<Type<unknown>>]>;
