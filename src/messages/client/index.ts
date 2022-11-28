import { JSONSchemaType, ValidateFunction } from 'ajv';
import { ajv } from '../../ajv-instance';
import { ShowTokenMessage, showTokenMessageSchema } from './messages';

export type ClientMessages = {
  ShowToken: ShowTokenMessage;
};

export const ClientMessageValidatonFuncs = Object.fromEntries(
  Object.entries({
    ShowToken: showTokenMessageSchema,
  } satisfies {
    [K in keyof ClientMessages]: JSONSchemaType<ClientMessages[K]>;
  }).map(([k, v]) => [k, ajv.compile(v)]),
) as {
  [K in keyof ClientMessages]: ValidateFunction<ClientMessages[K]>;
};
