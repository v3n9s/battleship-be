import crypto from 'crypto';
import { TypedEmitter } from 'tiny-typed-emitter';
import { Game } from './game';
import { Room as RoomDto, User } from './types';

export class Room extends TypedEmitter<{
  join: (user: User) => void;
  leave: (user: User) => void;
  gameCreate: () => void;
  delete: () => void;
}> {
  id: string;

  private name: string;

  private password: string;

  private player1: User;

  private player1Ready = false;

  private player2?: User;

  private player2Ready = false;

  private game?: Game;

  constructor({
    name,
    password,
    player1,
  }: {
    name: string;
    password: string;
    player1: User;
  }) {
    super();
    this.id = crypto.randomUUID();
    this.name = name;
    this.password = password;
    this.player1 = player1;
  }

  join({ password, user }: { password: string; user: User }) {
    if (this.password !== password) {
      throw new WrongRoomPasswordError();
    }
    if (this.player1.id === user.id) {
      throw new UserAlreadyInRoomError();
    }
    this.player2 = { id: user.id, name: user.name };
    this.emit('join', this.player2);
  }

  leave(userId: string) {
    if (userId === this.player1.id) {
      this.emit('delete');
    } else if (userId === this.player2?.id) {
      this.emit('leave', this.player2);
      delete this.player2;
    }
  }

  ready(userId: string) {
    if (userId === this.player1.id) {
      this.player1Ready = true;
    } else if (userId === this.player2?.id) {
      this.player2Ready = true;
    }
  }

  createGame() {
    if (!this.player2 || !this.player1Ready || !this.player2Ready) {
      return;
    }

    this.game = new Game({ player1: this.player1, player2: this.player2 });
    this.emit('gameCreate');
  }

  getGame() {
    if (!this.game) {
      throw new GameNotStartedYet();
    }
    return this.game;
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

export class WrongRoomPasswordError extends Error {}

export class UserAlreadyInRoomError extends Error {}

export class UserAlreadyInOtherRoomError extends Error {}

export class GameNotStartedYet extends Error {}
