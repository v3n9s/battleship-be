import { Field as FieldDto } from './types';

type CellIndex = [number, number];

type Ship = CellIndex[];

export class Field {
  private field: boolean[][];

  constructor(
    field = new Array(10).fill(new Array(10).fill(false)) as boolean[][],
  ) {
    this.field = field;
  }

  at([x, y]: CellIndex) {
    return !!this.field[x]?.[y];
  }

  set([x, y]: CellIndex, value: boolean) {
    const col = this.field[x];
    if (col && y in col) {
      col[y] = value;
    }
  }

  getSurroundingCellsIndicies([x, y]: CellIndex): [number, number][] {
    return [
      [x - 1, y - 1],
      [x - 1, y],
      [x - 1, y + 1],
      [x, y - 1],
      [x, y + 1],
      [x + 1, y - 1],
      [x + 1, y],
      [x + 1, y + 1],
    ];
  }

  isCellsSurroundedWithFalse(cellIndicies: CellIndex[]) {
    return cellIndicies.every((cell) =>
      this.getSurroundingCellsIndicies(cell)
        .filter(([sx, sy]) =>
          cellIndicies.every(([x, y]) => x !== sx && y !== sy),
        )
        .every(([x, y]) => !this.at([x, y])),
    );
  }

  toDto(): FieldDto {
    return this.field;
  }
}

export class ShipsField {
  private field: Field;

  constructor(field: Field) {
    this.field = field;
  }

  getShipAt([x, y]: CellIndex) {
    if (!this.field.at([x, y])) {
      throw new ShipNotFoundError();
    }
    const horizontalShip: Ship = [[x, y]];
    for (let c = 1; this.field.at([x + c, y]); c++) {
      horizontalShip.push([x + c, y]);
    }
    if (this.field.isCellsSurroundedWithFalse(horizontalShip)) {
      return horizontalShip;
    } else {
      const verticalShip: Ship = [[x, y]];
      for (let c = 1; this.field.at([x, y + c]); c++) {
        verticalShip.push([x, y + c]);
      }
      if (this.field.isCellsSurroundedWithFalse(verticalShip)) {
        return verticalShip;
      }
      throw new CollidingShipError();
    }
  }

  getShips() {
    const ships: Ship[] = [];
    for (let i = 0; i < 10; i++) {
      for (let u = 0; u < 10; u++) {
        if (
          this.field.at([i, u]) ||
          ships.flat().every(([x, y]) => x !== i && y !== u)
        ) {
          ships.push(this.getShipAt([i, u]));
        }
      }
    }
    return ships;
  }
}

export class ShipNotFoundError extends Error {}

export class CollidingShipError extends Error {}
