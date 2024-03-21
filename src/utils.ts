import type { Obj } from './types/common';

/**
 * Pipe a value through a series of functions.
 * @param x The value to pipe.
 * @param fns The functions to pipe the value through.
 * @returns
 */
export const pipe: {
  <A, B>(x: A, f: (x: A) => B): B;
  <A, B, C>(x: A, f: (x: A) => B, g: (x: B) => C): C;
  <A, B, C, D>(x: A, f: (x: A) => B, g: (x: B) => C, h: (x: C) => D): D;
  <A, B, C, D, E>(x: A, f: (x: A) => B, g: (x: B) => C, h: (x: C) => D, i: (x: D) => E): E;
} = (x: any, ...fns: ((x: any) => any)[]) => fns.reduce((y, f) => f(y), x);

/**
 * Create a function that maps an array through `fn`.
 * @param fn The function to map through.
 * @returns
 */
export const map =
  <T, U>(fn: (x: T) => U) =>
  (arr: T[]): U[] =>
    arr.map(fn);

export const mapObject = <K extends PropertyKey, T, U>(
  o: Record<string, T>,
  fn: (entry: [string, T]) => readonly [K, U],
) => Object.fromEntries(Object.entries(o).map(fn)) as Record<K, U>;
export const mapObjectValues = <T, U>(o: Record<string, T>, fn: (value: T) => U) =>
  mapObject(o, ([k, v]) => [k, fn(v)]);

export const pair = <T, U>(x: T, y: U): [T, U] => [x, y];

export const omit = <T extends object, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> => {
  const ret = { ...obj };
  keys.forEach((key) => delete ret[key]);
  return ret;
};
export const pick = <T extends object, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> => {
  const ret = {} as Pick<T, K>;
  keys.forEach((key) => (ret[key] = obj[key]));
  return ret;
};

export const objectLength = <T extends object>(obj: T) => Object.keys(obj).length as Obj.Length<T>;

export const requiredKeysCount = <T extends Record<string, string>>(obj: T): number =>
  (objectLength(obj) as number) -
  Object.entries(obj).filter(([k, v]) => k.endsWith('?') || !v.endsWith('!')).length;

export const capitalize = (str: string) => `${str[0].toUpperCase()}${str.slice(1)}`;

export const trimEnd = (str: string, strToTrim: string) => {
  while (str.endsWith(strToTrim)) str = str.slice(0, -strToTrim.length);
  return str;
};

export const trimIndent = (str: string) => {
  const lines = str.split('\n');
  let minIndent = Infinity;
  for (const line of lines) {
    if (line.trim() === '') continue;
    const indent = line.search(/\S/);
    if (indent !== -1) minIndent = Math.min(minIndent, indent);
  }
  return lines
    .map((line) => line.slice(minIndent))
    .join('\n')
    .trim();
};
