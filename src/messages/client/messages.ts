import { JSONSchemaType } from 'ajv';

export type CreateRoomMessage = {
  name: string;
  password: string;
};

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
