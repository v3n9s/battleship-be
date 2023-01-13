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
  roomId: string;
  password: string;
};

export type LeaveRoomMessage = {
  roomId: string;
};

export type ReadyRoomMessage = {
  roomId: string;
};

export type SetPositionsMessage = {
  roomId: string;
  positions: Field;
};

export type CreateGameMessage = {
  roomId: string;
};

export type ReadyGameMessage = {
  roomId: string;
};

export type StartGameMessage = {
  roomId: string;
};

export type ClientMessages = {
  CreateRoom: CreateRoomMessage;
  JoinRoom: JoinRoomMessage;
  LeaveRoom: LeaveRoomMessage;
  ReadyRoom: ReadyRoomMessage;
  SetPositions: SetPositionsMessage;
  CreateGame: CreateGameMessage;
  ReadyGame: ReadyGameMessage;
  StartGame: StartGameMessage;
};

export type ClientMessage = ObjectToUnion<
  MergeObjects<
    WrapValueWithPayloadObject<ClientMessages>,
    WrapValueWithTypeObject<KeysAsValues<ClientMessages>>
  >
>;
