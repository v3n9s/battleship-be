import crypto from 'crypto';
import { TypedEmitter } from 'tiny-typed-emitter';
import { User } from './types';

export type Room = {
  id: string;
  name: string;
  password: string;
  player1: User;
  player2?: User;
};

class Rooms extends TypedEmitter<{
  roomCreated: (room: Room) => void;
  roomJoin: (args: { room: Room; user: User }) => void;
}> {
  list: Room[] = [];

  createRoom({
    name,
    password,
    creator,
  }: {
    name: string;
    password: string;
    creator: User;
  }) {
    const room = {
      id: crypto.randomUUID(),
      name,
      password,
      player1: creator,
    };
    this.list.push(room);
    this.emit('roomCreated', room);
  }

  joinRoom({
    roomId,
    roomPassword,
    userId,
    userName,
  }: {
    roomId: string;
    roomPassword: string;
    userId: string;
    userName: string;
  }) {
    const room = this.list.find(({ id }) => id === roomId);
    if (!room) {
      throw new RoomNotFoundError();
    }
    if (room.password !== roomPassword) {
      throw new WrongRoomPasswordError();
    }
    room.player2 = { id: userId, name: userName };
    this.emit('roomJoin', { room, user: room.player2 });
  }
}

export const rooms = new Rooms();

export class RoomNotFoundError extends Error {}

export class WrongRoomPasswordError extends Error {}
