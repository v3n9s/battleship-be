import { JSONSchemaType } from 'ajv';

export type ShowTokenMessage = {
  token: string;
};

export const showTokenMessageSchema: JSONSchemaType<ShowTokenMessage> = {
  type: 'object',
  properties: {
    token: {
      type: 'string',
    },
  },
  required: ['token'],
};
