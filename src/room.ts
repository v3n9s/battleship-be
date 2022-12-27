import crypto from 'crypto';
import { TypedEmitter } from 'tiny-typed-emitter';
import { Game } from './game';
import {
  RoomDto,
  RoomCreatedMessage,
  RoomJoinMessage,
  UserDto,
  RoomDeleteMessage,
  RoomLeaveMessage,
} from './types';

class Rooms extends TypedEmitter<{
  roomCreated: (args: RoomCreatedMessage) => void;
  roomJoin: (args: RoomJoinMessage) => void;
  roomLeave: (args: RoomLeaveMessage) => void;
  roomDelete: (args: RoomDeleteMessage) => void;
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
    if (
      this.list.some(
        (r) => creator.id === r.player1.id || creator.id === r.player2?.id,
      )
    ) {
      throw new UserAlreadyInOtherRoomError();
    }
    const room = new Room({
      name,
      password,
      player1: creator,
    });
    room.on('join', (user) => {
      this.emit('roomJoin', { roomId: room.id, user });
    });
    room.on('leave', (user) => {
      this.emit('roomLeave', { roomId: room.id, userId: user.id });
    });
    room.on('destroy', () => {
      this.remove(room);
      this.emit('roomDelete', { roomId: room.id });
    });
    this.list.push(room);
    this.emit('roomCreated', room.toDto());
  }

  remove(room: Room) {
    this.list = this.list.filter((r) => r.id !== room.id);
    room.removeAllListeners();
  }

  joinRoom({
    roomId,
    roomPassword,
    user,
  }: {
    roomId: string;
    roomPassword: string;
    user: UserDto;
  }) {
    const room = this.list.find(({ id }) => id === roomId);
    if (!room) {
      throw new RoomNotFoundError();
    }
    const roomUserAlreadyIn = this.list.find(
      ({ player1, player2 }) =>
        user.id === player1.id || user.id === player2?.id,
    );
    if (roomUserAlreadyIn !== room) {
      if (roomUserAlreadyIn) {
        roomUserAlreadyIn.leave(user);
      }
      room.join({ password: roomPassword, user });
    }
  }

  leaveRoom({ roomId, user }: { roomId: string; user: UserDto }) {
    const room = this.list.find(({ id }) => id === roomId);
    if (!room) {
      throw new RoomNotFoundError();
    }
    room.leave(user);
  }
}

export const rooms = new Rooms();

class Room extends TypedEmitter<{
  join: (user: UserDto) => void;
  leave: (user: UserDto) => void;
  gameStart: (game: Game) => void;
  destroy: () => void;
}> {
  id = crypto.randomUUID();

  name: string;

  password: string;

  player1: UserDto;

  player1Ready = false;

  player2?: UserDto;

  player2Ready = false;

  game?: Game;

  constructor({
    name,
    password,
    player1,
  }: {
    name: string;
    password: string;
    player1: UserDto;
  }) {
    super();
    this.name = name;
    this.password = password;
    this.player1 = player1;
  }

  join({ password, user }: { password: string; user: UserDto }) {
    if (this.password !== password) {
      throw new WrongRoomPasswordError();
    }
    if (this.player1.id === user.id) {
      throw new UserAlreadyInRoomError();
    }
    this.player2 = { id: user.id, name: user.name };
    this.emit('join', this.player2);
  }

  leave(user: UserDto) {
    if (user.id === this.player1.id) {
      this.emit('destroy');
    } else if (user.id === this.player2?.id) {
      delete this.player2;
      this.emit('leave', user);
    }
  }

  ready(user: UserDto) {
    if (user.id === this.player1.id) {
      this.player1Ready = true;
    } else if (user.id === this.player2?.id) {
      this.player2Ready = true;
    }
  }

  start() {
    if (!this.player2 || !this.player1Ready || !this.player2Ready) {
      return;
    }

    this.game = new Game({ player1: this.player1, player2: this.player2 });
    this.emit('gameStart', this.game);
  }

  toDto(): RoomDto {
    return {
      id: this.id,
      name: this.name,
      hasPassword: !!this.password,
      player1: this.player1,
      player2: this.player2,
    };
  }
}

export class RoomNotFoundError extends Error {}

export class WrongRoomPasswordError extends Error {}

export class UserAlreadyInRoomError extends Error {}

export class UserAlreadyInOtherRoomError extends Error {}
