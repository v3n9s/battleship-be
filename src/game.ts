import { TypedEmitter } from 'tiny-typed-emitter';
import { Field, ShipsField } from './field';
import { Field as FieldDto, Game as GameDto, User } from './types';

type Player = {
  user: User;
  isReady: boolean;
  positions: Field | null;
  attacks: Field;
};

type GameState = 'Positioning' | 'Playing' | 'Ended';

export class Game extends TypedEmitter<{
  start: () => void;
}> {
  private player1: Player;

  private player2: Player;

  private turn: 'player1' | 'player2' = 'player1';

  private state: GameState = 'Positioning';

  constructor({ player1, player2 }: { player1: User; player2: User }) {
    super();
    this.player1 = {
      user: player1,
      isReady: false,
      attacks: new Field(),
      positions: null,
    };
    this.player2 = {
      user: player2,
      isReady: false,
      attacks: new Field(),
      positions: null,
    };
  }

  isValidField(field: Field) {
    const shipsField = new ShipsField(field);
    try {
      const ships = shipsField.getShips().map(({ length }) => length);
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
    if (this.state !== 'Positioning') return;

    const field = new Field(positions);
    if (!this.isValidField(field)) {
      throw new InvalidFieldError();
    }

    if (userId === this.player1.user.id) {
      this.player1.positions = field;
    } else if (userId === this.player2.user.id) {
      this.player2.positions = field;
    }
  }

  ready(userId: string) {
    if (userId === this.player1.user.id && this.player1.positions) {
      this.player1.isReady = true;
    } else if (userId === this.player2.user.id && this.player2.positions) {
      this.player2.isReady = true;
    }
  }

  start() {
    if (!this.player1.isReady || !this.player2.isReady) return;

    this.state = 'Playing';
    this.emit('start');
  }

  toDto(): GameDto {
    return {
      player1: {
        user: this.player1.user,
        attacks: this.player1.attacks.toDto(),
      },
      player2: {
        user: this.player2.user,
        attacks: this.player2.attacks.toDto(),
      },
    };
  }
}

export class InvalidFieldError extends Error {}
