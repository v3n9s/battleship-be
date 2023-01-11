import { TypedEmitter } from 'tiny-typed-emitter';
import { Field as FieldDto, Game as GameDto, User } from './types';

type Player = {
  user: User;
  isReady: boolean;
  positions: Field;
  attacks: Field;
};

type GameState = 'Positioning' | 'Playing' | 'Ended';

export class Game extends TypedEmitter<{
  start: () => void;
}> {
  player1: Player;

  player2: Player;

  turn: 'player1' | 'player2' = 'player1';

  state: GameState = 'Positioning';

  constructor({ player1, player2 }: { player1: User; player2: User }) {
    super();
    this.player1 = {
      user: player1,
      isReady: false,
      attacks: new Field(),
      positions: new Field(),
    };
    this.player2 = {
      user: player2,
      isReady: false,
      attacks: new Field(),
      positions: new Field(),
    };
  }

  setPositions({ userId, positions }: { userId: string; positions: FieldDto }) {
    if (this.state !== 'Positioning') return;

    if (userId === this.player1.user.id) {
      this.player1.positions = new Field({ field: positions });
    } else if (userId === this.player2.user.id) {
      this.player2.positions = new Field({ field: positions });
    }
  }

  ready(userId: string) {
    if (userId === this.player1.user.id) {
      this.player1.isReady = true;
    } else if (userId === this.player2.user.id) {
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

class Field {
  field: boolean[][];

  constructor({
    field = new Array(10).fill(new Array(10).fill(false)) as boolean[][],
  } = {}) {
    this.field = field;
  }

  at(x: number, y: number) {
    return !!this.field[x]?.[y];
  }

  set(x: number, y: number, value: boolean) {
    const col = this.field[x];
    if (col && y in col) {
      col[y] = value;
    }
  }

  toDto(): FieldDto {
    return this.field;
  }
}
