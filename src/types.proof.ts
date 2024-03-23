import { describe, equal, expect, it } from 'typroof';

import { enumOf, infer, scalar, schema } from './types';

import type { GraphQLEnum, GraphQLScalar } from './types/graphql-types';

let $: {
  User: {
    id: 'Int!';
    username: 'String!';
    email: 'String';
    createdAt: 'DateTime!';
  };
  Post: {
    id: 'Int!';
    status: 'PostStatus!';
    title: 'String!';
    content: 'String!';
    author: 'User!';
  };
  PostStatus: GraphQLEnum<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>;
  DateTime: GraphQLScalar<string, Date>;

  Query: {
    users: ['=>', '[User!]!'];
    post: [{ id: 'Int!' }, '=>', 'Post'];
  };
};

describe('schema', () => {
  it('should validate a GraphQL schema', () => {
    const _ = schema({
      User: {
        id: 'Int!',
        username: 'String!',
        email: 'String',
        createdAt: 'DateTime!',
      },
      Post: {
        id: 'Int!',
        status: 'PostStatus!',
        title: 'String!',
        content: 'String!',
        author: 'User!',
      },
      PostStatus: enumOf('DRAFT', 'PUBLISHED', 'ARCHIVED'),
      DateTime: scalar<string>()({
        parse: (value) => new Date(value),
        serialize: (value) => value.toISOString(),
      }),

      Query: {
        users: ['=>', '[User!]!'],
        post: [{ id: 'Int!' }, '=>', 'Post'],
      },
    });
    expect(_).to(equal<typeof $>);
    $ = _;
  });
});

describe('compile', () => {
  it('should infer the type of a GraphQL schema', () => {
    const $$ = infer($);

    type User = typeof $$.User;
    expect<User>().to(
      equal<{
        id: number;
        username: string;
        email: string | null;
        createdAt: Date;
      }>(),
    );

    type Post = typeof $$.Post;
    expect<Post>().to(
      equal<{
        id: number;
        status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
        title: string;
        content: string;
        author: User;
      }>(),
    );
  });
});
