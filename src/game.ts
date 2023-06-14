import { TypedEmitter } from 'tiny-typed-emitter';
import { Field } from './field.js';
import {
  User,
  Game as GameDto,
  CellIndex,
  PositionsCell,
  AttacksCell,
  Ship,
} from './types/index.js';
import { getCellsAroundCells, getShips, isSameCell } from './ships-field.js';

type Player = User & {
  positions: Field<PositionsCell>;
  attacks: Field<AttacksCell>;
};

export class Game extends TypedEmitter<{
  hit: (args: { userId: string; position: CellIndex }) => void;
  destroy: (args: {
    userId: string;
    ship: Ship;
    cellsAroundShip: CellIndex[];
  }) => void;
  miss: (args: { userId: string; position: CellIndex }) => void;
  end: (winner: User) => void;
}> {
  private player1: Player;

  private player2: Player;

  private movingPlayerId: string;

  winner: User | null = null;

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

  isAllShipsDestroyed(
    positions: Field<PositionsCell>,
    attacks: Field<AttacksCell>,
  ) {
    for (let i = 0; i < 10; i++) {
      for (let u = 0; u < 10; u++) {
        if (positions.at([i, u]) === 'ship' && attacks.at([i, u]) === 'empty') {
          return false;
        }
      }
    }
    return true;
  }

  move(userId: string, position: CellIndex) {
    if (!this.isUserAllowedToMove(userId) || this.winner) {
      return;
    }
    const { attacker, defender } = this.getMoveData(userId);
    if (attacker.attacks.at(position) !== 'empty') {
      return;
    }
    const ship = getShips(defender.positions).find((ship) =>
      ship.find((cellIndex) => isSameCell(cellIndex, position)),
    );
    if (ship) {
      attacker.attacks.set(position, 'hit');
      this.emit('hit', { userId, position });
      if (ship.every((cellIndex) => attacker.attacks.at(cellIndex) === 'hit')) {
        const cellsAroundShip = getCellsAroundCells(ship).filter((cellIndex) =>
          cellIndex.every((index) => index >= 0 && index <= 9),
        );
        cellsAroundShip.forEach((cellIndex) => {
          attacker.attacks.set(cellIndex, 'miss');
        });
        this.emit('destroy', { userId, ship, cellsAroundShip });
      }
      if (this.isAllShipsDestroyed(defender.positions, attacker.attacks)) {
        this.winner = { id: attacker.id, name: attacker.name };
        this.emit('end', attacker);
      }
    } else {
      attacker.attacks.set(position, 'miss');
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
      movingPlayerId: this.movingPlayerId,
      winner: this.winner,
    };
  }
}
