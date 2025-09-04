import { Condition, QueryOptions, RootQuerySelector } from 'mongoose';

export type FindPayloadType<Model> = {
  filter?: FilterQuery<Model>;
  options?: QueryOptions;
  ref?: any;
  where?: Record<string, any>;
  sort?: Record<string, 1 | -1>;
  projection?: Record<string, 1 | 0>;
};

type FilterQuery<T> = {
  [P in keyof T]?: Condition<T[P]>;
} & RootQuerySelector<T> & { _id?: Condition<string> };
