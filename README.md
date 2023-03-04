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

There's currently some technical issues with the package, so it's not available on npm yet. Wait for a while, and it will be available soon.

For now, you can clone the repository and install it locally:

```shell
$ git clone git@github.com:Snowfly-T/graphql-intuitive-request.git
$ cd graphql-intuitive-request
$ npm install --force
$ npm run build
```

Then, in your project, install the package from the local directory.

```shell
$ npm install graphql graphql-request <path_to_graphql-intuitive-request> --force
```

> **WARNING:** As TypeScript 5 is currently in beta and many packages are not yet compatible with it, you may need to install typescript 5 in your project using `--force` option and then install graphql-intuitive-request.
>
> ```shell
> $ npm install typescript@next --force
> $ npm install graphql graphql-request <path_to_graphql-intuitive-request> --force
> ```

<del>

```shell
$ npm install graphql graphql-request graphql-intuitive-request
```

> **WARNING:** As TypeScript 5 is currently in beta and many packages are not yet compatible with it, you may need to install typescript 5 in your project using `--force` option and then install graphql-intuitive-request.
>
> ```shell
> $ npm install typescript@next --force
> $ npm install graphql graphql-request graphql-intuitive-request --force
> ```

</del>

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

You can get the `GraphQLClient` instance from graphql-intuitive-request by calling the `getGraphQLClient()` method on the `GraphQLIntuitiveClient` instance.

```typescript
const graphQLIntuitiveClient = new GraphQLIntuitiveClient(
  'http://example.com/graphql',
);

const graphQLClient = graphQLIntuitiveClient.getGraphQLClient();
```

## Future plans

Remember that these are just plans, and you cannot use them yet.

### Support for passing variables without passing types

Currently, graphql-intuitive-request requires you to pass the types of variables to the query or mutation, so when you write the actual values of variables, you can make full use of the type system to avoid mistakes and use the auto-completion feature of your IDE/editor. You can also enjoy the benefits of easy encapsulation with type checking by passing the types of variables.

However, sometimes you may want to use a query or mutation only once, and you don't want to define the types of variables. In this case, you can just pass the actual values of variables without passing the types of variables.

For example, some planning APIs may have a query like this:

```typescript
const updatedRole = await client.mutation(Role)(
  'role',
  (role) => [role.id, role.name],
  { id: ID(1) },
);
```

This time, you cannot enjoy the benefits of auto-completion and type checking. Also, you still have to use `ID(1)` or something like this to indicate the type of the variable, which is unavoidable because it is impossible to infer the GraphQL type of some variables. For example, we cannot infer whether a `number` is a GraphQL `Int` or a GraphQL `Float`, and whether a `string` is a GraphQL `String` or a GraphQL `ID`, so in such cases, you have to use `ID(1)` or `Int(1)` to indicate the type of the variable. GraphQL is strongly typed, so it is still necessary to indicate the type of the variable.

### Support for subscriptions

GraphQL subscriptions are not supported yet, but they may be supported in the future.

Some planning APIs may have look like this:

```typescript
const onCommentAddedSubscription = client.subscription(Comment, {
  postId: Int,
})('commentAdded', (comment) => [comment.id, comment.content], { postId: 1 });

const unsubscribe = onCommentAddedSubscription.subscribe((data) => {
  console.log(data.id, data.content);
});

unsubscribe();
```

### Support for fragments

Currently, you can define something like this to achieve limited support for fragments:

```typescript
const characterFields = (character: QueryBuilder<Character>) => [
  character.name,
  character.appearsIn,
];

const hero = await client.query(Character, { episode: Episode })(
  'hero',
  characterFields,
  { episode: 'JEDI' },
);
```

However, you cannot define fragments like this:

```graphql
fragment CharacterFields on Character {
  name
  appearsIn
}

query HeroAndFriends {
  hero(episode: EMPIRE) {
    ...CharacterFields
    friends {
      ...CharacterFields
    }
  }
}
```

In the future, you may be able to define fragments like this:

```typescript
import { createFragmentOn } from 'graphql-intuitive-request';

const characterFields = createFragmentOn(Character, (character) => [
  character.name,
  character.appearsIn,
]);

const hero = await client.query(Character, { episode: Episode })(
  'hero',
  (hero) => [
    hero.$spread(characterFields),
    hero.friends((friend) => [friend.$spread(characterFields)]),
  ],
  { episode: 'JEDI' },
);
```

For inline fragments like this:

```graphql
query {
  animals {
    ... on Dog {
      name
      breed
    }
    ... on Cat {
      name
      color
    }
  }
}
```

You may be able to define them like this:

```typescript
import { createFragmentOn } from 'graphql-intuitive-request';

const dogFields = createFragmentOn(Dog, (dog) => [dog.name, dog.breed]);
const catFields = createFragmentOn(Cat, (cat) => [cat.name, cat.color]);

const animals = await client.query([Animal])('animals', (animal) => [
  animal.$spreadOn(Dog, (dog) => [dog.$spread(dogFields)]),
  animal.$spreadOn(Cat, (cat) => [cat.$spread(catFields)]),
]);
```

For the `$on()` method, it is likely that only subclasses of the base class will be supported.

### Support for directives

graphql-intuitive-request currently does not support directives. In the future, you may be able use directives.

For example, for graphql queries like this:

```graphql
query Hero($episode: Episode, $withHeight: Boolean!, $withFriends: Boolean!) {
  hero(episode: $episode) {
    name
    height @include(if: $withHeight)
    friends @include(if: $withFriends) {
      name
    }
  }
}
```

You may be able to write code like this:

```typescript
const hero = await client.query(Character, {
  episode: Nullable(Episode),
  withHeight: Boolean,
  skipFriends: Boolean,
})(
  'hero',
  (hero, variables) => [
    hero.name,
    hero.height.include$({
      if: variables.withHeight,
    }),
    hero
      .friends((friend) => [friend.name])
      .skip$({
        if: variables.skipFriends,
      }),
  ],
  { episode: 'JEDI', withHeight: true, skipFriends: false },
);
```

However, now typescript cannot determine whether `height` and `friends` are `undefined` or not by the type of `variables` (It is technically possible, but we have to add the `const` modifier to the `variables` parameter, and then you cannot pass a dynamic object to the `variables` parameter any more. However, in real-world applications, the variables are usually dynamic objects, so we cannot do this). So, you have to handle the case yourself.

Custom directives may also be supported.

```typescript
const client = new GraphQLIntuitiveClient('http://example.com/graphql', {
  directives: {
    currency: {
      type: 'query',
      args: {
        currency: String,
      },
      resolve: (type) => type,
    },
  },
});

const book = await client.query(Book)('book', (book) => [
  book.title,
  book.price.currency$({
    currency: 'USD',
  }),
]);
```

As you can see, you can use the `resolve` option to indicate how the directive affects the return type of the field. For example, the definition of `@include` is like this:

```typescript
const includeDirective = {
  type: 'query',
  args: {
    if: Boolean,
  },
  returns: (type) => Nullable(type),
};
```
