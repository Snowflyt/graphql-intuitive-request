import { describe, equal, error, expect, it } from 'typroof';

import { enumOf } from '../types';

import type { BaseEnvironment, GraphQLEnum } from './graphql-types';
import type { ValidateSchema } from './validator';

declare const validate: <T>(aliases: ValidateSchema<T>) => ValidateSchema<T>;

describe('Validate', () => {
  it('should validate object representation of GraphQL type aliases', () => {
    type ToValidate = {
      User: {
        id: 'String!';
        username: 'String!';
        posts: '[Post!]!';
      };
      Post: {
        id: 'ID!';
        title: 'String';
        content: 'String!';
        author: 'User!';
        kind: 'OperatorKindEnum!';
      };
      OperatorKindEnum: GraphQLEnum<'GTE' | 'LTE' | 'NE' | 'LIKE'>;
    };
    expect<ValidateSchema<ToValidate, BaseEnvironment>>().to(equal<ToValidate>);

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
