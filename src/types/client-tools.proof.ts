import { describe, equal, expect, it } from 'typroof';

import type { AbbreviatedByMixin } from './client-tools';
import type { BaseEnvironment } from './graphql-types';

describe('AbbreviatedByMixin', () => {
  type _AbbreviatedByMixin<TInputDef> = AbbreviatedByMixin<TInputDef, BaseEnvironment, string>;

  it('should not mixin when required fields count >= 2', () => {
    expect<_AbbreviatedByMixin<{ id: 'String!'; name: 'String!' }>>().to(equal<{}>);
    expect<_AbbreviatedByMixin<{ id: 'String!'; name: 'String!'; age: 'Int' }>>().to(equal<{}>);
  });

  it('should mixin abbreviated syntax for the only required field when required fields count = 1', () => {
    expect<_AbbreviatedByMixin<{ id: 'String!' }>>().to(equal<{ byId: (id: string) => string }>);
    expect<_AbbreviatedByMixin<{ id: 'String'; age: 'Int!' }>>().to(
      equal<{ byAge: (age: number) => string }>,
    );
    expect<_AbbreviatedByMixin<{ id: 'String!'; name: 'String'; age?: 'Int!' }>>().to(
      equal<{ byId: (id: string) => string }>,
    );
  });

  it('should mixin abbreviated syntax for all required fields when required fields count = 0', () => {
    expect<_AbbreviatedByMixin<{ id: 'String' }>>().to(equal<{ byId: (id: string) => string }>);
    expect<_AbbreviatedByMixin<{ id: 'String'; name: 'String' }>>().to(
      equal<{ byId: (id: string) => string; byName: (name: string) => string }>,
    );
    expect<_AbbreviatedByMixin<{ id: 'String'; name: 'String'; age?: 'Int' }>>().to(
      equal<{
        byId: (id: string) => string;
        byName: (name: string) => string;
        byAge: (age: number) => string;
      }>,
    );
  });
});
