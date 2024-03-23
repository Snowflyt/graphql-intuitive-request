import { GRAPHQL_BASE_TYPES, getTypesEnums, getTypesScalars } from './types';

import type { TypeCollection } from './types/graphql-types';

export const extractCoreDefinition = (type: string): string => {
  let result = type;
  if (result.endsWith('!')) result = result.slice(0, -1);
  if (result.startsWith('[') && result.endsWith(']')) result = result.slice(1, -1);
  if (result.endsWith('!')) result = result.slice(0, -1);
  return result;
};

export const nullableDefinition = (type: string): string => {
  if (type.endsWith('!')) return type.slice(0, -1);
  return type;
};

export const refersScalarDefinition = (type: string, $: TypeCollection): boolean => {
  const userScalars = getTypesScalars($);
  const enums = getTypesEnums($);
  const simpleGraphQLTypes = [...GRAPHQL_BASE_TYPES, ...userScalars, ...enums];

  let coreDefinition = extractCoreDefinition(type);
  if (coreDefinition === 'void') return true;
  if (simpleGraphQLTypes.includes(coreDefinition)) return true;
  let depth = 0;
  const MAXIMUM_DEPTH = 50;
  for (; depth < MAXIMUM_DEPTH; depth++) {
    const resolved = $[coreDefinition];
    if (!resolved) throw new Error(`Unable to resolve type '${coreDefinition}'`);
    if (typeof resolved !== 'string') return false;
    if (simpleGraphQLTypes.includes(resolved)) return true;
    coreDefinition = extractCoreDefinition(resolved);
  }
  if (depth === MAXIMUM_DEPTH)
    throw new Error(`Unable to determine if type '${type}' is scalar (recursion depth exceeded)`);
  return false;
};
