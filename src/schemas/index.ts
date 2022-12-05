import { JSONSchemaType, ValidateFunction } from 'ajv';
import { ajv } from '../ajv-instance';
import {
  ClientMessages,
  CreateRoomMessage,
  JoinRoomMessage,
  User,
} from '../types';

export const userSchema: JSONSchemaType<User> = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      minLength: 36,
      maxLength: 36,
    },
    name: {
      type: 'string',
      minLength: 1,
    },
  },
  required: ['id', 'name'],
};

export const userValidationFunc = ajv.compile(userSchema);

export const createRoomMessageSchema: JSONSchemaType<CreateRoomMessage> = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 32,
    },
    password: {
      type: 'string',
      maxLength: 32,
    },
  },
  required: ['name', 'password'],
};

export const joinRoomMessageSchema: JSONSchemaType<JoinRoomMessage> = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      minLength: 36,
      maxLength: 36,
    },
    password: {
      type: 'string',
      maxLength: 32,
    },
  },
  required: ['id', 'password'],
};

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
