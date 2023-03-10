import { GraphQLIntuitiveClient, Int } from '../src';
import { createQueryStringFor } from '../src/client';

class User {
  id: number;
  username: string;
  roles: Role[];

  constructor(id: number, username: string, roles: Role[]) {
    this.id = id;
    this.username = username;
    this.roles = roles;
  }
}

class Role {
  id: number;
  name: string;
  description: string | null;
  permissions: Permission[];

  constructor(
    id: number,
    name: string,
    description: string | null,
    permissions: Permission[],
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.permissions = permissions;
  }
}

class Permission {
  id: number;
  name: string;
  description: string | null;

  constructor(id: number, name: string, description: string | null) {
    this.id = id;
    this.name = name;
    this.description = description;
  }
}

test('GraphQLIntuitiveClient', async () => {
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1Iiwicm9sZU5hbWVzIjpbImFkbWluIl0sInN1YiI6MSwiaWF0IjoxNjc4NDMxOTI4LCJleHAiOjE2Nzg0Mzc5Mjh9.eh4rJ_IenHCPyQ5ML0DVAnq87z00jFpEWQvwuxIsIw0';

  const client = new GraphQLIntuitiveClient('http://localhost:3000/graphql', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  class CreatePermissionInput {
    name: string;
    description: string | null;

    constructor(name: string, description: string | null) {
      this.name = name;
      this.description = description;
    }
  }

  // const createPermission = client.mutation(
  //   'createPermission',
  //   {
  //     createPermissionInput: CreatePermissionInput,
  //   },
  //   Permission,
  // );
  // const createdPermission = await createPermission(
  //   {
  //     createPermissionInput: new CreatePermissionInput('test', 'test'),
  //   },
  //   (permission) => [permission.id, permission.name, permission.description],
  // );
  // console.log(createdPermission);

  console.log(
    createQueryStringFor(
      'mutation',
      'createPermission',
      {
        createPermissionInput: CreatePermissionInput,
      },
      Permission,
      (permission) => [permission.id, permission.name, permission.description],
    ),
  );

  console.log(
    createQueryStringFor('query', 'user', { id: Int }, User, (user) => [
      user.id,
      user.username,
      user.roles((role) => [
        role.name,
        role.description,
        role.permissions((permission) => [permission.name]),
      ]),
    ]),
  );

  const queryUser = client.query('user', { id: Int }, User);
  const user = await queryUser(
    {
      id: 1,
    },
    (user) => [
      user.id,
      user.username,
      user.roles((role) => [
        role.name,
        role.description,
        role.permissions((permission) => [permission.name]),
      ]),
    ],
  );

  console.log(createQueryStringFor('mutation', 'reset'));

  await client.mutation('reset')();

  console.log(
    createQueryStringFor('mutation', 'setWinnersCount', {
      first: Int,
      second: Int,
      third: Int,
    }),
  );

  await client.mutation('setWinnersCount', {
    first: Int,
    second: Int,
    third: Int,
  })({
    first: 1,
    second: 2,
    third: 3,
  });

  console.log(
    createQueryStringFor('query', 'users', {}, [User], (user) => [
      user.id,
      user.username,
      user.roles((role) => [
        role.name,
        role.description,
        role.permissions((permission) => [permission.name]),
      ]),
    ]),
  );

  const queryUsers = client.query('users', {}, [User]);
  const users = await queryUsers({}, (user) => [
    user.id,
    user.username,
    user.roles((role) => [
      role.name,
      role.description,
      role.permissions((permission) => [permission.name]),
    ]),
  ]);

  console.log(users);

  console.log(user);
  console.log(user.roles[0]);
});
