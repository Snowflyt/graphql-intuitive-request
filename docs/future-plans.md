# Future plans

These are just plans to be implemented in the future. They are not implemented yet, so you cannot use them now.

## Support for fragments

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

## Support for unions

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

## Support for directives

graphql-intuitive-request currently does not support directives. In the future, you may be able use directives.

For example, for graphql queries like this:

```graphql
query Hero($episode: Episode, $withHeight: Boolean!, $withFriends: Boolean!) {
  hero(episode: $episode) {
    name
    height @include(if: $withHeight)
    friends @skip(if: $skipFriends) {
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
    hero.height.include$({ if: variables.withHeight }),
    hero.friends((friend) => [friend.name]).skip$({ if: variables.skipFriends }),
  ])
  .by({ episode: 'JEDI', withHeight: true, skipFriends: false });
```

However, now typescript cannot determine whether `height` and `friends` are `undefined` or not by the type of `variables` (It is technically possible, but we have to add the `const` modifier to the `variables` parameter, and then you cannot pass a dynamic object to the `variables` parameter any more. However, in real-world applications, the variables are usually dynamic objects, so we cannot do this). So, you have to handle the case yourself.

Custom directives may also be supported.

```typescript
const { query } = createClient('http://example.com/graphql').withSchema({
  directives: {
    currency: {
      type: 'query',
      args: {
        currency: 'String!',
      },
      resolve: (type) => type,
    },
  },
});

const books = await query('books').select((book) => [
  book.title,
  book.price.currency$({ currency: 'USD' }),
]);
```

As you can see, you can use the `resolve` option to indicate how the directive affects the return type of the field. For example, the definition of `@include` is like this:

```typescript
const includeDirective = {
  type: 'query',
  args: {
    if: 'Boolean',
  },
  resolve: (type) => type.nullable(),
};
```
