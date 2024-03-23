/* eslint-disable sonarjs/no-duplicate-string */

import { describe, expect, it } from 'vitest';

import { createClient } from '@/client';
import { enumOf } from '@/types';
import { trimIndent } from '@/utils';

describe('client', () => {
  const { mutation, query } = createClient('https://graphqlzero.almansi.me/api').withSchema({
    Query: {
      _: ['=>', 'Int'],
      albums: [{ options: 'PageQueryOptions' }, '=>', 'AlbumsPage!'],
      album: [{ id: 'ID!' }, '=>', 'Album'],
      comments: [{ options: 'PageQueryOptions' }, '=>', 'CommentsPage!'],
      comment: [{ id: 'ID!' }, '=>', 'Comment'],
      photos: [{ options: 'PageQueryOptions' }, '=>', 'PhotosPage!'],
      photo: [{ id: 'ID!' }, '=>', 'Photo'],
      posts: [{ options: 'PageQueryOptions' }, '=>', 'PostsPage!'],
      post: [{ id: 'ID!' }, '=>', 'Post'],
      todos: [{ options: 'PageQueryOptions' }, '=>', 'TodosPage!'],
      todo: [{ id: 'ID!' }, '=>', 'Todo'],
      users: [{ options: 'PageQueryOptions' }, '=>', 'UsersPage!'],
      user: [{ id: 'ID!' }, '=>', 'User'],
    },

    Mutation: {
      _: ['=>', 'Int'],
      createAlbum: [{ input: 'CreateAlbumInput!' }, '=>', 'Album'],
      updateAlbum: [{ id: 'ID!', input: 'UpdateAlbumInput!' }, '=>', 'Album'],
      deleteAlbum: [{ id: 'ID!' }, '=>', 'Boolean!'],
      createComment: [{ input: 'CreateCommentInput!' }, '=>', 'Comment'],
      updateComment: [{ id: 'ID!', input: 'UpdateCommentInput!' }, '=>', 'Comment'],
      deleteComment: [{ id: 'ID!' }, '=>', 'Boolean!'],
      createPhoto: [{ input: 'CreatePhotoInput!' }, '=>', 'Photo'],
      updatePhoto: [{ id: 'ID!', input: 'UpdatePhotoInput!' }, '=>', 'Photo'],
      deletePhoto: [{ id: 'ID!' }, '=>', 'Boolean!'],
      createPost: [{ input: 'CreatePostInput!' }, '=>', 'Post'],
      updatePost: [{ id: 'ID!', input: 'UpdatePostInput!' }, '=>', 'Post'],
      deletePost: [{ id: 'ID!' }, '=>', 'Boolean!'],
      createTodo: [{ input: 'CreateTodoInput!' }, '=>', 'Todo'],
      updateTodo: [{ id: 'ID!', input: 'UpdateTodoInput!' }, '=>', 'Todo'],
      deleteTodo: [{ id: 'ID!' }, '=>', 'Boolean!'],
      createUser: [{ input: 'CreateUserInput!' }, '=>', 'User'],
      updateUser: [{ id: 'ID!', input: 'UpdateUserInput!' }, '=>', 'User'],
      deleteUser: [{ id: 'ID!' }, '=>', 'Boolean!'],
    },

    PageQueryOptions: {
      paginate: 'PaginateOptions',
      slice: 'SliceOptions',
      sort: '[SortOptions]',
      operator: '[OperatorOptions]',
      search: 'SearchOptions',
    },
    PaginateOptions: {
      page: 'Int',
      limit: 'Int',
    },
    SliceOptions: {
      start: 'Int',
      end: 'Int',
      limit: 'Int',
    },
    SortOptions: {
      field: 'String',
      order: 'SortOrderEnum',
    },
    SortOrderEnum: enumOf('ASC', 'DESC'),
    OperatorOptions: {
      kind: 'OperatorKindEnum',
      field: 'String',
      value: 'String',
    },
    OperatorKindEnum: enumOf('GTE', 'LTE', 'NE', 'LIKE'),
    SearchOptions: {
      q: 'String',
    },

    PaginationLinks: {
      first: 'PageLimitPair',
      prev: 'PageLimitPair',
      next: 'PageLimitPair',
      last: 'PageLimitPair',
    },
    PageLimitPair: {
      page: 'Int',
      limit: 'Int',
    },
    PageMetadata: {
      totalCount: 'Int!',
    },

    Album: {
      id: 'ID',
      title: 'String',
      user: 'User',
      photos: [{ options: 'PageQueryOptions' }, 'PhotosPage!'],
    },
    AlbumsPage: {
      data: '[Album!]!',
      links: 'PaginationLinks',
      meta: 'PageMetadata!',
    },
    CreateAlbumInput: {
      title: 'String!',
      userId: 'ID!',
    },
    UpdateAlbumInput: {
      title: 'String',
      userId: 'ID',
    },

    Comment: {
      id: 'ID',
      name: 'String',
      email: 'String',
      body: 'String',
      post: 'Post',
    },
    CommentsPage: {
      data: '[Comment!]!',
      links: 'PaginationLinks',
      meta: 'PageMetadata',
    },
    CreateCommentInput: {
      name: 'String!',
      email: 'String!',
      body: 'String!',
    },
    UpdateCommentInput: {
      name: 'String',
      email: 'String',
      body: 'String',
    },

    Photo: {
      id: 'ID',
      title: 'String',
      url: 'String',
      thumbnailUrl: 'String',
      album: 'Album',
    },
    PhotosPage: {
      data: '[Photo!]!',
      links: 'PaginationLinks',
      meta: 'PageMetadata!',
    },
    CreatePhotoInput: {
      title: 'String!',
      url: 'String!',
      thumbnailUrl: 'String!',
    },
    UpdatePhotoInput: {
      title: 'String',
      url: 'String',
      thumbnailUrl: 'String',
    },

    Post: {
      id: 'ID',
      title: 'String',
      body: 'String',
      user: 'User',
      comments: [{ options: 'PageQueryOptions' }, 'CommentsPage'],
    },
    PostsPage: {
      data: '[Post!]!',
      links: 'PaginationLinks',
      meta: 'PageMetadata!',
    },
    CreatePostInput: {
      title: 'String!',
      body: 'String!',
    },
    UpdatePostInput: {
      title: 'String',
      body: 'String',
    },

    Todo: {
      id: 'ID',
      title: 'String',
      completed: 'Boolean',
      user: 'User',
    },
    TodosPage: {
      data: '[Todo!]!',
      links: 'PaginationLinks',
      meta: 'PageMetadata!',
    },
    CreateTodoInput: {
      title: 'String!',
      completed: 'Boolean!',
    },
    UpdateTodoInput: {
      title: 'String',
      completed: 'Boolean',
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
      posts: [{ options: 'PageQueryOptions' }, 'PostsPage'],
      albums: [{ options: 'PageQueryOptions' }, 'AlbumsPage'],
      todos: [{ options: 'PageQueryOptions' }, 'TodosPage'],
    },
    UsersPage: {
      data: '[User!]!',
      links: 'PaginationLinks',
      meta: 'PageMetadata!',
    },
    Address: {
      street: 'String',
      suite: 'String',
      city: 'String',
      zipcode: 'String',
      geo: 'Geo',
    },
    AddressInput: {
      street: 'String',
      suite: 'String',
      city: 'String',
      zipcode: 'String',
      geo: 'GeoInput',
    },
    Geo: {
      lat: 'Float!',
      lng: 'Float!',
    },
    GeoInput: {
      lat: 'Float',
      lng: 'Float',
    },
    Company: {
      name: 'String',
      catchPhrase: 'String',
      bs: 'String',
    },
    CompanyInput: {
      name: 'String',
      catchPhrase: 'String',
      bs: 'String',
    },
    CreateUserInput: {
      name: 'String!',
      username: 'String!',
      email: 'String!',
      address: 'AddressInput',
      phone: 'String',
      website: 'String',
      company: 'CompanyInput',
    },
    UpdateUserInput: {
      name: 'String',
      username: 'String',
      email: 'String',
      address: 'AddressInput',
      phone: 'String',
      website: 'String',
      company: 'CompanyInput',
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
    const user = await query('user', { id: '1' }).select((user) => [
      user.id,
      user.username,
      user.email,
      user.address((address) => [address.geo((geo) => [geo.lat, geo.lng])]),
    ]);
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
          { id: '2', title: 'qui est esse' },
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

  it('should get albums with photos by page', async () => {
    const albums = await query('albums')
      .select((albums) => [
        albums.data((album) => [
          album.id,
          album.title,
          album.user((user) => [user.id, user.username, user.email]),
          album.photos(
            {
              options: {
                paginate: { page: 2, limit: 3 },
                sort: [{ field: 'title', order: 'ASC' }],
              },
            },
            (photos) => [
              photos.data((photo) => [photo.id, photo.title]),
              photos.meta((meta) => [meta.totalCount]),
            ],
          ),
        ]),
        albums.meta((meta) => [meta.totalCount]),
      ])
      .byOptions({ paginate: { page: 3, limit: 2 } });
    expect(albums).toEqual({
      data: [
        {
          id: '5',
          title: 'eaque aut omnis a',
          user: {
            id: '1',
            username: 'Bret',
            email: 'Sincere@april.biz',
          },
          photos: {
            data: [
              {
                id: '244',
                title: 'aut doloribus quia unde quia',
              },
              {
                id: '204',
                title: 'beatae est vel tenetur',
              },
              {
                id: '207',
                title: 'culpa qui quos reiciendis aut nostrum et id temporibus',
              },
            ],
            meta: {
              totalCount: 50,
            },
          },
        },
        {
          id: '6',
          title: 'natus impedit quibusdam illo est',
          user: {
            id: '1',
            username: 'Bret',
            email: 'Sincere@april.biz',
          },
          photos: {
            data: [
              {
                id: '294',
                title: 'consequuntur qui et culpa eveniet porro quis',
              },
              {
                id: '275',
                title: 'consequuntur quo fugit non',
              },
              {
                id: '259',
                title: 'delectus molestias aut sint fugiat laudantium sequi praesentium',
              },
            ],
            meta: {
              totalCount: 50,
            },
          },
        },
      ],
      meta: {
        totalCount: 100,
      },
    });
  });
});
