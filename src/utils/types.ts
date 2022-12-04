export type KeysAsValues<T extends object> = {
  [K in keyof T]: K;
};

export type WrapValueWithTypeObject<T extends object> = {
  [K in keyof T]: {
    type: T[K];
  };
};

export type WrapValueWithPayloadObject<T extends object> = {
  [K in keyof T]: {
    payload: T[K];
  };
};

export type MergeObjects<T extends object, U extends object> = {
  [K in keyof T & keyof U]: T[K] & U[K];
};

export type UnionFromObject<
  T extends object,
  K extends keyof T = keyof T,
> = T[K];
