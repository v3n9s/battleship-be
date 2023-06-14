import { TypedEmitter } from 'tiny-typed-emitter';
import { Room } from './room.js';
import {
  GameDestroyMessage,
  GameEndMessage,
  GameHitMessage,
  GameMissMessage,
  GameStartMessage,
  RoomCreateMessage,
  RoomDeleteMessage,
  RoomJoinMessage,
  RoomLeaveMessage,
  RoomPositionsSetMessage,
  User,
} from './types/index.js';

class Store extends TypedEmitter<{
  roomCreate: (args: RoomCreateMessage) => void;
  roomJoin: (args: RoomJoinMessage) => void;
  roomLeave: (args: RoomLeaveMessage) => void;
  roomDelete: (args: RoomDeleteMessage) => void;
  roomPositionsSet: (args: RoomPositionsSetMessage) => void;
  gameStart: (args: GameStartMessage) => void;
  gameHit: (args: GameHitMessage) => void;
  gameDestroy: (args: GameDestroyMessage) => void;
  gameMiss: (args: GameMissMessage) => void;
  gameEnd: (args: GameEndMessage) => void;
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

    room.on('leave', (userId) => {
      this.emit('roomLeave', { roomId: room.id, userId });
    });

    room.on('positionsSet', (userId) => {
      this.emit('roomPositionsSet', { roomId: room.id, userId });
    });

    room.on('gameStart', (game) => {
      game.on('hit', ({ userId, position }) => {
        this.emit('gameHit', { roomId: room.id, userId, position });
      });

      game.on('miss', ({ userId, position }) => {
        this.emit('gameMiss', { roomId: room.id, userId, position });
      });

      game.on('destroy', ({ userId, ship }) => {
        this.emit('gameDestroy', { roomId: room.id, userId, ship });
      });

      game.on('end', (winner) => {
        this.emit('gameEnd', { roomId: room.id, winner });
        game.removeAllListeners();
      });

      this.emit('gameStart', { roomId: room.id, game: room.getGame().toDto() });
    });

    room.on('delete', () => {
      this.rooms = this.rooms.filter(({ id }) => id !== room.id);
      this.emit('roomDelete', { roomId: room.id });
      room.removeAllListeners();
    });

    this.rooms.push(room);
    this.emit('roomCreate', room.toDto());
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
