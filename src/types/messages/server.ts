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

export type RoomCreatedMessage = Omit<Room, 'player2'>;

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

export type RoomReadyMessage = {
  roomId: string;
  userId: string;
};

export type GameCreateMessage = {
  roomId: string;
};

export type GameReadyMessage = {
  roomId: string;
  userId: string;
};

export type ExistingRoomsMessage = Room[];

export type ServerMessages = {
  Error: ErrorMessage;
  RoomCreated: RoomCreatedMessage;
  RoomJoin: RoomJoinMessage;
  RoomLeave: RoomLeaveMessage;
  RoomDelete: RoomDeleteMessage;
  RoomReady: RoomReadyMessage;
  GameCreate: GameCreateMessage;
  GameReady: GameReadyMessage;
  ExistingRooms: ExistingRoomsMessage;
};

export type ServerMessage = ObjectToUnion<
  MergeObjects<
    WrapValueWithPayloadObject<ServerMessages>,
    WrapValueWithTypeObject<KeysAsValues<ServerMessages>>
  >
>;
