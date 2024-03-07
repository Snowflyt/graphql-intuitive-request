import { describe, it, expect, error } from 'typroof';

import { enumOf } from '../types';

import type { BaseEnvironment } from './graphql-types';
import type { Validate } from './validator';

declare const validate: <TAliases>(aliases: Validate<TAliases, BaseEnvironment>) => TAliases;

describe('Validate', () => {
  it('should validate object representation of GraphQL type aliases', () => {
    expect(
      validate({
        User: {
          id: 'String!',
          username: 'String!',
          posts: '[Post!]!',
        },
        Post: {
          id: 'ID!',
          title: 'String',
          content: 'String!',
          author: 'User!',
          kind: 'OperatorKindEnum!',
        },
        OperatorKindEnum: enumOf('GTE', 'LTE', 'NE', 'LIKE'),
      }),
    ).not.to(error);
  });
});
