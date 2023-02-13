export type ObjectToUnion<T extends object> = T[keyof T];

export type MessagesObjectToUnion<T extends object> = ObjectToUnion<{
  [K in keyof T]: T[K] extends undefined
    ? { type: K }
    : { type: K; payload: T[K] };
}>;
