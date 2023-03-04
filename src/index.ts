import { GraphQLClient } from 'graphql-request';
import type { Merge, Processed, Type } from './common';
import type {
  ArrayBooleanQueryNode,
  ArrayNullableBooleanQueryNode,
  ArrayNullableNumberQueryNode,
  ArrayNullableObjectQueryNode,
  ArrayNullableStringQueryNode,
  ArrayNumberQueryNode,
  ArrayObjectQueryNode,
  ArrayStringQueryNode,
  BooleanQueryNode,
  NullableArrayBooleanQueryNode,
  NullableArrayNullableBooleanQueryNode,
  NullableArrayNullableNumberQueryNode,
  NullableArrayNullableObjectQueryNode,
  NullableArrayNullableStringQueryNode,
  NullableArrayNumberQueryNode,
  NullableArrayObjectQueryNode,
  NullableArrayStringQueryNode,
  NullableBooleanQueryNode,
  NullableNumberQueryNode,
  NullableObjectQueryNode,
  NullableStringQueryNode,
  NumberQueryNode,
  ObjectQueryNode,
  QueryNode,
  StringQueryNode
} from './query-nodes';

export type QueryBuilder<T> = {
  [P in keyof T]: T[P] extends string
    ? StringQueryNode<P>
    : T[P] extends string | null
    ? NullableStringQueryNode<P>
    : T[P] extends string[]
    ? ArrayStringQueryNode<P>
    : T[P] extends Array<string | null>
    ? ArrayNullableStringQueryNode<P>
    : T[P] extends string[] | null
    ? NullableArrayStringQueryNode<P>
    : T[P] extends Array<string | null> | null
    ? NullableArrayNullableStringQueryNode<P>
    : T[P] extends number
    ? NumberQueryNode<P>
    : T[P] extends number | null
    ? NullableNumberQueryNode<P>
    : T[P] extends number[]
    ? ArrayNumberQueryNode<P>
    : T[P] extends Array<number | null>
    ? ArrayNullableNumberQueryNode<P>
    : T[P] extends number[] | null
    ? NullableArrayNumberQueryNode<P>
    : T[P] extends Array<number | null> | null
    ? NullableArrayNullableNumberQueryNode<P>
    : T[P] extends boolean
    ? BooleanQueryNode<P>
    : T[P] extends boolean | null
    ? NullableBooleanQueryNode<P>
    : T[P] extends boolean[]
    ? ArrayBooleanQueryNode<P>
    : T[P] extends Array<boolean | null>
    ? ArrayNullableBooleanQueryNode<P>
    : T[P] extends boolean[] | null
    ? NullableArrayBooleanQueryNode<P>
    : T[P] extends Array<boolean | null> | null
    ? NullableArrayNullableBooleanQueryNode<P>
    : T[P] extends Array<infer U extends object>
    ? <const R extends readonly QueryNode[]>(
        selector: Selector<U, R>,
      ) => ArrayObjectQueryNode<P, R>
    : T[P] extends Array<infer U extends object | null>
    ? <const R extends readonly QueryNode[]>(
        selector: Selector<U, R>,
      ) => ArrayNullableObjectQueryNode<P, R>
    : T[P] extends Array<infer U extends object> | null
    ? <const R extends readonly QueryNode[]>(
        selector: Selector<U, R>,
      ) => NullableArrayObjectQueryNode<P, R>
    : T[P] extends Array<infer U extends object | null> | null
    ? <const R extends readonly QueryNode[]>(
        selector: Selector<U, R>,
      ) => NullableArrayNullableObjectQueryNode<P, R>
    : T[P] extends object
    ? <const R extends readonly QueryNode[]>(
        selector: Selector<T[P], R>,
      ) => ObjectQueryNode<P, R>
    : T[P] extends object | null
    ? <const R extends readonly QueryNode[]>(
        selector: Selector<T[P], R>,
      ) => NullableObjectQueryNode<P, R>
    : never;
};

