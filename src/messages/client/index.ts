import { JSONSchemaType, ValidateFunction } from 'ajv';
import { ajv } from '../../ajv-instance';
import {
  KeysAsValues,
  MergeObjects,
  UnionFromObject,
  WrapValueWithTypeObject,
} from '../../utils/types';
import { CreateRoomMessage, createRoomMessageSchema } from './messages';

export type ClientMessages = {
  CreateRoom: CreateRoomMessage;
};

export const ClientMessageTypes = {
  CreateRoom: 'CreateRoom',
} as const satisfies KeysAsValues<ClientMessages>;

export type ClientMessage = UnionFromObject<
  MergeObjects<
    ClientMessages,
    WrapValueWithTypeObject<typeof ClientMessageTypes>
  >
>;

export const ClientMessageValidatonFuncs = Object.fromEntries(
  Object.entries({
    CreateRoom: createRoomMessageSchema,
  } satisfies {
    [K in keyof ClientMessages]: JSONSchemaType<ClientMessages[K]>;
  }).map(([k, v]) => [k, ajv.compile(v)]),
) as {
  [K in keyof ClientMessages]: ValidateFunction<ClientMessages[K]>;
};
