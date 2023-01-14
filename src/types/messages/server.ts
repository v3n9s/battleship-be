import { Room, User } from '../other';
import {
  KeysAsValues,
  MergeObjects,
  ObjectToUnion,
  WrapValueWithPayloadObject,
  WrapValueWithTypeObject,
} from '../utils';

export type ErrorMessage = {
  text: string;
};

export type RoomCreateMessage = Omit<Room, 'player2'>;

export type RoomJoinMessage = {
  roomId: string;
  user: User;
};

export type RoomLeaveMessage = {
  roomId: string;
  userId: string;
};

export type RoomDeleteMessage = {
  roomId: string;
};

export type RoomReadyToPositionMessage = {
  roomId: string;
  userId: string;
};

export type RoomReadyToPlayMessage = {
  roomId: string;
  userId: string;
};

export type GameStartMessage = {
  roomId: string;
};

export type GameHitMessage = {
  roomId: string;
  userId: string;
  position: [number, number];
};

export type GameMissMessage = {
  roomId: string;
  userId: string;
  position: [number, number];
};

export type GameEndMessage = {
  winner: User;
};

export type ExistingRoomsMessage = Room[];

export type ServerMessages = {
  Error: ErrorMessage;
  RoomCreate: RoomCreateMessage;
  RoomJoin: RoomJoinMessage;
  RoomLeave: RoomLeaveMessage;
  RoomDelete: RoomDeleteMessage;
  RoomReadyToPosition: RoomReadyToPositionMessage;
  RoomReadyToPlay: RoomReadyToPlayMessage;
  GameStart: GameStartMessage;
  GameHit: GameHitMessage;
  GameMiss: GameMissMessage;
  GameEnd: GameEndMessage;
  ExistingRooms: ExistingRoomsMessage;
};

export type ServerMessage = ObjectToUnion<
  MergeObjects<
    WrapValueWithPayloadObject<ServerMessages>,
    WrapValueWithTypeObject<KeysAsValues<ServerMessages>>
  >
>;
