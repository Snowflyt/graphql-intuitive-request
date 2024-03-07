import { getTypesEnums, GRAPHQL_BASE_TYPES, simpleVariantOf } from './types';

import type { TypeCollection } from './types/graphql-types';

export const createTypeParser = ($: TypeCollection) => {
  const enums = getTypesEnums($);
  const simpleGraphQLTypes = simpleVariantOf([...GRAPHQL_BASE_TYPES, ...enums]);

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

    isSimpleType: (type: string): boolean => simpleGraphQLTypes.includes(type),
  };

  return self;
};
