import { Field, Room, User, UserData } from '../other';
import { MessagesObjectToUnion } from '../utils';

export type TokenCreateMessage = UserData;

export type TokenRequestMessage = undefined;

export type ExistingRoomsMessage = Room[];

export type ExistingPositionsMessage = {
  [roomId: string]: Field;
};

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

export type RoomPositionsSetMessage = {
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

export type ServerMessages = {
  TokenCreate: TokenCreateMessage;
  TokenRequest: TokenRequestMessage;
  ExistingRooms: ExistingRoomsMessage;
  ExistingPositions: ExistingPositionsMessage;
  Error: ErrorMessage;
  RoomCreate: RoomCreateMessage;
  RoomJoin: RoomJoinMessage;
  RoomLeave: RoomLeaveMessage;
  RoomDelete: RoomDeleteMessage;
  RoomPositionsSet: RoomPositionsSetMessage;
  RoomReadyToPlay: RoomReadyToPlayMessage;
  GameStart: GameStartMessage;
  GameHit: GameHitMessage;
  GameMiss: GameMissMessage;
  GameEnd: GameEndMessage;
};

export type ServerMessage = MessagesObjectToUnion<ServerMessages>;
