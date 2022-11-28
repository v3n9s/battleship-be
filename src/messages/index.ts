import {
  KeysAsValues,
  MergeObjects,
  UnionFromObject,
  WrapValueWithTypeObject,
} from '../utils/types';
import { ClientMessages, ClientMessageValidatonFuncs } from './client';
import { ServerMessages } from './server';

export const ServerMessageTypes = {
  Error: 'Error',
  SetToken: 'SetToken',
} as const satisfies KeysAsValues<ServerMessages>;

export type ServerMessage = UnionFromObject<
  MergeObjects<
    ServerMessages,
    WrapValueWithTypeObject<typeof ServerMessageTypes>
  >
>;

export const ClientMessageTypes = {
  ShowToken: 'ShowToken',
} as const satisfies KeysAsValues<ClientMessages>;

export type ClientMessage = UnionFromObject<
  MergeObjects<
    ClientMessages,
    WrapValueWithTypeObject<typeof ClientMessageTypes>
  >
>;

export const isExistingClientMessage = (
  message: unknown,
): message is {
  type: keyof typeof ClientMessageTypes;
} => {
  if (
    !(
      message &&
      typeof message === 'object' &&
      'type' in message &&
      typeof message.type === 'string'
    )
  ) {
    return false;
  }
  const type =
    ClientMessageTypes[message.type as keyof typeof ClientMessageTypes];
  if (!type) return false;
  return true;
};

export const isValidClientMessage = (message: {
  type: keyof typeof ClientMessageTypes;
}): message is ClientMessage => {
  return ClientMessageValidatonFuncs[message.type](message);
};

export * from './server';
export * from './client';
