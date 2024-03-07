import { afterAll, describe, expect, it, vi } from 'vitest';

import { createClient } from '@/client';
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
    Query: {
      userExists: [{ username: 'String!' }, 'Boolean!'],
      user: [{ id: 'Int!' }, 'User'],
      users: [{}, '[User!]!'],
      post: [{ id: 'Int!' }, 'Post'],
      posts: [{}, '[Post!]!'],
    },
    Mutation: {
      login: [{ input: 'LoginInput!' }, 'LoginOutput!'],
      logout: [{}, 'Boolean!'],
      createUser: [{ input: 'CreateUserInput!' }, 'User!'],
      updateUser: [{ id: 'Int!', input: 'UpdateUserInput!' }, 'User!'],
      removeUser: [{ id: 'Int!' }, 'User!'],
      createPost: [{ input: 'CreatePostInput!' }, 'Post!'],
      updatePost: [{ id: 'Int!', input: 'UpdatePostInput!' }, 'Post!'],
      removePost: [{ id: 'Int!' }, 'Post!'],
    },
    Subscription: { postAdded: [{}, 'Post!'] },
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

    const promise1 = query('userExists').by({ username: 'admin' });
    const { query: queryString1, variables: variables1 } = promise1.toRequestBody();
    expect(queryString1).toBe(trimIndent(expectedQueryString));
    expect(variables1).toEqual(expectedVariables);
    // Make sure the request is only sent once
    expect(request).not.toHaveBeenCalled();
    await promise1;
    expect(request).toHaveBeenCalledTimes(1);
    request.mockClear();

    // Abbreviated syntax when there is only one variable
    const promise2 = query('userExists').byUsername('admin');
    const { query: queryString2, variables: vars2 } = promise2.toRequestBody();
    expect(queryString2).toBe(trimIndent(expectedQueryString));
    expect(vars2).toEqual(expectedVariables);
    // Make sure the request is only sent once
    expect(request).not.toHaveBeenCalled();
    await promise2;
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
        }
      }
    `;
    const expectedVariables = { id: 1 };

    const promise1 = query('user')
      .select((user) => [user.username, user.email, user.posts((post) => [post.title])])
      .by({ id: 1 });
    const { query: queryString1, variables: vars1 } = promise1.toRequestBody();
    expect(queryString1).toBe(trimIndent(expectedQueryString1));
    expect(vars1).toEqual(expectedVariables);
    // Make sure the request is only sent once
    expect(request).not.toHaveBeenCalled();
    await promise1;
    expect(request).toHaveBeenCalledTimes(1);
    request.mockClear();

    const promise2 = query('user')
      .select((user) => [user.username, user.email, user.posts((post) => [post.title])])
      // Abbreviated syntax when there is only one variable
      .byId(1);
    const { query: queryString2, variables: vars2 } = promise2.toRequestBody();
    expect(queryString2).toBe(trimIndent(expectedQueryString1));
    expect(vars2).toEqual(expectedVariables);
    // Make sure the request is only sent once
    expect(request).not.toHaveBeenCalled();
    await promise2;
    expect(request).toHaveBeenCalledTimes(1);
    request.mockClear();

    // Abbreviated syntax for fetching all fields
    const promise3 = query('user').by({ id: 1 });
    const { query: queryString3, variables: vars3 } = promise3.toRequestBody();
    expect(queryString3).toBe(trimIndent(expectedQueryString2));
    expect(vars3).toEqual(expectedVariables);
    // Make sure the request is only sent once
    expect(request).not.toHaveBeenCalled();
    await promise3;
    expect(request).toHaveBeenCalledTimes(1);
    request.mockClear();

    // Abbreviated syntax for fetching all fields when there is only one variable
    const promise4 = query('user').byId(1);
    const { query: queryString4, variables: vars4 } = promise4.toRequestBody();
    expect(queryString4).toBe(trimIndent(expectedQueryString2));
    expect(vars4).toEqual(expectedVariables);
    // Make sure the request is only sent once
    expect(request).not.toHaveBeenCalled();
    await promise4;
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
