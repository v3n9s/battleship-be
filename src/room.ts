import crypto from 'crypto';
import { TypedEmitter } from 'tiny-typed-emitter';
import { RoomDto, RoomCreatedMessage, RoomJoinMessage, UserDto } from './types';

class Rooms extends TypedEmitter<{
  roomCreated: (room: RoomCreatedMessage) => void;
  roomJoin: (args: RoomJoinMessage) => void;
}> {
  list: Room[] = [];

  createRoom({
    name,
    password,
    creator,
  }: {
    name: string;
    password: string;
    creator: UserDto;
  }) {
    const room = new Room({
      name,
      password,
      player1: creator,
    });
    this.list.push(room);
    this.emit('roomCreated', room.toDto());
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
    this.emit('roomJoin', { roomId: room.id, user: room.player2 });
  }
}

export const rooms = new Rooms();

class Room {
  id = crypto.randomUUID();

  name: string;

  password: string;

  player1: UserDto;

  player2?: UserDto;

  constructor({
    name,
    password,
    player1,
  }: {
    name: string;
    password: string;
    player1: UserDto;
  }) {
    this.name = name;
    this.password = password;
    this.player1 = player1;
  }

  toDto(): RoomDto {
    return {
      id: this.id,
      name: this.name,
      player1: this.player1,
      player2: this.player2,
    };
  }
}

export class RoomNotFoundError extends Error {}

export class WrongRoomPasswordError extends Error {}
