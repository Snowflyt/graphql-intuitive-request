import { describe, expect, it } from 'vitest';

import { queryString } from '@/query-builder';
import { trimIndent } from '@/utils';

describe('queryString', () => {
  it('should build a query for object return type with variables', () => {
    const expectQuery = /* GraphQL */ `
      query user($id: ID!) {
        user(id: $id) {
          id
          username
        }
      }
    `;

    const query = queryString('user')
      .variables({ id: 'ID!' })
      .select<{ id: string; username: string }>((user) => [user.id, user.username])
      .build();
    expect(query).toBe(trimIndent(expectQuery));
  });

  it('should build a query for object return type without variables', () => {
    const expectQuery = /* GraphQL */ `
      query users {
        users {
          id
          username
        }
      }
    `;

    const query = queryString('users')
      .select<{ id: string; username: string }>((user) => [user.id, user.username])
      .build();
    expect(query).toBe(trimIndent(expectQuery));
  });

  it('should build a query for simple return type with variables', () => {
    const expectQuery = /* GraphQL */ `
      query removeUser($id: ID!) {
        removeUser(id: $id)
      }
    `;

    const query = queryString('removeUser').variables({ id: 'ID!' }).build();
    expect(query).toBe(trimIndent(expectQuery));
  });

  it('should build a query for simple return type without variables', () => {
    const expectQuery = /* GraphQL */ `
      query logout {
        logout
      }
    `;

    const query = queryString('logout').build();
    expect(query).toBe(trimIndent(expectQuery));
  });
});
