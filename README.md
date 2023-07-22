# graphql-intuitive-request

Intuitive and (more importantly) TS-friendly GraphQL client for queries, mutations and subscriptions

**Tips:** TypeScript 4 is no longer supported since version 0.0.2. Please upgrade to TypeScript 5.0 or above. If you are using TypeScript 4, you can still use version 0.0.1, but you have to add some `as const` to make it work properly. See [Documentation for version 0.0.1](https://github.com/Snowfly-T/graphql-intuitive-request/tree/version-0.0.1).

**WARNING:** This package is still in development, and the API may change in the future.

**WARNING:** Turn on `strictNullChecks` in your `tsconfig.json` to get the best experience. Otherwise, graphql-intuitive-request will not be able to infer some nullable fields correctly, and would just infer them as non-nullable ones.

## Overview

graphql-intuitive-request provides an **intuitive** and **TS-friendly** way to write GraphQL queries, mutations and subscriptions(supports only graphql-ws) **without using string literals**, and provides **exact** return types inference.

### Example

```typescript
import { createClient } from 'graphql-intuitive-request';

const { query } = createClient('https://example.com/graphql', {
  headers: {
    Authorization: `Bearer <your_jwt_token>`,
  },
}).registerTypes({
  User: {
    id: 'Int',
    username: 'String',
    email: 'String | Null',
    role: 'Role',
  },
  Role: {
    id: 'Int',
    name: 'String',
    permissions: 'Permission[]',
  },
  Permission: {
    id: 'Int',
    name: 'String',
  },

  Query: {
    users: [{}, 'User[]'],
  },
});

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
const res = await query('users').select((user) => [
  user.id,
  user.username,
  user.role((role) => [
    role.name,
    role.permissions((permission) => [permission.name]),
  ]),
]);
```

As you can see, the return type of the query is inferred as `Array<{ id: number; username: string; role: { name: string; permissions: Array<{ name: string }> } }>`, which is **exactly** what we want, not just a generic object like `User[]`!

![Exact Type Inference with TypeScript](https://drive.google.com/uc?view=export&id=1mEG-I-yoghUJkrV2W1zZCrAB6WXnhx3G)

The syntax is quite similar to that in TypeScript, but there are some differences:

- There are only 5 basic types: `String`, `Int`, `Float`, `Boolean` and `ID`, just like in GraphQL.
- `true` is replaced by `True` and `false` is replaced by `False`. They are actually interpreted as `Boolean` at runtime, but use them can help you take advantage of TypeScript's type system to ensure Typesafety.
- `null` is replaced by `Null`, to keep consistent with the naming convention of other types.
- Notice that compared with GraphQL, all types are non-null by default here, for the sake of convenience. If you want to indicate a nullable field, use something like 'Post | Null' is just fine.

The correctness of these types represented as strings is verified at compile time. For example, `Sting` will be recognized as an invalid type, and TypeScript will throw an error at compile time. Such magic is supported by [ArkType](https://arktype.io/), a powerful TypeScript type parser and validator.

So now when you access fields that are not requested in the query, TypeScript will throw an error at compile time!

![TypeScript Compile Time Type Check](https://drive.google.com/uc?export=view&id=1mb4uUAqbicziNbyMSvhVmpzxe5OmqHRX)

Also, now you get **intellisense** for the fields of the query, and you can **easily** add new fields to the query by making full use of TypeScript's type system! There's no need to use ESLint plugins to validate your GraphQL queries!

![TypeScript Intellisense Support](https://drive.google.com/uc?export=view&id=11xmupYt-tb-VhgdC_O5Q5R6uO7nB8Iau)

### Features

- **Exact return types inference** for queries, mutations and subscriptions - if you query an entity with **specific** fields, then the return type will be an object with those fields, **not a generic object**
- **Intuitive** API made full use of TypeScript's type system - **no need** to write GraphQL queries in **string**s and use ESLint plugins to validate them, everything just in TypeScript!
- built on top of `graphql-request`
- **More concise syntax** by using the cutting-edge **TypeScript 5** features - **no need** to write a lot of `as const` to indicate TypeScript to infer the type of the query as a **literal** type.

## Installation

```shell
$ npm install graphql-intuitive-request
```

...or any other package manager you like!

## Usage

`graphql-intuitive-client` is very smart and flexible, along with full TypeScript support, so you can use it in many ways. The following examples are just some common use cases.

```typescript
const { query, mutation } = createClient(
  'https://example.com/graphql',
).registerTypes({
  ...,
  Query: {
    user: [{ id: 'Int' }, 'User'],
    users: [{}, 'User[]'],
    ...
  },
  Mutation: {
    login: [{ input: 'LoginInput' }, 'LoginOutput'],
    logout: [{}, 'Boolean'],
    removeUser: [{ id: 'Int' }, 'Boolean'],
    ...
  },
});

// The normal way to execute operations
const user = await query('user') // user :: { id: number; name: string; }
  .select((user) => [user.id, user.name])
  .by({ id: 1 });
// Abbreviated syntax when the count of non-optional variables is 1
// Here, the only non-optional variable is `id`, so we can use `byId` instead of `byId`
// In other cases, it may be `byUsername`, `byInput`, `byOptions`, etc.
const user = await query('user') // user :: { id: number; name: string; }
  .select((user) => [user.id, user.name])
  .byId(1);
// You can omit `select` if you want to select all fields (it would also select nested ones recursively)
const user = await query('user').byId(1); // user :: User
// The same is to `users`, you can see that it does not accept any variables, so there's no `by` method
const users = await query('users').select((user) => [user.id, user.name]); // users :: Array<{ id: number; name: string; }>
// Similarly, you can omit `select` if you want to select all fields
const users = await query('users'); // users :: User[]
// What about queries or mutations that do not return an object? As you can see, now there's no `select` method
const isUserRemoved = await mutation('removeUser').byId(1); // isUserRemoved :: boolean
const isLoggedOut = await mutation('logout'); // isLoggedOutSuccess :: boolean

// Subscriptions are also supported, but only subscriptions using `graphql-ws` protocol are supported
const { mutation, subscription } = createClient('https://example.com/graphql')
  .withWebSocketClient({ url: 'ws://example.com/graphql' });
  .registerTypes({
    ...,
    Subscription: {
      commentAdded: [{ postId: 'Int' }, 'Comment'],
    },
  });

const onCommentAddedSubscription = subscription('commentAdded')
  .select((comment) => [comment.id, comment.content])
  .byPostId(1);
const unsubscribe = onCommentAddedSubscription.subscribe((comment) => {
  console.log(comment.id, comment.content);
});
setTimeout(async () => {
  await mutation('addComment').by({ postId: 1, content: 'Hello world!' });
  unsubscribe();
}, 1000);
```

For more details, you can check [the relevant test file](./test/client.test.ts).

### [New] Support for subscriptions

graphql-intuitive-request also supports GraphQL subscriptions. You can use `client.subscription` to create a subscription. The usage is similar to `client.query` and `client.mutation`.

Note that only subscriptions using `graphql-ws` protocol are supported. Due to the deprecated nature of `subscriptions-transport-ws`, we do not plan to support it in the future.

In order to connect to a `graphql-ws` subscription, you need to first use `client.withWebSocketClient` to attach a `graphql-ws` client to the graphql-intuitive-request client.

```typescript
import { createClient } from 'graphql-intuitive-request';

const { mutation, subscription } = createClient('https://example.com/graphql', {
  headers: {
    Authorization: `Bearer <your_jwt_token>`,
  },
})
  .withWebSocketClient({
    url: 'ws://example.com/graphql',
    connectionParams: {
      headers: {
        Authorization: `Bearer <your_jwt_token>`,
      },
    },
  })
  .registerTypes(...);
```

The parameters of `createClient().withWebSocketClient` are the same as the parameters of `createClient` function from `graphql-ws` package. You can refer to the [documentation of `graphql-ws`](https://github.com/enisdenjo/graphql-ws/blob/master/docs/interfaces/client.ClientOptions.md#url) for more details.

Then you can use `client.subscription` to create a subscription.

```typescript
const onCommentAddedSubscription = subscription('commentAdded')
  .select((comment) => [comment.id, comment.content])
  .byPostId(1);

const unsubscribe = onCommentAddedSubscription.subscribe((comment) => {
  console.log(comment.id, comment.content);
});

setTimeout(async () => {
  await mutation('addComment').by({ postId: 1, content: 'Hello world!' });
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
const users = await query('users').select((user) => [
  user.id,
  user.name,
  user.roles((role) => [
    role.name,
    role.description,
    role.permissions((permission) => [permission.name]),
  ]),
]);

const currentUser = await query('currentUser').select((user) => [
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
import { objectSelector } from 'graphql-intuitive-request';

const coreRoleFields = objectSelector<Role>().select((role) => [
  role.name,
  role.description,
  role.permissions((permission) => [permission.name]),
]);

const users = await query('users').select((user) => [
  user.id,
  user.name,
  user.roles(coreRoleFields),
]);

const currentUser = await query('currentUser').select((user) => [
  user.id,
  user.name,
  user.roles(coreRoleFields),
]);
```

### Get query string

It is possible to get the query string of a query or mutation using similar syntax as the one used to create a query or mutation.

```typescript
import { queryString, mutationString, ... } from 'graphql-intuitive-request';

const queryUserString = queryString('user')
  .variables({ id: 'ID!' })
  .select<User>((user) => [user.id, user.name])
  .build();
```

Note that this time we use GraphQL types instead of the types used in `registerTypes` function. This is because we are unable to infer the types of the variables and the return type of the query or mutation, so we have to use GraphQL types instead.

Also, we pass a generic parameter to the `select` method to indicate the return type of the query, mutation or subscription.

### Convert promise to query string and query request body

It is also possible to convert a client's queries, mutations and subscriptions to query strings and query request bodies.

For example, you can convert a query to query string like this:

```typescript
const queryString = query('users')
  .select((user) => [user.id, user.name])
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
const queryRequestBody = query('user')
  .select((user) => [user.id, user.name])
  .byId(1)
  .toRequestBody();
```

The request body will be an object like this:

```javascript
{
  query: 'query user($id: Int!) {\n  user(id: $id) {\n    id\n    name\n  }\n}',
  variables: { id: 1 },
}
```

You should remember that we provide this functionality just for debugging purpose, so you should not use it in production. If you only want to get the query string, you should use `queryString`, `mutationString` or `subscriptionString` instead.

### Work with graphql-request

graphql-intuitive-request is built on top of `graphql-request`, so you can use all the features of `graphql-request` with graphql-intuitive-request.

You can get the `GraphQLClient` instance from graphql-intuitive-request by calling the `getGraphQLClient()` method on the `GraphQLIntuitiveClient` instance.

```typescript
const client = createClient('http://example.com/graphql');
const graphQLClient = graphQLIntuitiveClient.getRequestClient();
```

### Work with graphql-ws

The subscription feature of graphql-intuitive-request is built on top of `graphql-ws`, so you can use all the features of `graphql-ws` with graphql-intuitive-request.

You can get the client provided by graphql-ws by calling the `getWSClient()` method on the `GraphQLIntuitiveClient` instance.

```typescript
const client = createClient('http://example.com/graphql').withWebSocketClient({
  url: 'ws://example.com/graphql',
});
const wsClient = client.getWSClient();
```

## Future plans

Remember that these are just plans, and you cannot use them yet.

### Support for fragments

Currently, you can define something like fragments by using the `objectSelector` function.

```typescript
import { objectSelector } from 'graphql-intuitive-request';

const characterFields = objectSelector<Character>().select((character) => [
  character.name,
  character.appearsIn,
]);

const hero = await query('hero').select(characterFields).byEpisode('JEDI');
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
import { fragment } from 'graphql-intuitive-request';

const characterFields = fragment<Character>().select((character) => [
  character.name,
  character.appearsIn,
]);

const hero = query('hero')
  .select((hero) => [
    hero.$spread(characterFields),
    hero.friends((friend) => [friend.$spread(characterFields)]),
  ])
  .byEpisode('JEDI');
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

const dogFields = fragment<Dog>().select((dog) => [dog.name, dog.breed]);
const catFields = fragment<Cat>().select((cat) => [cat.name, cat.color]);

const animals = await query('animals').select((animal) => [
  animal.$on('Dog', (dog) => [dog.$spread(dogFields)]),
  animal.$on('Cat', (cat) => [cat.$spread(catFields)]),
]);
```

For the `$on()` method, it is likely that only subclasses of the base class will be supported.

### Support for unions

GraphQL unions are not supported yet, but they may be supported in the future.

Some planning APIs may have look like this:

```typescript
import { union } from 'graphql-intuitive-request';

const SearchResult = union('SearchResult', 'User | Post');

const searchResult = await query('search')
  .select((searchResult) => [
    searchResult.$on('User', (user) => [user.id, user.name]),
    searchResult.$on('Post', (post) => [post.id, post.title]),
  ])
  .byQuery('John');
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
const hero = await query('hero')
  .select((hero, variables) => [
    hero.name,
    hero.height.include$({
      if: variables.withHeight,
    }),
    hero
      .friends((friend) => [friend.name])
      .skip$({
        if: variables.skipFriends,
      }),
  ])
  .by({ episode: 'JEDI', withHeight: true, skipFriends: false });
```

However, now typescript cannot determine whether `height` and `friends` are `undefined` or not by the type of `variables` (It is technically possible, but we have to add the `const` modifier to the `variables` parameter, and then you cannot pass a dynamic object to the `variables` parameter any more. However, in real-world applications, the variables are usually dynamic objects, so we cannot do this). So, you have to handle the case yourself.

Custom directives may also be supported.

```typescript
const { query } = createClient('http://example.com/graphql', {
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

const books = await query('books').select((book) => [
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
