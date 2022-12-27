import { JSONSchemaType, ValidateFunction } from 'ajv';
import { ajv } from '../ajv-instance';
import {
  ClientMessages,
  CreateRoomMessage,
  JoinRoomMessage,
  LeaveRoomMessage,
  ReadyGameMessage,
  ReadyRoomMessage,
  SetPositionsMessage,
  UserDto,
} from '../types';

export const userSchema: JSONSchemaType<UserDto> = {
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

export const leaveRoomMessageSchema: JSONSchemaType<LeaveRoomMessage> = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      minLength: 36,
      maxLength: 36,
    },
  },
  required: ['id'],
};

export const readyRoomMessageSchema: JSONSchemaType<ReadyRoomMessage> = {
  type: 'object',
  properties: {
    roomId: {
      type: 'string',
      minLength: 36,
      maxLength: 36,
    },
  },
  required: ['roomId'],
};

export const setPositionsMessageSchema: JSONSchemaType<SetPositionsMessage> = {
  type: 'object',
  properties: {
    roomId: {
      type: 'string',
      minLength: 36,
      maxLength: 36,
    },
    positions: {
      type: 'array',
      minItems: 10,
      maxItems: 10,
      items: {
        type: 'array',
        minItems: 10,
        maxItems: 10,
        items: {
          type: 'boolean',
        },
      },
    },
  },
  required: ['roomId', 'positions'],
};

export const readyGameMessageSchema: JSONSchemaType<ReadyGameMessage> = {
  type: 'object',
  properties: {
    roomId: {
      type: 'string',
      minLength: 36,
      maxLength: 36,
    },
  },
  required: ['roomId'],
};

export const ClientMessageValidatonFuncs = Object.fromEntries(
  Object.entries({
    CreateRoom: createRoomMessageSchema,
    JoinRoom: joinRoomMessageSchema,
    LeaveRoom: leaveRoomMessageSchema,
    ReadyRoom: readyRoomMessageSchema,
    SetPositions: setPositionsMessageSchema,
    ReadyGame: readyGameMessageSchema,
  } satisfies {
    [K in keyof ClientMessages]: JSONSchemaType<ClientMessages[K]>;
  }).map(([k, v]) => [k, ajv.compile(v)]),
) as {
  [K in keyof ClientMessages]: ValidateFunction<ClientMessages[K]>;
};
