/* eslint-disable sonarjs/no-duplicate-string */

import { describe, expect, it } from 'vitest';

import { createClient } from '@/client';
import { enumOf } from '@/types';
import { trimIndent } from '@/utils';

describe('client', () => {
  const { mutation, query } = createClient('https://graphqlzero.almansi.me/api').withSchema({
    PageLimitPair: {
      page: 'Int',
      limit: 'Int',
    },
    PaginationLinks: {
      first: 'PageLimitPair',
      prev: 'PageLimitPair',
      next: 'PageLimitPair',
      last: 'PageLimitPair',
    },
    PageMetaData: {
      totalCount: 'Int',
    },

    OperatorKindEnum: enumOf('GTE', 'LTE', 'NE', 'LIKE'),
    PaginateOptions: {
      'page?': 'Int!',
      'limit?': 'Int!',
    },
    SliceOptions: {
      'start?': 'Int!',
      'end?': 'Int!',
      'limit?': 'Int!',
    },
    SortOptions: {
      'field?': 'String!',
      'order?': 'String!',
    },
    OperatorOptions: {
      'kind?': 'OperatorKindEnum!',
      'field?': 'String!',
      'value?': 'String!',
    },
    SearchOptions: {
      'q?': 'String!',
    },
    PageQueryOptions: {
      'paginate?': 'PaginateOptions!',
      'slice?': 'SliceOptions!',
      'sort?': 'SortOptions!',
      'operator?': 'OperatorOptions!',
      'search?': 'SearchOptions!',
    },

    Geo: {
      lat: 'Float',
      lng: 'Float',
    },
    Address: {
      street: 'String',
      suite: 'String',
      city: 'String',
      zipcode: 'String',
      geo: 'Geo',
    },
    Company: {
      name: 'String',
      catchPhrase: 'String',
      bs: 'String',
    },
    Comment: {
      id: 'ID',
      name: 'String',
      email: 'String',
      body: 'String',
    },
    CommentsPage: {
      data: '[Comment!]',
      links: 'PaginationLinks',
      meta: 'PageMetaData',
    },
    Post: {
      id: 'ID',
      title: 'String',
      body: 'String',
      comments: 'CommentsPage',
    },
    PostsPage: {
      data: '[Post!]',
      links: 'PaginationLinks',
      meta: 'PageMetaData',
    },
    User: {
      id: 'ID',
      name: 'String',
      username: 'String',
      email: 'String',
      address: 'Address',
      phone: 'String',
      website: 'String',
      company: 'Company',
      posts: 'PostsPage',
    },

    CreatePostInput: {
      title: 'String!',
      body: 'String!',
    },
    UpdatePostInput: {
      'title?': 'String!',
      'body?': 'String!',
    },

    Query: {
      _: [{}, 'Int'],
      post: [{ id: 'ID!' }, 'Post'],
      user: [{ id: 'ID!' }, 'User'],
      posts: [{ 'options?': 'PageQueryOptions!' }, 'PostsPage'],
    },

    Mutation: {
      _: [{}, 'Int'],
      createPost: [{ input: 'CreatePostInput!' }, 'Post'],
      updatePost: [{ id: 'ID!', input: 'UpdatePostInput!' }, 'Post'],
      deletePost: [{ id: 'ID!' }, 'Boolean'],
    },
  });

  it('should connect to the server', async () => {
    expect(await query('_')).toBe(null);
    expect(await mutation('_')).toBe(null);
  });

  it('should get a post', async () => {
    const post = await query('post')
      .select((post) => [post.id, post.title, post.body])
      .byId('1');
    expect(post).toEqual({
      id: '1',
      title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
      body: trimIndent(`
        quia et suscipit
        suscipit recusandae consequuntur expedita et cum
        reprehenderit molestiae ut ut quas totam
        nostrum rerum est autem sunt rem eveniet architecto
      `),
    });
  });

  it('should get a user', async () => {
    const user = await query('user')
      .select((user) => [
        user.id,
        user.username,
        user.email,
        user.address((address) => [address.geo((geo) => [geo.lat, geo.lng])]),
      ])
      .byId('1');
    expect(user).toEqual({
      id: '1',
      username: 'Bret',
      email: 'Sincere@april.biz',
      address: {
        geo: {
          lat: -37.3159,
          lng: 81.1496,
        },
      },
    });
  });

  it("should get a user's posts", async () => {
    const user = await query('user')
      .select((user) => [user.posts((posts) => [posts.data((post) => [post.id, post.title])])])
      .byId('1');
    expect(user).toEqual({
      posts: {
        data: [
          {
            id: '1',
            title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
          },
          {
            id: '2',
            title: 'qui est esse',
          },
          {
            id: '3',
            title: 'ea molestias quasi exercitationem repellat qui ipsa sit aut',
          },
          {
            id: '4',
            title: 'eum et est occaecati',
          },
          {
            id: '5',
            title: 'nesciunt quas odio',
          },
          {
            id: '6',
            title: 'dolorem eum magni eos aperiam quia',
          },
          {
            id: '7',
            title: 'magnam facilis autem',
          },
          {
            id: '8',
            title: 'dolorem dolore est ipsam',
          },
          {
            id: '9',
            title: 'nesciunt iure omnis dolorem tempora et accusantium',
          },
          {
            id: '10',
            title: 'optio molestias id quia eum',
          },
        ],
      },
    });
  });

  it('should get all posts', async () => {
    const posts = await query('posts')
      .select((posts) => [
        posts.data((post) => [post.id, post.title]),
        posts.meta((meta) => [meta.totalCount]),
      ])
      .byOptions({ paginate: { page: 1, limit: 5 } });
    expect(posts).toEqual({
      data: [
        {
          id: '1',
          title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
        },
        {
          id: '2',
          title: 'qui est esse',
        },
        {
          id: '3',
          title: 'ea molestias quasi exercitationem repellat qui ipsa sit aut',
        },
        {
          id: '4',
          title: 'eum et est occaecati',
        },
        {
          id: '5',
          title: 'nesciunt quas odio',
        },
      ],
      meta: {
        totalCount: 100,
      },
    });
  });

  it('should create a post', async () => {
    const post = await mutation('createPost')
      .select((post) => [post.id, post.title, post.body])
      .byInput({
        title: 'A Very Captivating Post Title',
        body: 'Some interesting content.',
      });
    expect(post).toEqual({
      id: '101',
      title: 'A Very Captivating Post Title',
      body: 'Some interesting content.',
    });
  });

  it('should update a post', async () => {
    const post = await mutation('updatePost')
      .select((post) => [post.id, post.body])
      .by({
        id: '1',
        input: {
          body: 'Some updated content.',
        },
      });
    expect(post).toEqual({
      id: '1',
      body: 'Some updated content.',
    });
  });

  it('should delete a post', async () => {
    const deleted = await mutation('deletePost').byId('101');
    expect(deleted).toBe(true);
  });
});
