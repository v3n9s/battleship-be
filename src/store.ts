import { TypedEmitter } from 'tiny-typed-emitter';
import { Room } from './room';
import {
  GameReadyMessage,
  GameCreateMessage,
  RoomCreatedMessage,
  RoomDeleteMessage,
  RoomJoinMessage,
  RoomLeaveMessage,
  RoomReadyMessage,
  User,
  GameStartMessage,
} from './types';

class Store extends TypedEmitter<{
  roomCreated: (args: RoomCreatedMessage) => void;
  roomJoin: (args: RoomJoinMessage) => void;
  roomLeave: (args: RoomLeaveMessage) => void;
  roomDelete: (args: RoomDeleteMessage) => void;
  roomReady: (args: RoomReadyMessage) => void;
  gameCreate: (args: GameCreateMessage) => void;
  gameReady: (args: GameReadyMessage) => void;
  gameStart: (args: GameStartMessage) => void;
}> {
  private rooms: Room[] = [];

  createRoom({
    name,
    password,
    user,
  }: {
    name: string;
    password: string;
    user: User;
  }) {
    const room = new Room({
      name,
      password,
      player1: user,
    });
    room.on('join', (user) => {
      this.emit('roomJoin', { roomId: room.id, user });
    });
    room.on('leave', (user) => {
      this.emit('roomLeave', { roomId: room.id, userId: user.id });
    });
    room.on('delete', () => {
      this.rooms = this.rooms.filter(({ id }) => id === room.id);
      this.emit('roomDelete', { roomId: room.id });
    });
    room.on('gameCreate', () => {
      this.emit('gameCreate', { roomId: room.id });
    });
    room.on('gameReady', (userId) => {
      this.emit('gameReady', { roomId: room.id, userId });
    });
    room.on('gameStart', () => {
      this.emit('gameStart', { roomId: room.id });
    });
    this.rooms.push(room);
    this.emit('roomCreated', room.toDto());
  }

  getRoom(roomId: string) {
    const room = this.rooms.find(({ id }) => id === roomId);
    if (!room) {
      throw new RoomNotFoundError();
    }
    return room;
  }

  getRooms() {
    return this.rooms;
  }
}

export const store = new Store();

export class RoomNotFoundError extends Error {}
