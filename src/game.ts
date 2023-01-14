import { TypedEmitter } from 'tiny-typed-emitter';
import { CellIndex, Field } from './field';
import { User, Game as GameDto } from './types';

type Player = User & {
  positions: Field;
  attacks: Field;
};

export class Game extends TypedEmitter<{
  hit: (args: { userId: string; position: CellIndex }) => void;
  miss: (args: { userId: string; position: CellIndex }) => void;
  end: (winner: User) => void;
}> {
  private player1: Player;

  private player2: Player;

  private movingPlayerId: string;

  ended = false;

  constructor({ player1, player2 }: { player1: Player; player2: Player }) {
    super();
    this.player1 = player1;
    this.player2 = player2;
    this.movingPlayerId = player1.id;
  }

  toggleMove() {
    this.movingPlayerId =
      this.movingPlayerId === this.player1.id
        ? this.player2.id
        : this.player1.id;
  }

  isUserAllowedToMove(userId: string) {
    return userId === this.movingPlayerId;
  }

  getMoveData(userId: string) {
    return {
      attacker: userId === this.player1.id ? this.player1 : this.player2,
      defender: userId === this.player1.id ? this.player2 : this.player1,
    };
  }

  isAllShipsDestroyed(positions: Field, attacks: Field) {
    for (let i = 0; i < 10; i++) {
      for (let u = 0; u < 10; u++) {
        if (positions.at([i, u]) && !attacks.at([i, u])) {
          return false;
        }
      }
    }
    return true;
  }

  move(userId: string, position: CellIndex) {
    if (!this.isUserAllowedToMove(userId) || this.ended) {
      return;
    }
    const { attacker, defender } = this.getMoveData(userId);
    if (attacker.attacks.at(position)) {
      return;
    }
    attacker.attacks.set(position, true);
    const cell = defender.positions.at(position);
    if (cell) {
      this.emit('hit', { userId, position });
      if (this.isAllShipsDestroyed(defender.positions, attacker.attacks)) {
        this.ended = true;
        this.emit('end', attacker);
      }
    } else {
      this.emit('miss', { userId, position });
      this.toggleMove();
    }
  }

  toDto(): GameDto {
    return {
      player1: {
        id: this.player1.id,
        name: this.player1.name,
        attacks: this.player1.attacks.toDto(),
      },
      player2: {
        id: this.player2.id,
        name: this.player2.name,
        attacks: this.player2.attacks.toDto(),
      },
    };
  }
}
