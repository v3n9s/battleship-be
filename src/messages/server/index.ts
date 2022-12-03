import {
  KeysAsValues,
  MergeObjects,
  UnionFromObject,
  WrapValueWithTypeObject,
} from '../../utils/types';
import { ErrorMessage, SetTokenMessage } from './messages';

export type ServerMessages = {
  Error: ErrorMessage;
  SetToken: SetTokenMessage;
};

export const ServerMessageTypes = {
  Error: 'Error',
  SetToken: 'SetToken',
} as const satisfies KeysAsValues<ServerMessages>;

export type ServerMessage = UnionFromObject<
  MergeObjects<
    ServerMessages,
    WrapValueWithTypeObject<typeof ServerMessageTypes>
  >
>;
