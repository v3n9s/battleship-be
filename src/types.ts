import { JSONSchemaType } from 'ajv';
import { ajv } from './ajv-instance';

export type User = {
  id: string;
  name: string;
};

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