export type ParseAst<T> = T extends readonly [infer H, ...infer TT]
  ? H extends StringQueryNode<infer K>
    ? Merge<{ [P in K]: string }, ParseAst<TT>>
    : H extends NullableStringQueryNode<infer K>
    ? Merge<{ [P in K]: string | null }, ParseAst<TT>>
    : H extends ArrayStringQueryNode<infer K>
    ? Merge<{ [P in K]: string[] }, ParseAst<TT>>
    : H extends ArrayNullableStringQueryNode<infer K>
    ? Merge<{ [P in K]: Array<string | null> }, ParseAst<TT>>
    : H extends NullableArrayStringQueryNode<infer K>
    ? Merge<{ [P in K]: string[] | null }, ParseAst<TT>>
    : H extends NullableArrayNullableStringQueryNode<infer K>
    ? Merge<{ [P in K]: Array<string | null> | null }, ParseAst<TT>>
    : H extends NumberQueryNode<infer K>
    ? Merge<{ [P in K]: number }, ParseAst<TT>>
    : H extends NullableNumberQueryNode<infer K>
    ? Merge<{ [P in K]: number | null }, ParseAst<TT>>
    : H extends ArrayNumberQueryNode<infer K>
    ? Merge<{ [P in K]: number[] }, ParseAst<TT>>
    : H extends ArrayNullableNumberQueryNode<infer K>
    ? Merge<{ [P in K]: Array<number | null> }, ParseAst<TT>>
    : H extends NullableArrayNumberQueryNode<infer K>
    ? Merge<{ [P in K]: number[] | null }, ParseAst<TT>>
    : H extends NullableArrayNullableNumberQueryNode<infer K>
    ? Merge<{ [P in K]: Array<number | null> | null }, ParseAst<TT>>
    : H extends BooleanQueryNode<infer K>
    ? Merge<{ [P in K]: boolean }, ParseAst<TT>>
    : H extends NullableBooleanQueryNode<infer K>
    ? Merge<{ [P in K]: boolean | null }, ParseAst<TT>>
    : H extends ArrayBooleanQueryNode<infer K>
    ? Merge<{ [P in K]: boolean[] }, ParseAst<TT>>
    : H extends ArrayNullableBooleanQueryNode<infer K>
    ? Merge<{ [P in K]: Array<boolean | null> }, ParseAst<TT>>
    : H extends NullableArrayBooleanQueryNode<infer K>
    ? Merge<{ [P in K]: boolean[] | null }, ParseAst<TT>>
    : H extends NullableArrayNullableBooleanQueryNode<infer K>
    ? Merge<{ [P in K]: Array<boolean | null> | null }, ParseAst<TT>>
    : H extends ArrayObjectQueryNode<infer K, infer R>
    ? Merge<{ [P in K]: Array<ParseAst<R>> }, ParseAst<TT>>
    : H extends ArrayNullableObjectQueryNode<infer K, infer R>
    ? Merge<{ [P in K]: Array<ParseAst<R> | null> }, ParseAst<TT>>
    : H extends NullableArrayObjectQueryNode<infer K, infer R>
    ? Merge<{ [P in K]: Array<ParseAst<R>> | null }, ParseAst<TT>>
    : H extends NullableArrayNullableObjectQueryNode<infer K, infer R>
    ? Merge<{ [P in K]: Array<ParseAst<R> | null> | null }, ParseAst<TT>>
    : H extends ObjectQueryNode<infer K, infer R>
    ? Merge<{ [P in K]: ParseAst<R> }, ParseAst<TT>>
    : H extends NullableObjectQueryNode<infer K, infer R>
    ? Merge<{ [P in K]: ParseAst<R> | null }, ParseAst<TT>>
    : never
  : unknown;

export type Selector<T, R> = (builder: QueryBuilder<T>) => R;

export const ID = Symbol('ID');
export const Int = Symbol('Int');
export const Float = Symbol('Float');

type NullableType<T> = T & { nullable: true };

export const Nullable = <T>(type: T): NullableType<T> => {
  (type as NullableType<T>).nullable = true;
  return type as NullableType<T>;
};

export type GraphQLPrimitiveType =
  | typeof String
  | typeof Int
  | typeof Float
  | typeof Boolean
  | typeof ID;

export type GraphQLType =
  | GraphQLPrimitiveType
  | NullableType<GraphQLPrimitiveType>
  | [GraphQLPrimitiveType]
  | [NullableType<GraphQLPrimitiveType>]
  | NullableType<[NullableType<GraphQLPrimitiveType>]>
  | Type<unknown>
  | NullableType<Type<unknown>>
  | [Type<unknown>]
  | [NullableType<Type<unknown>>]
  | NullableType<[NullableType<Type<unknown>>]>;

const getBuilder = <T>(): QueryBuilder<T> => {
  return new Proxy(
    {},
    {
      get: (_, prop) => {
        const result = ((selector: any) => {
          result.children = selector(getBuilder());
          return result;
        }) as any;
        result.key = prop;
        result.children = null;
        return result;
      },
    },
  ) as any;
};

export class GraphQLIntuitiveClient {
  private readonly client: GraphQLClient;

  constructor(endpoint: string, headers?: Record<string, string>) {
    this.client = new GraphQLClient(endpoint, { headers });
  }

