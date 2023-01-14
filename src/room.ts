import crypto from 'crypto';
import { TypedEmitter } from 'tiny-typed-emitter';
import { Field } from './field';
import { Game } from './game';
import { Room as RoomDto, Field as FieldDto, User } from './types';

type Player = User & {
  readyToPosition: boolean;
  readyToPlay: boolean;
  positions: Field | null;
};

export class Room extends TypedEmitter<{
  join: (user: User) => void;
  leave: (user: User) => void;
  delete: () => void;
}> {
  id: string;

  private player1: Player;

  private player2?: Player;

  private name: string;

  private password: string;

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
    this.player1 = this.createPlayer(player1);
  }

  private createPlayer(user: User) {
    return {
      ...user,
      readyToPosition: false,
      readyToPlay: false,
      positions: null,
    };
  }

  join({ password, user }: { password: string; user: User }) {
    if (this.password !== password) {
      throw new WrongRoomPasswordError();
    }
    if (this.player1.id === user.id) {
      throw new UserAlreadyInRoomError();
    }
    this.player2 = this.createPlayer(user);
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

  readyToPosition(userId: string) {
    if (userId === this.player1.id) {
      this.player1.readyToPosition = true;
    } else if (userId === this.player2?.id) {
      this.player2.readyToPosition = true;
    }
  }

  readyToPlay(userId: string) {
    if (userId === this.player1.id && this.player1.positions) {
      this.player1.readyToPlay = true;
    } else if (userId === this.player2?.id && this.player2?.positions) {
      this.player2.readyToPlay = true;
    }
  }

  startGame() {
    if (
      !this.player1.readyToPlay ||
      !this.player2?.readyToPlay ||
      !this.player1.positions ||
      !this.player2.positions
    ) {
      return;
    }

    this.game = new Game({
      player1: {
        id: this.player1.id,
        name: this.player1.name,
        positions: this.player1.positions,
        attacks: new Field(),
      },
      player2: {
        id: this.player2.id,
        name: this.player2.name,
        positions: this.player2.positions,
        attacks: new Field(),
      },
    });
  }

  getGame() {
    if (!this.game) {
      throw new GameNotStartedYetError();
    }
    return this.game;
  }

  isValidField(field: Field) {
    try {
      const ships = field.getShips().map(({ length }) => length);
      return (
        ships.every((v) => [1, 2, 3, 4].includes(v)) &&
        ships.filter((v) => v === 1).length === 4 &&
        ships.filter((v) => v === 2).length === 3 &&
        ships.filter((v) => v === 3).length === 2 &&
        ships.filter((v) => v === 4).length === 1
      );
    } catch {
      return false;
    }
  }

  setPositions({ userId, positions }: { userId: string; positions: FieldDto }) {
    const field = new Field(positions);
    if (!this.isValidField(field)) {
      throw new InvalidFieldError();
    }

    if (userId === this.player1.id) {
      this.player1.positions = field;
    } else if (userId === this.player2?.id) {
      this.player2.positions = field;
    }
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

export class GameNotStartedYetError extends Error {}

export class InvalidFieldError extends Error {}
