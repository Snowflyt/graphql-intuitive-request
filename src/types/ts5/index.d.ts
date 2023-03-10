import type { MaybeNull } from '../universal/graphql-types';

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

export declare function Nullable<const T extends readonly [any]>(
  type: T,
): MaybeNull<T>;
export declare function Nullable<T>(type: T): MaybeNull<T>;
