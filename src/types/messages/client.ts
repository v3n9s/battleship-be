import { Field } from '../other';
import {
  KeysAsValues,
  MergeObjects,
  ObjectToUnion,
  WrapValueWithPayloadObject,
  WrapValueWithTypeObject,
} from '../utils';

export type CreateRoomMessage = {
  name: string;
  password: string;
};

export type JoinRoomMessage = {
  id: string;
  password: string;
};

export type LeaveRoomMessage = {
  id: string;
};

export type ReadyRoomMessage = {
  roomId: string;
};

export type SetPositionsMessage = {
  roomId: string;
  positions: Field;
};

export type ReadyGameMessage = {
  roomId: string;
};

export type ClientMessages = {
  CreateRoom: CreateRoomMessage;
  JoinRoom: JoinRoomMessage;
  LeaveRoom: LeaveRoomMessage;
  ReadyRoom: ReadyRoomMessage;
  SetPositions: SetPositionsMessage;
  ReadyGame: ReadyGameMessage;
};

export type ClientMessage = ObjectToUnion<
  MergeObjects<
    WrapValueWithPayloadObject<ClientMessages>,
    WrapValueWithTypeObject<KeysAsValues<ClientMessages>>
  >
>;
