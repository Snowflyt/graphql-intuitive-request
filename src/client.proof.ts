/* eslint-disable sonarjs/no-duplicate-string */

import { equal, expect, test } from 'typroof';

import { createClient } from '@/client';

const { mutation, query, subscription } = createClient('http://example.com/graphql')
  .withWebSocketClient({ url: 'ws://example.com/graphql' })
  .withSchema({
    DateTime: 'String',

    UserDto: {
      id: 'Int!',
      username: 'String!',
      roles: '[RoleDto!]!',
      createdAt: 'DateTime!',
      updatedAt: 'DateTime!',
    },
    RoleDto: {
      id: 'Int!',
      name: 'String!',
      description: 'String',
      permissions: '[PermissionDto!]!',
      createdAt: 'DateTime!',
      updatedAt: 'DateTime!',
    },
    PermissionDto: {
      id: 'Int!',
      name: 'String!',
      description: 'String',
      createdAt: 'DateTime!',
      updatedAt: 'DateTime!',
    },

    LoginInput: {
      username: 'String!',
      password: 'String',
    },
    LoginOutput: {
      token: 'String!',
      user: 'UserDto!',
    },

    CreateUserInput: {
      username: 'String!',
      password: 'String!',
      roleNames: '[String!]!',
    },
    UpdateUserInput: {
      username: 'String',
      password: 'String',
      roleNames: '[String!]',
    },
    CreateRoleInput: {
      name: 'String!',
      description: 'String',
      permissionNames: '[String!]',
    },
    UpdateRoleInput: {
      name: 'String',
      description: 'String',
      permissionNames: '[String!]',
    },
    CreatePermissionInput: {
      name: 'String!',
      description: 'String',
    },
    UpdatePermissionInput: {
      name: 'String',
      description: 'String',
    },

    Chatroom: {
      id: 'Int!',
      name: 'String!',
      messages: '[Message!]!',
      users: '[UserDto!]!',
    },
    Message: {
      mentioned: 'UserDto',
      sender: 'UserDto!',
      text: 'String!',
      timestamp: 'DateTime!',
    },

    CreateChatroomInput: {
      name: 'String!',
    },
    CreateMessageInput: {
      mentionedId: 'Int',
      text: 'String!',
    },

    Query: {
      me: [{}, 'UserDto!'],
      user: [{ id: 'Int!' }, 'UserDto!'],
      users: [{}, '[UserDto!]!'],
      role: [{ id: 'Int!' }, 'RoleDto!'],
      roles: [{}, '[RoleDto!]!'],
      permission: [{ id: 'Int!' }, 'PermissionDto!'],
      permissions: [{}, '[PermissionDto!]!'],

      chatroom: [{ id: 'Int!' }, 'Chatroom!'],
      chatrooms: [{}, '[Chatroom!]!'],
    },

    Mutation: {
      login: [{ input: 'LoginInput!' }, 'LoginOutput!'],

      createUser: [{ input: 'CreateUserInput!' }, 'UserDto!'],
      updateUser: [{ id: 'Int!', input: 'UpdateUserInput!' }, 'UserDto!'],
      removeUser: [{ id: 'Int!' }, 'UserDto!'],
      createRole: [{ input: 'CreateRoleInput!' }, 'RoleDto!'],
      updateRole: [{ id: 'Int!', input: 'UpdateRoleInput!' }, 'RoleDto!'],
      removeRole: [{ id: 'Int!' }, 'RoleDto!'],
      createPermission: [{ input: 'CreatePermissionInput!' }, 'PermissionDto!'],
      updatePermission: [{ id: 'Int!', input: 'UpdatePermissionInput!' }, 'PermissionDto!'],
      removePermission: [{ id: 'Int!' }, 'PermissionDto!'],

      createChatroom: [{ input: 'CreateChatroomInput!' }, 'Chatroom!'],
      joinChatroom: [{ id: 'Int!' }, 'Chatroom!'],
      quitChatroom: [{ id: 'Int!' }, 'Chatroom!'],
      addMessage: [{ chatroomId: 'Int!', input: 'CreateMessageInput!' }, 'Message!'],
    },

    Subscription: {
      messageAdded: [{ chatroomId: 'Int!' }, 'Message!'],
    },
  });

test('`client.query` should infer correct return type', async () => {
  expect(
    await query('chatroom')
      .select((chatroom) => [
        chatroom.id,
        chatroom.name,
        chatroom.users((user) => [user.id, user.username]),
        chatroom.messages((message) => [
          message.timestamp,
          message.sender((user) => [user.id, user.username]),
          message.mentioned((user) => [user.id, user.username]),
          message.text,
        ]),
      ])
      .byId(1),
  ).to(
    equal<{
      id: number;
      name: string;
      users: {
        id: number;
        username: string;
      }[];
      messages: {
        timestamp: string;
        mentioned: {
          id: number;
          username: string;
        } | null;
        sender: {
          id: number;
          username: string;
        };
        text: string;
      }[];
    }>,
  );
});

test('`client.mutation` should infer correct return type', async () => {
  expect(
    await mutation('addMessage')
      .select((message) => [
        message.sender((user) => [user.id, user.username]),
        message.mentioned((user) => [user.id, user.username]),
        message.timestamp,
        message.text,
      ])
      .by({ chatroomId: 1, input: { text: 'hello', mentionedId: null } }),
  ).to(
    equal<{
      sender: {
        id: number;
        username: string;
      };
      mentioned: {
        id: number;
        username: string;
      } | null;
      text: string;
      timestamp: string;
    }>,
  );
});

test('`client.subscription` should infer correct return type', () => {
  const sub = subscription('messageAdded')
    .select((message) => [
      message.sender((user) => [user.id, user.username]),
      message.mentioned((user) => [user.id, user.username]),
      message.timestamp,
      message.text,
    ])
    .by({ chatroomId: 1 });
  expect<Parameters<Parameters<typeof sub.subscribe>[0]>[0]>().to(
    equal<{
      sender: {
        id: number;
        username: string;
      };
      mentioned: {
        id: number;
        username: string;
      } | null;
      text: string;
      timestamp: string;
    }>,
  );
});
