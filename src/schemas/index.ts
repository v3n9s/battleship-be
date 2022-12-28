import { JSONSchemaType, ValidateFunction } from 'ajv';
import { ajv } from '../ajv-instance';
import {
  ClientMessages,
  CreateRoomMessage,
  FieldDto,
  JoinRoomMessage,
  LeaveRoomMessage,
  ReadyGameMessage,
  ReadyRoomMessage,
  SetPositionsMessage,
  UserDto,
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

export const userSchema: JSONSchemaType<UserDto> = {
  type: 'object',
  properties: {
    id: idSchema,
    name: nameSchema,
  },
  required: ['id', 'name'],
};

export const userValidationFunc = ajv.compile(userSchema);

export const fieldDtoSchema: JSONSchemaType<FieldDto> = {
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
    id: idSchema,
    password: passwordSchema,
  },
  required: ['id', 'password'],
};

export const leaveRoomMessageSchema: JSONSchemaType<LeaveRoomMessage> = {
  type: 'object',
  properties: {
    id: idSchema,
  },
  required: ['id'],
};

export const readyRoomMessageSchema: JSONSchemaType<ReadyRoomMessage> = {
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
    positions: fieldDtoSchema,
  },
  required: ['roomId', 'positions'],
};

export const readyGameMessageSchema: JSONSchemaType<ReadyGameMessage> = {
  type: 'object',
  properties: {
    roomId: idSchema,
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
