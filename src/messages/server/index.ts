import {
  KeysAsValues,
  MergeObjects,
  UnionFromObject,
  WrapValueWithTypeObject,
} from '../../utils/types';
import { ErrorMessage, RoomCreatedMessage } from './messages';

export type ServerMessages = {
  Error: ErrorMessage;
  RoomCreated: RoomCreatedMessage;
};

export const ServerMessageTypes = {
  Error: 'Error',
  RoomCreated: 'RoomCreated',
} as const satisfies KeysAsValues<ServerMessages>;

export type ServerMessage = UnionFromObject<
  MergeObjects<
    ServerMessages,
    WrapValueWithTypeObject<typeof ServerMessageTypes>
  >
>;
