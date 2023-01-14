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

export type ReadyToPositionMessage = {
  roomId: string;
};

export type ReadyToPlayMessage = {
  roomId: string;
};

export type SetPositionsMessage = {
  roomId: string;
  positions: Field;
};

export type StartGameMessage = {
  roomId: string;
};

export type MoveGameMessage = {
  roomId: string;
  position: [number, number];
};

export type ClientMessages = {
  CreateRoom: CreateRoomMessage;
  JoinRoom: JoinRoomMessage;
  LeaveRoom: LeaveRoomMessage;
  ReadyToPosition: ReadyToPositionMessage;
  ReadyToPlay: ReadyToPlayMessage;
  SetPositions: SetPositionsMessage;
  StartGame: StartGameMessage;
  MoveGame: MoveGameMessage;
};

export type ClientMessage = ObjectToUnion<
  MergeObjects<
    WrapValueWithPayloadObject<ClientMessages>,
    WrapValueWithTypeObject<KeysAsValues<ClientMessages>>
  >
>;
