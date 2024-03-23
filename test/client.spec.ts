import { afterAll, describe, expect, it, vi } from 'vitest';

import { createClient } from '@/client';
import { scalar } from '@/types';
import { trimIndent } from '@/utils';

const request = vi.fn().mockResolvedValue({});
vi.mock('graphql-request');
Object.defineProperty(await import('graphql-request'), 'GraphQLClient', {
  value: vi.fn(() => ({ request })),
});

describe('client', () => {
  const { mutation, query } = createClient('').withSchema({
    User: {
      id: 'Int!',
      username: 'String!',
      email: 'String',
      posts: '[Post!]!',
      registeredAt: 'DateTime!',
    },
    Post: {
      id: 'Int!',
      title: 'String!',
      content: 'String!',
      authorId: 'Int!',
    },
    CreateUserInput: {
      username: 'String!',
      password: 'String!',
      registeredAt: 'DateTime!',
    },
    UpdateUserInput: {
      'username?': 'String!',
      'password?': 'String!',
    },
    CreatePostInput: {
      title: 'String!',
      content: 'String!',
      authorId: 'Int!',
    },
    UpdatePostInput: {
      'title?': 'String!',
      'content?': 'String!',
    },
    LoginInput: {
      username: 'String!',
      password: 'String!',
    },
    LoginOutput: {
      token: 'String!',
    },
    DateTime: scalar<string>()({
      parse: (value) => new Date(value),
      serialize: (value) => value.toISOString(),
    }),

    Query: {
      userExists: [{ username: 'String!' }, '=>', 'Boolean!'],
      user: [{ id: 'Int!' }, '=>', 'User'],
      users: ['=>', '[User!]!'],
      post: [{ id: 'Int!' }, '=>', 'Post'],
      posts: ['=>', '[Post!]!'],
    },
    Mutation: {
      login: [{ input: 'LoginInput!' }, '=>', 'LoginOutput!'],
      logout: ['=>', 'Boolean!'],
      createUser: [{ input: 'CreateUserInput!' }, '=>', 'User!'],
      updateUser: [{ id: 'Int!', input: 'UpdateUserInput!' }, '=>', 'User!'],
      removeUser: [{ id: 'Int!' }, '=>', 'User!'],
      createPost: [{ input: 'CreatePostInput!' }, '=>', 'Post!'],
      updatePost: [{ id: 'Int!', input: 'UpdatePostInput!' }, '=>', 'Post!'],
      removePost: [{ id: 'Int!' }, '=>', 'Post!'],
    },
    Subscription: { postAdded: ['=>', 'Post!'] },
  });

  afterAll(() => {
    vi.unmock('graphql-request');
  });

  it('should generate correct request body for simple return type with variables', async () => {
    const expectedQueryString = /* GraphQL */ `
      query userExists($username: String!) {
        userExists(username: $username)
      }
    `;
    const expectedVariables = { username: 'admin' };

    const promise1 = query('userExists', { username: 'admin' });
    const { query: queryString1, variables: vars1 } = promise1.toRequestBody();
    expect(queryString1).toBe(trimIndent(expectedQueryString));
    expect(vars1).toEqual(expectedVariables);
    // Make sure the request is only sent once
    expect(request).not.toHaveBeenCalled();
    await promise1;
    expect(request).toHaveBeenCalledTimes(1);
    request.mockClear();

    const promise2 = query('userExists').by({ username: 'admin' });
    const { query: queryString2, variables: vars2 } = promise2.toRequestBody();
    expect(queryString2).toBe(trimIndent(expectedQueryString));
    expect(vars2).toEqual(expectedVariables);
    // Make sure the request is only sent once
    expect(request).not.toHaveBeenCalled();
    await promise2;
    expect(request).toHaveBeenCalledTimes(1);
    request.mockClear();

    // Abbreviated syntax when there is only one variable
    const promise3 = query('userExists').byUsername('admin');
    const { query: queryString3, variables: vars3 } = promise3.toRequestBody();
    expect(queryString3).toBe(trimIndent(expectedQueryString));
    expect(vars3).toEqual(expectedVariables);
    // Make sure the request is only sent once
    expect(request).not.toHaveBeenCalled();
    await promise3;
    expect(request).toHaveBeenCalledTimes(1);
    request.mockClear();
  });

  it('should generate correct request body for object return type with variables', async () => {
    const expectedQueryString1 = /* GraphQL */ `
      query user($id: Int!) {
        user(id: $id) {
          username
          email
          posts {
            title
          }
        }
      }
    `;
    const expectedQueryString2 = /* GraphQL */ `
      query user($id: Int!) {
        user(id: $id) {
          id
          username
          email
          posts {
            id
            title
            content
            authorId
          }
          registeredAt
        }
      }
    `;
    const expectedVariables1 = { id: 1 };

    const expectedQueryString3 = /* GraphQL */ `
      mutation createUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          username
          email
          posts {
            title
          }
        }
      }
    `;
    const expectedVariables3 = {
      input: {
        username: 'admin',
        password: 'password',
        registeredAt: '2024-03-23T17:43:07.206Z',
      },
    };

    const promise1 = query('user', { id: 1 }).select((user) => [
      user.username,
      user.email,
      user.posts((post) => [post.title]),
    ]);
    const { query: queryString1, variables: vars1 } = promise1.toRequestBody();
    expect(queryString1).toBe(trimIndent(expectedQueryString1));
    expect(vars1).toEqual(expectedVariables1);
    // Make sure the request is only sent once
    expect(request).not.toHaveBeenCalled();
    await promise1;
    expect(request).toHaveBeenCalledTimes(1);
    request.mockClear();

    const promise2 = query('user')
      .select((user) => [user.username, user.email, user.posts((post) => [post.title])])
      .by({ id: 1 });
    const { query: queryString2, variables: vars2 } = promise2.toRequestBody();
    expect(queryString2).toBe(trimIndent(expectedQueryString1));
    expect(vars2).toEqual(expectedVariables1);
    // Make sure the request is only sent once
    expect(request).not.toHaveBeenCalled();
    await promise2;
    expect(request).toHaveBeenCalledTimes(1);
    request.mockClear();

    const promise3 = query('user')
      .select((user) => [user.username, user.email, user.posts((post) => [post.title])])
      // Abbreviated syntax when there is only one variable
      .byId(1);
    const { query: queryString3, variables: vars3 } = promise3.toRequestBody();
    expect(queryString3).toBe(trimIndent(expectedQueryString1));
    expect(vars3).toEqual(expectedVariables1);
    // Make sure the request is only sent once
    expect(request).not.toHaveBeenCalled();
    await promise3;
    expect(request).toHaveBeenCalledTimes(1);
    request.mockClear();

    // Abbreviated syntax for fetching all fields using the 2nd argument as input
    const promise4 = query('user', { id: 1 });
    const { query: queryString4, variables: vars4 } = promise4.toRequestBody();
    expect(queryString4).toBe(trimIndent(expectedQueryString2));
    expect(vars4).toEqual(expectedVariables1);
    // Make sure the request is only sent once
    expect(request).not.toHaveBeenCalled();
    await promise4;
    expect(request).toHaveBeenCalledTimes(1);
    request.mockClear();

    // Abbreviated syntax for fetching all fields using `.by` method to pass input
    const promise5 = query('user').by({ id: 1 });
    const { query: queryString5, variables: vars5 } = promise5.toRequestBody();
    expect(queryString5).toBe(trimIndent(expectedQueryString2));
    expect(vars5).toEqual(expectedVariables1);
    // Make sure the request is only sent once
    expect(request).not.toHaveBeenCalled();
    await promise5;
    expect(request).toHaveBeenCalledTimes(1);
    request.mockClear();

    // Abbreviated syntax for fetching all fields when there is only one variable
    const promise6 = query('user').byId(1);
    const { query: queryString6, variables: vars6 } = promise6.toRequestBody();
    expect(queryString6).toBe(trimIndent(expectedQueryString2));
    expect(vars6).toEqual(expectedVariables1);
    // Make sure the request is only sent once
    expect(request).not.toHaveBeenCalled();
    await promise6;
    expect(request).toHaveBeenCalledTimes(1);
    request.mockClear();

    // Test scalar serialization
    const promise7 = mutation('createUser')
      .select((user) => [user.id, user.username, user.email, user.posts((post) => [post.title])])
      .byInput({
        username: 'admin',
        password: 'password',
        registeredAt: new Date('2024-03-23T17:43:07.206Z'),
      });
    const { query: queryString7, variables: vars7 } = promise7.toRequestBody();
    expect(queryString7).toBe(trimIndent(expectedQueryString3));
    expect(vars7).toEqual(expectedVariables3);
    // Make sure the request is only sent once
    expect(request).not.toHaveBeenCalled();
    await promise7;
    expect(request).toHaveBeenCalledTimes(1);
    request.mockClear();
  });

  it('should generate correct request body for simple return type without variables', async () => {
    const expectedQueryString = /* GraphQL */ `
      mutation logout {
        logout
      }
    `;

    const promise = mutation('logout');
    const { query: queryString, variables: vars } = promise.toRequestBody();
    expect(queryString).toBe(trimIndent(expectedQueryString));
    expect(vars).toEqual({});
    // Make sure the request is only sent once
    expect(request).not.toHaveBeenCalled();
    await promise;
    expect(request).toHaveBeenCalledTimes(1);
    request.mockClear();
  });

  it('should generate correct request body for object return type without variables', async () => {
    const expectedQueryString1 = /* GraphQL */ `
      query users {
        users {
          username
          email
          posts {
            title
          }
        }
      }
    `;
    const expectedQueryString2 = /* GraphQL */ `
      query users {
        users {
          id
          username
          email
          posts {
            id
            title
            content
            authorId
          }
          registeredAt
        }
      }
    `;

    const promise1 = query('users').select((user) => [
      user.username,
      user.email,
      user.posts((post) => [post.title]),
    ]);
    const { query: queryString1, variables: vars1 } = promise1.toRequestBody();
    expect(queryString1).toBe(trimIndent(expectedQueryString1));
    expect(vars1).toEqual({});
    // Make sure the request is only sent once
    expect(request).not.toHaveBeenCalled();
    await promise1;
    expect(request).toHaveBeenCalledTimes(1);
    request.mockClear();

    // Abbreviated syntax for fetching all fields
    const promise2 = query('users');
    const { query: queryString2, variables: vars2 } = promise2.toRequestBody();
    expect(queryString2).toBe(trimIndent(expectedQueryString2));
    expect(vars2).toEqual({});
    // Make sure the request is only sent once
    expect(request).not.toHaveBeenCalled();
    await promise2;
    expect(request).toHaveBeenCalledTimes(1);
    request.mockClear();
  });
});
