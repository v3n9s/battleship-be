import { JSONSchemaType, ValidateFunction } from 'ajv';
import { ajv } from '../../ajv-instance';
import {
  KeysAsValues,
  MergeObjects,
  UnionFromObject,
  WrapValueWithTypeObject,
} from '../../utils/types';
import { ShowTokenMessage, showTokenMessageSchema } from './messages';

export type ClientMessages = {
  ShowToken: ShowTokenMessage;
};

export const ClientMessageTypes = {
  ShowToken: 'ShowToken',
} as const satisfies KeysAsValues<ClientMessages>;

export type ClientMessage = UnionFromObject<
  MergeObjects<
    ClientMessages,
    WrapValueWithTypeObject<typeof ClientMessageTypes>
  >
>;

export const ClientMessageValidatonFuncs = Object.fromEntries(
  Object.entries({
    ShowToken: showTokenMessageSchema,
  } satisfies {
    [K in keyof ClientMessages]: JSONSchemaType<ClientMessages[K]>;
  }).map(([k, v]) => [k, ajv.compile(v)]),
) as {
  [K in keyof ClientMessages]: ValidateFunction<ClientMessages[K]>;
};
