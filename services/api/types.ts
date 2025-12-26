/* eslint-disable @typescript-eslint/no-explicit-any */
export type ID = number;

export type BaseType<T extends Record<string, any>> = {
  id: ID;
  created_at: string;
  created_employee: string;
  updated_at?: string;
} & T;

export type PaginatedResType<T> = {
  data: T;
  total_count: number;
};

export type PrettyType<T> = T extends object
  ? { [key in keyof T]: T[key] extends object ? PrettyType<T[key]> : T[key] }
  : T;

export type SearchParams<T extends Partial<Record<string, any>>> = Promise<T>;

export type ReplaceType<BT, Replacements extends { [K in keyof BT]?: any }> = {
  [Key in keyof BT]: Key extends keyof Replacements
    ? Replacements[Key]
    : BT[Key];
};

type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? '_' : ''}${Lowercase<T>}${CamelToSnakeCase<U>}`
  : S;

export type SnakeCaseKeys<T> = {
  [K in keyof T as CamelToSnakeCase<string & K>]: T[K] extends object
    ? SnakeCaseKeys<T[K]>
    : T[K];
};

export type FILMORARevalidateParams = {
  path?: string;
  type?: 'page' | 'layout';
  tag?: string;
};
