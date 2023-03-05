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
- **More concise syntax** by using the cutting-edge **TypeScript 5** features - **no need** to write a lot of `as const` to indicate TypeScript to infer the type of the query as a **literal** type. However, the package is also **compatible with TypeScript 4**, but you have to add some `as const` to make it work properly.

## Installation

```shell
$ npm install graphql graphql-request graphql-intuitive-request
```

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

> **Work with TypeScript 4**
>
> If you are using TypeScript 4, you have to add `as const` to the query to make it work properly.
>
> For example, in the proceeding example, you have to write the query as follows:
>
> ```typescript
> // Query a single entity.
> const user = await client.query(User)(
>   'user',
>   (user) => [user.id, user.name] as const,
> );
>
> // Query a list of entities.
> const users = await client.query([User])(
>   'users',
>   (user) => [user.id, user.name] as const,
> );
> ```
>
> Remember that you have to add `as const` to **nested queries** as well.
>
> ```typescript
> const users = await client.query([User])(
>   'users',
>   (user) =>
>     [
>       user.id,
>       user.name,
>       user.role((role) => [role.id, role.name] as const),
>     ] as const,
> );
> ```
>
> Also, you have to add `as const` to the **variable type object** passed to the query as will be shown in the following section.
>
> This is because TypeScript 4 cannot infer the type of the query as a **literal** type, so you have to explicitly indicate it. However, this is not necessary in TypeScript 5, as TypeScript 5 introduces the `const` modifier on generic types, which allows TypeScript to infer the type of the query as a **literal** type.
>
> ```
>
> ```

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

> **Work with TypeScript 4**
>
> Again, if you are using TypeScript 4, you have to add `as const` to the variable type object to make it work properly.
>
> For example, in the proceeding example, you have to write the variable type object as follows:
>
> ```typescript
> import { Int } from 'graphql-intuitive-request';
>
> const user = await client.query(User, { id: Int } as const)(
>   'user',
>   (user) => [user.id, user.name] as const,
>   { id: 1 },
> );
> ```

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

### Easy encapsulation by partially applying operation name

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

It is annoying to write the same operation name and indicate the type of variables every time. It is also not a good practice as it violates the DRY principle, so it is better to encapsulate the GraphQL query or mutation in a function.

graphql-intuitive-request provides an easy way to partially apply the operation name to GraphQL queries and mutations, so that you can write code like this:

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

As is shown in the proceeding example, you can partially apply the operation name to GraphQL queries and mutations, and then pass the rest of the arguments to the partially applied function to get the final result. It is quite useful to eliminate the duplication of the operation name.

### Convert to query string and query request body

It is also possible to convert graphql-intuitive-request's GraphQL queries and mutations to query strings and query request bodies.

For example, you can convert a query to query string like this:

```typescript
const queryString = client
  .query([User])('users', (user) => [user.id, user.name])
  .toQueryString();
```

The query string will be like this:

```graphql
query {
  users {
    id
    name
  }
}
```

You can also convert a query to request body like this:

```typescript
const queryRequestBody = client
  .query([User], { id: Int })('users', (user) => [user.id, user.name], {
    id: 1,
  })
  .toRequestBody();
```

The request body will be an object like this:

```javascript
{
  query: 'query ($id: Int!) { users(id: $id) { id name } }',
  variables: { id: 1 },
}
```

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
  animal.$on(Dog, (dog) => [dog.$spread(dogFields)]),
  animal.$on(Cat, (cat) => [cat.$spread(catFields)]),
]);
```

For the `$on()` method, it is likely that only subclasses of the base class will be supported.

### Support for unions

GraphQL unions are not supported yet, but they may be supported in the future.

Some planning APIs may have look like this:

```typescript
import { createUnion } from 'graphql-intuitive-request';

const SearchResult = createUnion('SearchResult', [User, Post]);

const searchResult = await client.query(SearchResult, { query: String })(
  'search',
  (searchResult) => [
    searchResult.$on(User, (user) => [user.id, user.name]),
    searchResult.$on(Post, (post) => [post.id, post.title]),
  ]
  { query: 'John' },
);
```

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
  resolve: (type) => Nullable(type),
};
```
