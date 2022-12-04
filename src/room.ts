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
}

export const rooms = new Rooms();
