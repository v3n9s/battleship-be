import { JSONSchemaType, ValidateFunction } from 'ajv';
import { ajv } from '../ajv-instance.js';
import {
  ClientMessages,
  CreateRoomMessage,
  MatrixOf,
  JoinRoomMessage,
  LeaveRoomMessage,
  SetPositionsMessage,
  User,
  StartGameMessage,
  MoveGameMessage,
  GetTokenMessage,
  SubmitTokenMessage,
  CellIndex,
  PositionsCell,
  AttacksCell,
} from '../types/index.js';

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

const cellIndexSchema: JSONSchemaType<CellIndex> = {
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

export const positionsFieldSchema: JSONSchemaType<MatrixOf<PositionsCell>> = {
  type: 'array',
  minItems: 10,
  maxItems: 10,
  items: {
    type: 'array',
    minItems: 10,
    maxItems: 10,
    items: {
      type: 'string',
      enum: ['empty', 'ship'],
    },
  },
};

export const attacksFieldSchema: JSONSchemaType<MatrixOf<AttacksCell>> = {
  type: 'array',
  minItems: 10,
  maxItems: 10,
  items: {
    type: 'array',
    minItems: 10,
    maxItems: 10,
    items: {
      type: 'string',
      enum: ['empty', 'miss', 'hit'],
    },
  },
};

export const getTokenMessageSchema: JSONSchemaType<GetTokenMessage> = {
  type: 'object',
  properties: {
    name: nameSchema,
  },
  required: ['name'],
};

export const submitTokenMessageSchema: JSONSchemaType<SubmitTokenMessage> = {
  type: 'object',
  anyOf: [
    {
      properties: {
        token: {
          type: 'string',
          maxLength: 512,
        },
      },
    },
    {
      properties: {
        token: {
          type: 'null',
        },
      },
    },
  ],
  required: ['token'],
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

export const setPositionsMessageSchema: JSONSchemaType<SetPositionsMessage> = {
  type: 'object',
  properties: {
    roomId: idSchema,
    positions: positionsFieldSchema,
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

export const moveGameMessageSchema: JSONSchemaType<MoveGameMessage> = {
  type: 'object',
  properties: {
    roomId: idSchema,
    position: cellIndexSchema,
  },
  required: ['roomId', 'position'],
};

export const ClientMessageValidatonFuncs = Object.fromEntries(
  Object.entries({
    GetToken: getTokenMessageSchema,
    SubmitToken: submitTokenMessageSchema,
    CreateRoom: createRoomMessageSchema,
    JoinRoom: joinRoomMessageSchema,
    LeaveRoom: leaveRoomMessageSchema,
    SetPositions: setPositionsMessageSchema,
    StartGame: startGameMessageSchema,
    MoveGame: moveGameMessageSchema,
  } satisfies {
    [K in keyof ClientMessages]: JSONSchemaType<ClientMessages[K]>;
  }).map(([k, v]) => [k, ajv.compile(v)]),
) as {
  [K in keyof ClientMessages]: ValidateFunction<ClientMessages[K]>;
};
