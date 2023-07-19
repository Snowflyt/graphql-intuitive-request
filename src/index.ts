import {
  NullableBooleanConstructor,
  NullableStringConstructor,
} from './client';

import type { MaybeNull } from './types/graphql-types';

export {
  GraphQLFloat as Float,
  GraphQLID as ID,
  GraphQLInt as Int,
} from 'graphql';
export {
  GraphQLIntuitiveClient,
  createObjectSelectorOn,
  createQueryStringFor,
} from './client';

export function Nullable<const T extends readonly [any]>(type: T): MaybeNull<T>;
export function Nullable<T>(type: T): MaybeNull<T>;
export function Nullable<T>(type: T): MaybeNull<T> {
  if (type === String) {
    return NullableStringConstructor as any;
  }
  if (type === Boolean) {
    return NullableBooleanConstructor as any;
  }
  if (Array.isArray(type)) {
    const result = [...type] as any;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    result.__nullable = true;
    return result;
  }
  if (typeof type === 'object') {
    const result = Object.create(type);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    result.__nullable = true;
    return result;
  }
  throw new Error('Invalid type');
}
