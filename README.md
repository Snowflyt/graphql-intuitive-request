# graphql-intuitive-request

Intuitive and (more importantly) TS-friendly GraphQL client

**WARNING:** This package is still in development, and the API may change in the future.

## Overview

graphql-intuitive-request provides an **intuitive** and **TS-friendly** way to write GraphQL queries and mutations **without using string literals**, and provides **exact** return types inference.

### Example

```typescript
import { GraphQLIntuitiveClient } from 'graphql-intuitive-request';

const client = new GraphQLIntuitiveClient('https://example.com/graphql', {
  headers: {
    Authorization: `Bearer <jwt_token>`,
  },
});

class User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

class Role {
  id: number;
  name: string;
  permissions: Permission[];
}

class Permission {
  id: number;
  name: string;
}

// The type of `res` is inferred as
// Array<{
//   id: number;
//   name: string;
//   role: {
//     name: string;
//     permissions: Array<{ name: string}>
//   }
// }>
const res = await client.query([User])('users', (user) => [
  user.id,
  user.name,
  user.role((role) => [
    role.role.name,
    role.permissions((permission) => [permission.name]),
  ]),
]);
```

As you can see, the return type of the query is inferred as `Array<{ id: number; name: string; role: { name: string; permissions: Array<{ name: string}> } }>`, which is **exactly** what we want, not just a generic object like `User[]`!

