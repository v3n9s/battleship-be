import { TypedEmitter } from 'tiny-typed-emitter';
import { Room } from './room';
import * as types from './types';

class Store extends TypedEmitter<{
  roomCreated: (args: types.RoomCreatedMessage) => void;
  roomJoin: (args: types.RoomJoinMessage) => void;
  roomLeave: (args: types.RoomLeaveMessage) => void;
  roomDelete: (args: types.RoomDeleteMessage) => void;
  roomReady: (args: types.RoomReadyMessage) => void;
  gameReady: (args: types.GameReadyMessage) => void;
}> {
  private rooms: Room[] = [];

  createRoom({
    name,
    password,
    user,
  }: {
    name: string;
    password: string;
    user: types.User;
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
