import type { ObjectLength } from './types/common';

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

export const objectLength = <T extends object>(obj: T) =>
  Object.keys(obj).length as ObjectLength<T>;

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
