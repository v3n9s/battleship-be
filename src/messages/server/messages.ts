import { Room } from '../../room';
import { User } from '../../types';

export type ErrorMessage = {
  text: string;
};

export type RoomCreatedMessage = Room;

export type RoomJoinMessage = { room: Room; user: User };
