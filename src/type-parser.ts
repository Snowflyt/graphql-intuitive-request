import { scope } from 'arktype';

import {
  getTypesEnums,
  graphQLBaseTypes,
  simpleVariantOf,
  typesOptions,
} from './types';
import { omit } from './utils';

import type { TypeCollection } from './types/graphql-types';
import type { Type } from 'arktype';
import type { ConfigNode, TypeNode } from 'arktype/dist/nodes/node';

const isConfigNode = (node: TypeNode | ConfigNode): node is ConfigNode =>
  'config' in node;

const parseArkNode = (
  node: Type['node'],
  isExclamationMarkAdded: boolean = false,
): string => {
  /* Validate the node */
  if (typeof node === 'string' && node === 'Null')
    throw new Error("a single 'Null' is not a valid node");
  if (typeof node !== 'string' && typeof node !== 'object')
    throw new Error(`${String(node)} is not a valid node`);
  if (typeof node === 'object' && isConfigNode(node))
    throw new Error('config node is not currently supported');

  /* Parse the node */
  // If the type is not a nullable type, add the '!' suffix to the type name,
  // and set isExclamationMarkAdded to true to avoid adding the '!' suffix again
  if (
    !isExclamationMarkAdded &&
    (typeof node === 'string' ||
      (typeof node === 'object' &&
        !('null' in node && node.null) &&
        !(Array.isArray(node) && node.length === 2 && node[0] === '?')))
  )
    return `${parseArkNode(node, true)}!`;
  // If the type is a nullable type, remove the 'null' property from the node,
  // and parse the node again
  if (typeof node === 'object' && 'null' in node && node.null)
    return parseArkNode(omit(node, 'null'), true);
  if (
    typeof node === 'object' &&
    Array.isArray(node) &&
    node.length === 2 &&
    node[0] === '?'
  )
    return parseArkNode(node[1], true);

  // If the type is a string, parse the string
  if (typeof node === 'string')
    switch (node) {
      case 'ID':
        return 'ID';
      case 'Int':
        return 'Int';
      case 'Float':
        return 'Float';
      case 'String':
        return 'String';
      case 'True':
      case 'False':
      case 'Boolean':
        return 'Boolean';
      default:
        return node;
    }

  // If the type is an array type, parse the array type
  if (
    'object' in node &&
    typeof node.object === 'object' &&
    'props' in node.object &&
    typeof node.object.props === 'object' &&
    '[index]' in node.object.props
  )
    return `[${parseArkNode(node.object.props['[index]'] as Type['node'])}]`;

  // Parse raw types
  if (
    'string' in node &&
    Array.isArray(node.string) &&
    node.string.length === 2 &&
    typeof node.string[1] === 'object' &&
    'value' in node.string[1]
  )
    return parseArkNode(node.string[1].value);
  if (
    'number' in node &&
    Array.isArray(node.number) &&
    node.number.length === 2 &&
    typeof node.number[1] === 'object' &&
    'value' in node.number[1]
  )
    return node.number[1].value === 0 ? 'Int' : 'Float';
  if ('boolean' in node && node.boolean === true) return 'Boolean';

  // Else, the type is unknown, and throw an error
  throw new Error(`Node ${JSON.stringify(node)} is unresolvable`);
};

export const createTypeParser = (types: TypeCollection) => {
  const enums = getTypesEnums(types);
  const simpleGraphQLTypes = simpleVariantOf([...graphQLBaseTypes, ...enums]);

  const self = {
    parse: (type: string, isNullChecked: boolean = false): string => {
      type = type.trim();

      if (!isNullChecked) {
        const nullFound = type.match(/(Null\s?\|\s?(.+))|((.+)\s?\|\s?Null)/);
        if (!nullFound) return `${self.parse(type, true)}!`;
        else return self.parse(nullFound[2] ?? nullFound[4], true);
      }

      const arrayFound = type.match(/((\((.+)\))|(.+))\[\]/);
      if (arrayFound) return `[${self.parse(arrayFound[3] ?? arrayFound[4])}]`;

      return type;
    },

    nullable: (type: string): string => {
      if (type.endsWith('!')) return type.slice(0, -1);
      return type;
    },

    parseByArk: (type: string): string => {
      const node = scope(
        {
          ...types,
          __type_to_parse_1__: { __type_to_parse_2__: type as any },
        },
        typesOptions,
      ).compile().__type_to_parse_1__.node as any;
      return parseArkNode(node.object.props.__type_to_parse_2__);
    },

    isSimpleType: (type: string): boolean =>
      simpleGraphQLTypes.includes(self.parse(type)),
  };

  return self;
};
