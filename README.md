# graphql-intuitive-request

Intuitive and (more importantly) TS-friendly GraphQL client for queries, mutations and subscriptions

**WARNING:** This package is still in development, and the API may change in the future.

**WARNING:** Turn on `strictNullChecks` in your `tsconfig.json` to get the best experience. Otherwise, graphql-intuitive-request will not be able to infer some nullable fields correctly, and would just infer them as non-nullable ones. However, it is not quite necessary, as graphql-intuitive-request will still work properly without `strictNullChecks`.

## Overview

graphql-intuitive-request provides an **intuitive** and **TS-friendly** way to write GraphQL queries, mutations and subscriptions(supports only graphql-ws) **without using string literals**, and provides **exact** return types inference.

### Example

```typescript
import { GraphQLIntuitiveClient } from 'graphql-intuitive-request';

const client = new GraphQLIntuitiveClient('https://example.com/graphql', {
  headers: {
    Authorization: `Bearer <your_jwt_token>`,
  },
});

class User {
  id: number;
  username: string;
  email: string | null;
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

/*
 * The type of `res` is inferred as
 * Array<{
 *   id: number;
 *   username: string;
 *   role: {
 *     name: string;
 *     permissions: Array<{ name: string }>
 *   }
 * }>
 */
const res = await client.query('users', {}, [User])({}, (user) => [
  user.id,
  user.username,
  user.role((role) => [
    role.name,
    role.permissions((permission) => [permission.name]),
  ]),
]);
```

As you can see, the return type of the query is inferred as `Array<{ id: number; username: string; role: { name: string; permissions: Array<{ name: string }> } }>`, which is **exactly** what we want, not just a generic object like `User[]`!

