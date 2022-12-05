import { JSONSchemaType, ValidateFunction } from 'ajv';
import { ajv } from '../../ajv-instance';
import {
  KeysAsValues,
  MergeObjects,
  UnionFromObject,
  WrapValueWithPayloadObject,
  WrapValueWithTypeObject,
} from '../../utils/types';
import {
  CreateRoomMessage,
  createRoomMessageSchema,
  JoinRoomMessage,
  joinRoomMessageSchema,
} from './messages';

export type ClientMessages = {
  CreateRoom: CreateRoomMessage;
  JoinRoom: JoinRoomMessage;
};

export const ClientMessageTypes = {
  CreateRoom: 'CreateRoom',
  JoinRoom: 'JoinRoom',
} as const satisfies KeysAsValues<ClientMessages>;

export type ClientMessage = UnionFromObject<
  MergeObjects<
    WrapValueWithPayloadObject<ClientMessages>,
    WrapValueWithTypeObject<typeof ClientMessageTypes>
  >
>;

export const ClientMessageValidatonFuncs = Object.fromEntries(
  Object.entries({
    CreateRoom: createRoomMessageSchema,
    JoinRoom: joinRoomMessageSchema,
  } satisfies {
    [K in keyof ClientMessages]: JSONSchemaType<ClientMessages[K]>;
  }).map(([k, v]) => [k, ajv.compile(v)]),
) as {
  [K in keyof ClientMessages]: ValidateFunction<ClientMessages[K]>;
};