![Exact Type Inference with TypeScript](https://drive.google.com/uc?view=export&id=13TdvNgq-VXphL61qdNOs4I7HzfnIZvOI)

So now when you access fields that are not requested in the query, TypeScript will throw an error at compile time!

![TypeScript Compile Time Type Check](https://drive.google.com/uc?export=view&id=1QQDy6IabestQTU3kE1wbW5axbFkpRL-g)

Also, now you get **intellisense** for the fields of the query, and you can **easily** add new fields to the query by making full use of TypeScript's type system! There's no need to use ESLint plugins to validate your GraphQL queries!

![TypeScript Intellisense Support](https://drive.google.com/uc?export=view&id=1EgC4pnbVyFlB6HrGPhpQvrk-hDS7UBh_)

### Features

- **Exact return types inference** for queries and mutations - if you query an entity with **specific** fields, then the return type will be an object with those fields, **not a generic object**
- **Intuitive** API made full use of TypeScript's type system - **no need** to write GraphQL queries in **string**s and use ESLint plugins to validate them, everything just in TypeScript!
- built on top of `graphql-request`
- **TypeScript 5 or higher is required**, as the `const` generic modifier introduced in TypeScript 5 is used

## Installation

```shell
$ npm install graphql graphql-request graphql-intuitive-request
```

> **WARNING:** As TypeScript 5 is currently in beta and many packages are not yet compatible with it, you may need to install typescript 5 in your project using `--force` option and then install graphql-intuitive-request.
>
> ```shell
> $ npm install typescript@next --force
> $ npm install graphql graphql-request graphql-intuitive-request --force
> ```

## Usage

### Query a single entity or a list of entities

You can query a single entity or a list of entities by passing a class or a single-element tuple of a class to indicate querying a single entity or a list of entities.

```typescript
// Query a single entity.
const user = await client.query(User)('user', (user) => [user.id, user.name]);

// Query a list of entities.
const users = await client.query([User])('users', (user) => [
  user.id,
  user.name,
]);
```

### Query with variables

You can pass variables to the query by passing an object indicating the type of each variable and an object containing the actual values of the variables.

```typescript
import { Int } from 'graphql-intuitive-request';

const user = await client.query(User, { id: Int })(
  'user',
  (user) => [user.id, user.name],
  { id: 1 },
);
```

### Types of variables

graphql-intuitive-request provides support for basic GraphQL types, such as `String`, `Int`, `Float`, `Boolean`, and `ID`, and a `Nullable` function to indicate a nullable field.

```typescript
import { ID, Int, Float, Nullable } from 'graphql-intuitive-request';
// In case of GraphQL String and Boolean types,
// use JavaScript's built-in String and Boolean functions.

const queryParams = {
  id: Int,
  description: Nullable(String),
  permissionNames: [String],
};

const updatedRole = await client.mutation(Role, queryParams)(
  'updateRole',
  (role) => [role.id, role.name],
  {
    id: 1,
    description: null,
    permissionNames: ['CREATE_USER'],
  },
);
```

As is shown in the proceeding example, mutations are also supported.

> **WARNING:** Currently, graphql-intuitive-request does not support nested types, such as `[[String]]` or `{ description: String }` to avoid cycles in the type system.
>
> Types that are currently supported are:
>
> - basic GraphQL types: `String`, `Int`, `Float`, `Boolean`, and `ID`
> - nullable versions of basic GraphQL types like `Nullable(String)`
> - array of basic GraphQL types like `[String]`
> - array of nullable versions of basic GraphQL types like `[Nullable(String)]`
> - nullable array of nullable versions of basic GraphQL types like `Nullable([Nullable(String)])`
> - class types like `User`
> - nullable class types like `Nullable(User)`
> - array of class types like `[User]`
> - array of nullable class types like `[Nullable(User)]`
> - nullable array of nullable class types like `Nullable([Nullable(User)])`
>
> Also, when using class types, make sure they are also defined in the GraphQL schema with the same name.
>
> For example, if your GraphQL schema is like this:
>
> ```graphql
> type UpdateRoleInput {
>   description: String
>   permissionNames: [String!]!
> }
>
> type mutation {
>   updateRole(id: Int!, input: UpdateRoleInput!): Role!
> }
> ```
>
> Then you should also define the type in graphql-intuitive-request like this:
>
> ```typescript
> class UpdateRoleInput {
>   description: string | null;
>   permissionNames: string[];
> }
>
> const updatedRole = await client.mutation(Role, {
>   id: Int,
>   input: UpdateRoleInput,
> })('updateRole', (role) => [role.id, role.name], {
>   id: 1,
>   input: {
>     description: null,
>     permissionNames: ['CREATE_USER'],
>   },
> });
> ```
>
> Stressing again, **the name of the class must be the same as the name of the type in the GraphQL schema**. graphql-intuitive-request will use the name of the class to determine the name of the type in query strings.

### Easy encapsulation by partially applying action name

It is also amazingly easy to encapsulating GraphQL queries and mutations in graphql-intuitive-request.

For example, similar code like this may often be found in a project:

```typescript
import { Int } from 'graphql-intuitive-request';

class UpdateRoleInput {
  description: string | null;
  permissionNames: string[];
}

const updatedRole = await client.mutation(Role, {
  id: Int,
  input: UpdateRoleInput,
})('updateRole', (role) => [role.id, role.name], {
  id: 1,
  input: {
    description: null,
    permissionNames: ['CREATE_USER'],
  },
});
```

It is annoying to write the same action name and indicate the type of variables every time. It is also not a good practice as it violates the DRY principle, so it is better to encapsulate the GraphQL query or mutation in a function.

graphql-intuitive-request provides an easy way to partially apply the action name to GraphQL queries and mutations, so that you can write code like this:

```typescript
const updateRole = client.mutation(Role, { id: Int, input: UpdateRoleInput })(
  'updateRole',
);

const updatedRole = await updateRole((role) => [role.id, role.name], {
  id: 1,
  input: {
    description: null,
    permissionNames: ['CREATE_USER'],
  },
});
```

As is shown in the proceeding example, you can partially apply the action name to GraphQL queries and mutations, and then pass the rest of the arguments to the partially applied function to get the final result. It is quite useful to eliminate the duplication of the action name.

### Work with graphql-request

graphql-intuitive-request is built on top of `graphql-request`, so you can use all the features of `graphql-request` with graphql-intuitive-request.

You can get the `GraphQLClient` instance from graphql-intuitive-request by calling the `getGraphQLClient()` method on the `GraphQLIntuitiveRequest` instance.

```typescript
const graphQLIntuitiveClient = new GraphQLIntuitiveRequest(
  'http://example.com/graphql',
);

const graphQLClient = graphQLIntuitiveClient.getGraphQLClient();
```