![Exact Type Inference with TypeScript](https://drive.google.com/uc?view=export&id=18joNiTtQSjnpGSBNkZSt18gZNnI59mOI)

So now when you access fields that are not requested in the query, TypeScript will throw an error at compile time!

![TypeScript Compile Time Type Check](https://drive.google.com/uc?export=view&id=1DZXPAVoJO6qEf3JFdezuYykARRscArts)

Also, now you get **intellisense** for the fields of the query, and you can **easily** add new fields to the query by making full use of TypeScript's type system! There's no need to use ESLint plugins to validate your GraphQL queries!

![TypeScript Intellisense Support](https://drive.google.com/uc?export=view&id=1q-2QpysTfanh_NeLIc5PXmv7vI0O9zLI)

### Features

- **Exact return types inference** for queries, mutations and subscriptions - if you query an entity with **specific** fields, then the return type will be an object with those fields, **not a generic object**
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
const user = await client.query(
  'currUser',
  {},
  User,
)({}, (user) => [user.id, user.name]);

// Query a list of entities.
const users = await client.query('users', {}, [User])({}, (user) => [
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
> const user = await client.query(
>   'currUser',
>   {},
>   User,
> )({}, (user) => [user.id, user.name]);
>
> // Query a list of entities.
> const users = await client.query('users', {}, [User])({}, (user) => [
>   user.id,
>   user.name,
> ]);
> ```
>
> Remember that you have to add `as const` to **nested queries** as well.
>
> ```typescript
> const users = await client.query('users', {}, [User])(
>   {},
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

### Query with variables

You can pass variables to the query by passing an object indicating the type of each variable and an object containing the actual values of the variables.

```typescript
import { Int } from 'graphql-intuitive-request';

const user = await client.query(
  'user',
  { id: Int },
  User,
)({ id: 1 }, (user) => [user.id, user.name]);
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
> const user = await client.query(
>   'user',
>   { id: Int } as const,
>   User,
> )({ id: 1 }, (user) => [user.id, user.name] as const);
> ```

### Work with types

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

const updatedRole = await client.mutation(
  'updateRole',
  queryParams,
  Role,
)(
  {
    id: 1,
    description: null,
    permissionNames: ['CREATE_USER'],
  },
  (role) => [role.id, role.name],
);
```

As is shown in the proceeding example, **mutations are also supported**.

Contrary to GraphQL itself, graphql-intuitive-request see all values as non-null by default instead of null for the sake of convenience. So instead of providing a `NonNull` function, graphql-intuitive-request provides a `Nullable` function to indicate a nullable field.

Another thing to note is that when you use a class to represent a type in variables, the name of the class must be the same as the name of the type in the GraphQL schema. For example, if you have a type named `User` in the GraphQL schema, you have to define a class named `User` in your code.

Also, you can see that we use a tuple with only one element to indicate a list of entities. This is a convenient syntax provided by our package. You can also use multi-layered tuples to indicate a multi-layered list of entities like `[[User]]` or even `Nullable([Nullable([[Nullable(User)]])])`.

**WARNING**: Currently, only variable types support complex multi-layer arrays of object type, and the return type only support complex multi-layer arrays of primitive types (string, number, boolean and GraphQLScalarType). For example, `Nullable([Nullable([[Nullable(String)]])])` is supported in return type, but `Nullable([Nullable([[Nullable(User)]])])` is not supported. Only `Nullable([Nullable(Object)])`, `[Nullable(Object)]`, `Nullable([Object])` and `[Object]` are supported in return type. As it is such a rare case when you need to return a complex multi-layer array of object type, and it is also quite difficult to query such a complex multi-layer array of object type even in a GraphQL query string, so we are not going to support it and there's no plan to support it in the future.

Actually, the exported `Int`, `Float`, and `ID` are just `GraphQLInt`, `GraphQLFloat`, and `GraphQLID` from `graphql` package, so you can also import them from the `graphql` package. You can also use `GraphQLString` and `GraphQLBoolean` from the `graphql` package to replace the built-in `String` and `Boolean` functions.

```typescript
import {
  GraphQLInt,
  GraphQLFloat,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
} from 'graphql';
```

All `GraphQLScalarType` objects from `graphql` package are also supported, so you can integrate graphql-intuitive-request with other GraphQL packages like `graphql-scalars`.

```typescript
import { GraphQLDateTime } from 'graphql-scalars';
```

Currently, however, graphql-intuitive-request does _not_ verify the validity of variable types, so even when you use a type like `GraphQLDateTime`, still no error will be thrown when the returned value is not a valid date-time string. Or when you use the type as a variable type, no error will be thrown when the variable is not a valid date-time string either. Actually, graphql-intuitive-request just extract the second generic type of `GraphQLScalarType` and use it as the type of the variable or the returned value.

**WARNING:** Although graphql-intuitive-request provide support for types classes exported from `graphql` for compatibility, so you can write something like `[new GraphQLList(GraphQLString)]`, and graphql-intuitive-request will infer the type of the type as `string[][]`, but this is not recommended, because these classes are not well-typed by generics, and it is likely that we cannot correctly infer the exact type. Also, as you can see, we get `string[][]` instead of `((string | null)[] | null)[]`, that is because in such case, graphql-intuitive-request still follow the rule that all values are non-null by default, and actually all `GraphQLNonNull` objects are ignored if you use them in the type. Why we choose to do so is because all `GraphQLType` extends `GraphQLNonNull` in TS, so it is impossible to distinguish between `GraphQLNonNull` and `GraphQLType` in TS. So we choose to ignore all `GraphQLNonNull` objects, and we think it is a good choice because it is more convenient to use.

### Easy encapsulation

You may have noticed that it could be quite easy to encapsulate a GraphQL query or mutation for reuse in graphql-intuitive-request.

For example, similar code like this may often be found in a project:

```typescript
import { Int } from 'graphql-intuitive-request';

class UpdateRoleInput {
  description: string | null;
  permissionNames: string[];
}

const updatedRole = await client.mutation(
  'updateRole',
  {
    id: Int,
    input: UpdateRoleInput,
  },
  Role,
)(
  {
    id: 1,
    input: {
      description: null,
      permissionNames: ['CREATE_USER'],
    },
  },
  (role) => [role.id, role.name],
);
```

It is annoying to write the same operation name and indicate the type of variables every time. It is also not a good practice as it violates the DRY principle, so it is better to encapsulate the GraphQL query or mutation in a function.

You can easily encapsulate the GraphQL query or mutation like this:

```typescript
const updateRole = client.mutation(
  'updateRole',
  { id: Int, input: UpdateRoleInput },
  Role,
);

const updatedRole = await updateRole(
  {
    id: 1,
    input: {
      description: null,
      permissionNames: ['CREATE_USER'],
    },
  },
  (role) => [role.id, role.name],
);
```

As is shown in the proceeding example, the only thing you need to do is just not calling the function generated by `client.query` or `client.mutation` immediately, but instead, just return the function generated by `client.query` or `client.mutation` and then call it later. It is quite useful to eliminate the duplication of the operation name and declarations of variables and return type.

### [New] Support for subscriptions

graphql-intuitive-request also supports GraphQL subscriptions. You can use `client.subscription` to create a subscription. The usage is similar to `client.query` and `client.mutation`.

Note that only subscriptions using `graphql-ws` protocol are supported. Due to the deprecated nature of `subscriptions-transport-ws`, we do not plan to support it in the future.

In order to connect to a `graphql-ws` subscription, you need to first use `client.withWebSocketClient` to attach a `graphql-ws` client to the graphql-intuitive-request client.

```typescript
import { GraphQLIntuitiveClient, Int } from 'graphql-intuitive-request';

const client = new GraphQLIntuitiveClient('https://example.com/graphql', {
  headers: {
    Authorization: `Bearer <your_jwt_token>`,
  },
}).withWebSocketClient({
  url: 'ws://example.com/graphql',
  connectionParams: {
    headers: {
      Authorization: `Bearer <your_jwt_token>`,
    },
  },
});
```

The parameters of `client.withWebSocketClient` are the same as the parameters of `createClient` function from `graphql-ws` package. You can refer to the [documentation of `graphql-ws`](https://github.com/enisdenjo/graphql-ws/blob/master/docs/interfaces/client.ClientOptions.md#url) for more details.

Then you can use `client.subscription` to create a subscription.

```typescript
const onCommentAddedSubscription = client.subscription(
  'commentAdded',
  {
    postId: Int,
  },
  Comment,
)({ postId: 1 }, (comment) => [comment.id, comment.content]);

const unsubscribe = onCommentAddedSubscription.subscribe((comment) => {
  console.log(comment.id, comment.content);
});

setTimeout(async () => {
  const addComment = client.mutation(
    'addComment',
    {
      postId: Int,
      content: String,
    },
    Comment,
  );
  await addComment({ postId: 1, content: 'Hello world!' });
  unsubscribe();
}, 1000);
```

_Note that you do not need to use `await` when creating a subscription or subscribe to a subscription._

Then you can see the following output in the console after 1 second:

```text
1 Hello world!
```

The `subscribe` method accepts three parameters:

- subscriber: Necessary. The subscriber function. It will be called when a new value is emitted by the subscription. It accepts one parameter, which is the value emitted by the subscription.
- onError: Optional. The error handler. It will be called when an error is emitted by the subscription. It accepts one parameter, which is the error emitted by the subscription.
- onComplete: Optional. The completion handler. It will be called when the subscription is completed. It accepts no parameter.

### Create object selector to eliminate duplication

It is annoying to repeat the same object selector every time when you want to select some fields of an object. graphql-intuitive-request provides a convenient way to eliminate the duplication of object selector.

For example, similar code like this may often be found in a project:

```typescript
const fetchUsers = client.query('users', {}, [User]);
const fetchCurrUser = client.query('currUser', {}, User);

const users = await fetchUsers({}, (user) => [
  user.id,
  user.name,
  user.roles((role) => [
    role.name,
    role.description,
    role.permissions((permission) => [permission.name]),
  ]),
]);

const currUser = await fetchCurrUser({}, (user) => [
  user.id,
  user.name,
  user.roles((role) => [
    role.name,
    role.description,
    role.permissions((permission) => [permission.name]),
  ]),
]);
```

Apparently, you don't want to repeat selecting the same fields of `Role` and `Permission` every time. You can easily eliminate the duplication of object selector like this:

```typescript
import { createObjectSelectorOn } from 'graphql-intuitive-request';

const coreRoleFields = createObjectSelectorOn(Role, (role) => [
  role.name,
  role.description,
  role.permissions((permission) => [permission.name]),
]);

const users = await fetchUsers({}, (user) => [
  user.id,
  user.name,
  user.roles(coreRoleFields),
]);

const currUser = await fetchCurrUser({}, (user) => [
  user.id,
  user.name,
  user.roles(coreRoleFields),
]);
```

### Get query string

It is possible to get the query string of a query or mutation using similar syntax as the one used to create a query or mutation.

```typescript
import { createQueryStringFor, Int } from 'graphql-intuitive-request';

const queryUserString = createQueryStringFor(
  'query',
  'user',
  { id: Int },
  User,
  (user) => [user.id, user.name],
);
```

Note that now you don't have to pass the actual values of variables to `createQueryStringFor`, also you can see that you don't need to call the function twice to get the query string, as it is often unnecessary to encapsulate the creation of a query string.

### Convert promise to query string and query request body

It is also possible to convert a GraphQLIntuitiveClient's queries, mutations and subscriptions to query strings and query request bodies.

For example, you can convert a query to query string like this:

```typescript
const queryString = client
  .query('users', {}, [User])({}, (user) => [user.id, user.name])
  .toQueryString();
```

The query string will be like this:

```graphql
query users {
  users {
    id
    name
  }
}
```

You can also convert a query to request body like this:

```typescript
const queryRequestBody = client
  .query(
    'user',
    { id: Int },
    User,
  )({ id: 1 }, (user) => [user.id, user.name])
  .toRequestBody();
```

The request body will be an object like this:

```javascript
{
  query: 'query user($id: Int!) {\n  user(id: $id) {\n    id\n    name\n  }\n}',
  variables: { id: 1 },
}
```

You should remember that we provide this functionality just for debugging purpose, so you should not use it in production. If you only want to get the query string, you should use `createQueryStringFor` instead.

### Work with graphql-request

graphql-intuitive-request is built on top of `graphql-request`, so you can use all the features of `graphql-request` with graphql-intuitive-request.

You can get the `GraphQLClient` instance from graphql-intuitive-request by calling the `getGraphQLClient()` method on the `GraphQLIntuitiveClient` instance.

```typescript
const graphQLIntuitiveClient = new GraphQLIntuitiveClient(
  'http://example.com/graphql',
);

const graphQLClient = graphQLIntuitiveClient.getRequestClient();
```

### Work with graphql-ws

The subscription feature of graphql-intuitive-request is built on top of `graphql-ws`, so you can use all the features of `graphql-ws` with graphql-intuitive-request.

You can get the client provided by graphql-ws by calling the `getWSClient()` method on the `GraphQLIntuitiveClient` instance.

```typescript
const graphQLIntuitiveClient = new GraphQLIntuitiveClient(
  'http://example.com/graphql',
).withWebSocketClient({
  url: 'ws://example.com/graphql',
});

const wsClient = graphQLIntuitiveClient.getWSClient();
```

## Future plans

Remember that these are just plans, and you cannot use them yet.

### Support for fragments

Currently, you can define something like fragments by using the `createObjectSelectorOn` function.

```typescript
import { createObjectSelectorOn } from 'graphql-intuitive-request';

const characterFields = createObjectSelectorOn(Character, (character) => [
  character.name,
  character.appearsIn,
]);

const hero = await client.query(
  'hero',
  { episode: Episode },
  Character,
)({ episode: 'JEDI' }, characterFields);
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

const hero = await client.query(
  'hero',
  { episode: Episode },
  Character,
)({ episode: 'JEDI' }, (hero) => [
  hero.$spread(characterFields),
  hero.friends((friend) => [friend.$spread(characterFields)]),
]);
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

const animals = await client.query('animals', {}, [Animal])({}, (animal) => [
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

const searchResult = await client.query(
  'search',
  { query: String },
  SearchResult,
)({ query: 'John' }, (searchResult) => [
  searchResult.$on(User, (user) => [user.id, user.name]),
  searchResult.$on(Post, (post) => [post.id, post.title]),
]);
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
const hero = await client.query(
  'hero',
  {
    episode: Nullable(Episode),
    withHeight: Boolean,
    skipFriends: Boolean,
  },
  Character,
)(
  { episode: 'JEDI', withHeight: true, skipFriends: false },
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

const books = await client.query('books', {}, [Book])({}, (book) => [
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
