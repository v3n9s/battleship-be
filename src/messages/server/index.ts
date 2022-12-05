import {
  KeysAsValues,
  MergeObjects,
  UnionFromObject,
  WrapValueWithPayloadObject,
  WrapValueWithTypeObject,
} from '../../utils/types';
import { ErrorMessage, RoomCreatedMessage, RoomJoinMessage } from './messages';

export type ServerMessages = {
  Error: ErrorMessage;
  RoomCreated: RoomCreatedMessage;
  RoomJoin: RoomJoinMessage;
};

export const ServerMessageTypes = {
  Error: 'Error',
  RoomCreated: 'RoomCreated',
  RoomJoin: 'RoomJoin',
} as const satisfies KeysAsValues<ServerMessages>;

export type ServerMessage = UnionFromObject<
  MergeObjects<
    WrapValueWithPayloadObject<ServerMessages>,
    WrapValueWithTypeObject<typeof ServerMessageTypes>
  >
>;
