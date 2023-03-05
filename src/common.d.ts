import { Float, Int } from '.';

export type Type<T> = new (...args: any[]) => T;

export type Merge<A, B> = {
  [K in keyof A | keyof B]: K extends keyof A & keyof B
    ? A[K] | B[K]
    : K extends keyof B
    ? B[K]
    : K extends keyof A
    ? A[K]
    : never;
};

export type Processed<T> = T extends typeof Int | typeof Float
  ? number
  : T extends typeof String
  ? string
  : T extends typeof Boolean
  ? boolean
  : T extends Array<infer U>
  ? Array<Processed<U>>
  : T extends new (...args: any[]) => any
  ? InstanceType<T>
  : never;
