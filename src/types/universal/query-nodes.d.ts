export type QueryNode<
  K extends string | symbol | number = string,
  T = unknown,
> =
  | StringQueryNode<K>
  | NullableStringQueryNode<K>
  | ArrayStringQueryNode<K>
  | ArrayNullableStringQueryNode<K>
  | NullableArrayStringQueryNode<K>
  | NullableArrayNullableStringQueryNode<K>
  | NumberQueryNode<K>
  | NullableNumberQueryNode<K>
  | ArrayNumberQueryNode<K>
  | ArrayNullableNumberQueryNode<K>
  | NullableArrayNumberQueryNode<K>
  | NullableArrayNullableNumberQueryNode<K>
  | BooleanQueryNode<K>
  | NullableBooleanQueryNode<K>
  | ArrayBooleanQueryNode<K>
  | ArrayNullableBooleanQueryNode<K>
  | NullableArrayBooleanQueryNode<K>
  | NullableArrayNullableBooleanQueryNode<K>
  | ObjectQueryNode<K, T>
  | NullableObjectQueryNode<K, T>
  | ArrayObjectQueryNode<K, T>
  | ArrayNullableObjectQueryNode<K, T>
  | NullableArrayObjectQueryNode<K, T>
  | NullableArrayNullableObjectQueryNode<K, T>;

export interface StringQueryNode<K extends string | symbol | number> {
  key: K;
  type: 'string';
  children: null;
}

export interface NullableStringQueryNode<K extends string | symbol | number> {
  key: K;
  type: 'nullable-string';
  children: null;
}

export interface ArrayStringQueryNode<K extends string | symbol | number> {
  key: K;
  type: 'array-string';
  children: null;
}

export interface ArrayNullableStringQueryNode<
  K extends string | symbol | number,
> {
  key: K;
  type: 'array-nullable-string';
  children: null;
}

export interface NullableArrayStringQueryNode<
  K extends string | symbol | number,
> {
  key: K;
  type: 'nullable-array-string';
  children: null;
}

export interface NullableArrayNullableStringQueryNode<
  K extends string | symbol | number,
> {
  key: K;
  type: 'nullable-array-nullable-string';
  children: null;
}

export interface NumberQueryNode<K extends string | symbol | number> {
  key: K;
  type: 'number';
  children: null;
}

export interface NullableNumberQueryNode<K extends string | symbol | number> {
  key: K;
  type: 'nullable-number';
  children: null;
}

export interface ArrayNumberQueryNode<K extends string | symbol | number> {
  key: K;
  type: 'array-number';
  children: null;
}

export interface ArrayNullableNumberQueryNode<
  K extends string | symbol | number,
> {
  key: K;
  type: 'array-nullable-number';
  children: null;
}

export interface NullableArrayNumberQueryNode<
  K extends string | symbol | number,
> {
  key: K;
  type: 'nullable-array-number';
  children: null;
}

export interface NullableArrayNullableNumberQueryNode<
  K extends string | symbol | number,
> {
  key: K;
  type: 'nullable-array-nullable-number';
  children: null;
}

export interface BooleanQueryNode<K extends string | symbol | number> {
  key: K;
  type: 'boolean';
  children: null;
}

export interface NullableBooleanQueryNode<K extends string | symbol | number> {
  key: K;
  type: 'nullable-boolean';
  children: null;
}

export interface ArrayBooleanQueryNode<K extends string | symbol | number> {
  key: K;
  type: 'array-boolean';
  children: null;
}

export interface ArrayNullableBooleanQueryNode<
  K extends string | symbol | number,
> {
  key: K;
  type: 'array-nullable-boolean';
  children: null;
}

export interface NullableArrayBooleanQueryNode<
  K extends string | symbol | number,
> {
  key: K;
  type: 'nullable-array-boolean';
  children: null;
}

export interface NullableArrayNullableBooleanQueryNode<
  K extends string | symbol | number,
> {
  key: K;
  type: 'nullable-array-nullable-boolean';
  children: null;
}

export interface ObjectQueryNode<K extends string | symbol | number, C> {
  key: K;
  type: 'object';
  children: C;
}

export interface NullableObjectQueryNode<
  K extends string | symbol | number,
  C,
> {
  key: K;
  type: 'nullable-object';
  children: C;
}

export interface ArrayObjectQueryNode<K extends string | symbol | number, C> {
  key: K;
  type: 'array-object';
  children: C;
}

export interface ArrayNullableObjectQueryNode<
  K extends string | symbol | number,
  C,
> {
  key: K;
  type: 'array-nullable-object';
  children: C;
}

export interface NullableArrayObjectQueryNode<
  K extends string | symbol | number,
  C,
> {
  key: K;
  type: 'nullable-array-object';
  children: C;
}

export interface NullableArrayNullableObjectQueryNode<
  K extends string | symbol | number,
  C,
> {
  key: K;
  type: 'nullable-array-nullable-object';
  children: C;
}
