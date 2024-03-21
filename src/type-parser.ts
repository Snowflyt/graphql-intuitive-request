import { GRAPHQL_BASE_TYPES, getTypesEnums } from './types';

import type { TypeCollection } from './types/graphql-types';

export const createTypeParser = ($: TypeCollection) => {
  const enums = getTypesEnums($);
  const simpleGraphQLTypes = [...GRAPHQL_BASE_TYPES, ...enums];

  const self = {
    extractCoreType: (type: string) => {
      let result = type;
      if (result.endsWith('!')) result = result.slice(0, -1);
      if (result.startsWith('[') && result.endsWith(']')) result = result.slice(1, -1);
      if (result.endsWith('!')) result = result.slice(0, -1);
      return result;
    },

    nullable: (type: string): string => {
      if (type.endsWith('!')) return type.slice(0, -1);
      return type;
    },

    isScalarType: (type: string): boolean => {
      let coreType = self.extractCoreType(type);
      if (coreType === 'void') return true;
      if (simpleGraphQLTypes.includes(coreType)) return true;
      let depth = 0;
      const MAXIMUM_DEPTH = 50;
      for (; depth < MAXIMUM_DEPTH; depth++) {
        const resolved = $[coreType];
        if (!resolved) throw new Error(`Unable to resolve type '${coreType}'`);
        if (typeof resolved !== 'string') return false;
        if (simpleGraphQLTypes.includes(resolved)) return true;
        coreType = self.extractCoreType(resolved);
      }
      if (depth === MAXIMUM_DEPTH)
        throw new Error(
          `Unable to determine if type '${type}' is scalar (recursion depth exceeded)`,
        );
      return false;
    },
  };

  return self;
};
