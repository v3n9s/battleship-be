import { TypedEmitter } from 'tiny-typed-emitter';
import { FieldDto, GameDto, UserDto } from './types';

type Player = {
  user: UserDto;
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

  constructor({ player1, player2 }: { player1: UserDto; player2: UserDto }) {
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

  setPositions({ user, positions }: { user: UserDto; positions: Field }) {
    if (this.state !== 'Positioning') return;

    if (user.id === this.player1.user.id) {
      this.player1.positions = positions;
    } else if (user.id === this.player2.user.id) {
      this.player2.positions = positions;
    }
  }

  ready(user: UserDto) {
    if (user.id === this.player1.user.id) {
      this.player1.isReady = true;
    } else if (user.id === this.player2.user.id) {
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

export class Field {
  field: boolean[][];

  constructor({
    field = new Array(10).fill(new Array(10).fill(false)) as boolean[][],
  } = {}) {
    this.field = field;
  }

  at(x: number, y: number) {
    const cell = this.field[x]?.[y];
    if (typeof cell !== 'boolean') {
      throw new Error('Could not get value outside of range');
    }
    return cell;
  }

  set(x: number, y: number, value: boolean) {
    const col = this.field[x];
    if (!col || typeof col[y] !== 'boolean') {
      throw new Error('Could not set value outside of range');
    }
    col[y] = value;
  }

  toDto(): FieldDto {
    return this.field;
  }
}
