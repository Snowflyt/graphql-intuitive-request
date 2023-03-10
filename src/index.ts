import type { MaybeNull } from './types/universal/graphql-types';

export {
  GraphQLFloat as Float,
  GraphQLID as ID,
  GraphQLInt as Int
} from 'graphql';
export {
  GraphQLIntuitiveClient,
  createObjectSelectorOn,
  createQueryStringFor
} from './client';

export function Nullable<const T extends readonly [any]>(type: T): MaybeNull<T>;
export function Nullable<T>(type: T): MaybeNull<T>;
export function Nullable<T>(type: T): MaybeNull<T> {
  (type as MaybeNull<T>).__nullable = true;
  return type as MaybeNull<T>;
}