  query<T, const U extends Record<string, GraphQLType>>(
    clazz: Type<T>,
    variablesType?: U,
  ): <const R extends readonly QueryNode[]>(
    actionName: string,
    selector: Selector<T, R>,
    variables?: { [P in keyof U]: Processed<U[P]> },
  ) => Promise<ParseAst<R>>;
  query<T, const U extends Record<string, GraphQLType>>(
    clazz: [Type<T>],
    variablesType?: U,
  ): <const R extends readonly QueryNode[]>(
    actionName: string,
    selector: Selector<T, R>,
    variables?: { [P in keyof U]: Processed<U[P]> },
  ) => Promise<Array<ParseAst<R>>>;
  query<T, const U extends Record<string, GraphQLType>>(
    clazz: Type<T> | [Type<T>],
    variablesType: U = {} as any,
  ) {
    return async <const R extends readonly QueryNode[]>(
      actionName: string,
      selector: Selector<T, R>,
      variables: { [P in keyof U]: Processed<U[P]> } = {} as any,
    ) => {
      const ast = selector(getBuilder()) as readonly QueryNode[];
      const query = this.buildQueryString(
        'query',
        actionName,
        variablesType,
        variables,
        ast,
      );
      const result = (await this.client.request(
        query,
        variables as any,
      )) as any;
      return result[actionName];
    };
  }

  mutation<T, const U extends Record<string, GraphQLType>>(
    clazz: Type<T>,
    variablesType?: U,
  ): <const R extends readonly QueryNode[]>(
    actionName: string,
    selector: Selector<T, R>,
    variables?: { [P in keyof U]: Processed<U[P]> },
  ) => Promise<ParseAst<R>>;
  mutation<T, const U extends Record<string, GraphQLType>>(
    clazz: [Type<T>],
    variablesType?: U,
  ): <const R extends readonly QueryNode[]>(
    actionName: string,
    selector: Selector<T, R>,
    variables?: { [P in keyof U]: Processed<U[P]> },
  ) => Promise<Array<ParseAst<R>>>;
  mutation<T, const U extends Record<string, GraphQLType>>(
    clazz: Type<T> | [Type<T>],
    variablesType: U = {} as any,
  ) {
    return async <const R extends readonly QueryNode[]>(
      actionName: string,
      selector: Selector<T, R>,
      variables: { [P in keyof U]: Processed<U[P]> } = {} as any,
    ) => {
      const ast = selector(getBuilder()) as readonly QueryNode[];
      const query = this.buildQueryString(
        'mutation',
        actionName,
        variablesType,
        variables,
        ast,
      );
      const result = (await this.client.request(
        query,
        variables as any,
      )) as any;
      return result[actionName];
    };
  }

  private processNullableVariable(variable: GraphQLType, typeString: string) {
    return (variable as NullableType<GraphQLType>).nullable
      ? `${typeString}`
      : `${typeString}!`;
  }

  private getVariableTypeString(variable: GraphQLType): string {
    if (variable instanceof Array) {
      return this.processNullableVariable(
        variable,
        `[${this.getVariableTypeString(variable[0])}]`,
      );
    } else if (variable === String) {
      return this.processNullableVariable(variable, 'String');
    } else if (variable === Int) {
      return this.processNullableVariable(variable, 'Int');
    } else if (variable === Float) {
      return this.processNullableVariable(variable, 'Float');
    } else if (variable === Boolean) {
      return this.processNullableVariable(variable, 'Boolean');
    } else if (variable === ID) {
      return this.processNullableVariable(variable, 'ID');
    } else {
      return this.processNullableVariable(variable, variable.constructor.name);
    }
  }

  private buildQueryString<VT extends object>(
    actionType: 'query' | 'mutation',
    actionName: string,
    variablesType: VT,
    variables: { [P in keyof VT]: Processed<VT[P]> },
    ast: readonly QueryNode[],
  ) {
    const query = `${actionType} ${actionName}${
      Object.keys(variablesType).length > 0
        ? `(${Object.entries(variablesType)
            .map(
              ([key, value]) => `$${key}: ${this.getVariableTypeString(value)}`,
            )
            .join(', ')})`
        : ''
    } {
      ${actionName}${
      Object.keys(variables).length > 0
        ? `(${Object.keys(variables)
            .map((key) => `${key}: $${key}`)
            .join(', ')})`
        : ''
    } ${this.buildQueryAst(ast)}
    }`;
    return query;
  }

  private buildQueryAst(ast: readonly QueryNode[]): string {
    return `{
      ${ast
        .map((node) =>
          node.children !== null
            ? `${node.key} ${this.buildQueryAst(node.children as QueryNode[])}`
            : node.key,
        )
        .join(' ')}
    }`;
  }
}
