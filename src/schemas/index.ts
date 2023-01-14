import { JSONSchemaType, ValidateFunction } from 'ajv';
import { ajv } from '../ajv-instance';
import {
  ClientMessages,
  CreateRoomMessage,
  Field,
  JoinRoomMessage,
  LeaveRoomMessage,
  SetPositionsMessage,
  User,
  StartGameMessage,
  ReadyToPositionMessage,
  ReadyToPlayMessage,
  MoveGameMessage,
} from '../types';

export const idSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 36,
  maxLength: 36,
};

export const nameSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 32,
};

export const nameValidationFunc = ajv.compile(nameSchema);

export const passwordSchema: JSONSchemaType<string> = {
  type: 'string',
  maxLength: 32,
};

export const userSchema: JSONSchemaType<User> = {
  type: 'object',
  properties: {
    id: idSchema,
    name: nameSchema,
  },
  required: ['id', 'name'],
};

export const userValidationFunc = ajv.compile(userSchema);

export const fieldSchema: JSONSchemaType<Field> = {
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
};

export const createRoomMessageSchema: JSONSchemaType<CreateRoomMessage> = {
  type: 'object',
  properties: {
    name: nameSchema,
    password: passwordSchema,
  },
  required: ['name', 'password'],
};

export const joinRoomMessageSchema: JSONSchemaType<JoinRoomMessage> = {
  type: 'object',
  properties: {
    roomId: idSchema,
    password: passwordSchema,
  },
  required: ['roomId', 'password'],
};

export const leaveRoomMessageSchema: JSONSchemaType<LeaveRoomMessage> = {
  type: 'object',
  properties: {
    roomId: idSchema,
  },
  required: ['roomId'],
};

export const readyToPositionMessageSchema: JSONSchemaType<ReadyToPositionMessage> =
  {
    type: 'object',
    properties: {
      roomId: idSchema,
    },
    required: ['roomId'],
  };

export const readyToPlayMessageSchema: JSONSchemaType<ReadyToPlayMessage> = {
  type: 'object',
  properties: {
    roomId: idSchema,
  },
  required: ['roomId'],
};

export const setPositionsMessageSchema: JSONSchemaType<SetPositionsMessage> = {
  type: 'object',
  properties: {
    roomId: idSchema,
    positions: fieldSchema,
  },
  required: ['roomId', 'positions'],
};

export const startGameMessageSchema: JSONSchemaType<StartGameMessage> = {
  type: 'object',
  properties: {
    roomId: idSchema,
  },
  required: ['roomId'],
};

const positionSchema: JSONSchemaType<[number, number]> = {
  type: 'array',
  minItems: 2,
  maxItems: 2,
  items: [
    {
      type: 'integer',
      minimum: 0,
      maximum: 9,
    },
    {
      type: 'integer',
      minimum: 0,
      maximum: 9,
    },
  ],
};

export const moveGameMessageSchema: JSONSchemaType<MoveGameMessage> = {
  type: 'object',
  properties: {
    roomId: idSchema,
    position: positionSchema,
  },
  required: ['roomId', 'position'],
};

export const ClientMessageValidatonFuncs = Object.fromEntries(
  Object.entries({
    CreateRoom: createRoomMessageSchema,
    JoinRoom: joinRoomMessageSchema,
    LeaveRoom: leaveRoomMessageSchema,
    ReadyToPosition: readyToPositionMessageSchema,
    ReadyToPlay: readyToPlayMessageSchema,
    SetPositions: setPositionsMessageSchema,
    StartGame: startGameMessageSchema,
    MoveGame: moveGameMessageSchema,
  } satisfies {
    [K in keyof ClientMessages]: JSONSchemaType<ClientMessages[K]>;
  }).map(([k, v]) => [k, ajv.compile(v)]),
) as {
  [K in keyof ClientMessages]: ValidateFunction<ClientMessages[K]>;
};
