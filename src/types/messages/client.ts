import { MatrixOf, PositionsCell } from '../other.js';
import { MessagesObjectToUnion } from '../utils.js';

export type GetTokenMessage = {
  name: string;
};

export type SubmitTokenMessage = {
  token: string | null;
};

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

export type SetPositionsMessage = {
  roomId: string;
  positions: MatrixOf<PositionsCell>;
};

export type StartGameMessage = {
  roomId: string;
};

export type MoveGameMessage = {
  roomId: string;
  position: [number, number];
};

export type ClientMessages = {
  GetToken: GetTokenMessage;
  SubmitToken: SubmitTokenMessage;
  CreateRoom: CreateRoomMessage;
  JoinRoom: JoinRoomMessage;
  LeaveRoom: LeaveRoomMessage;
  SetPositions: SetPositionsMessage;
  StartGame: StartGameMessage;
  MoveGame: MoveGameMessage;
};

export type ClientMessage = MessagesObjectToUnion<ClientMessages>;
