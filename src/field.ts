import { Field as FieldDto } from './types';

export type CellIndex = [number, number];

type Ship = CellIndex[];

export class Field {
  private field: boolean[][];

  constructor(
    field = new Array(10).fill(new Array(10).fill(false)) as boolean[][],
  ) {
    this.field = field;
  }

  at([rowInd, colInd]: CellIndex) {
    return !!this.field[rowInd]?.[colInd];
  }

  set([rowInd, colInd]: CellIndex, value: boolean) {
    const col = this.field[rowInd];
    if (col && colInd in col) {
      col[colInd] = value;
    }
  }

  getSurroundingCellsIndicies([rowInd, colInd]: CellIndex): [number, number][] {
    return [
      [rowInd - 1, colInd - 1],
      [rowInd - 1, colInd],
      [rowInd - 1, colInd + 1],
      [rowInd, colInd - 1],
      [rowInd, colInd + 1],
      [rowInd + 1, colInd - 1],
      [rowInd + 1, colInd],
      [rowInd + 1, colInd + 1],
    ];
  }

  isCellsSurroundedWithFalse(cellIndicies: CellIndex[]) {
    return cellIndicies.every((cell) =>
      this.getSurroundingCellsIndicies(cell)
        .filter(
          ([sx, sy]) => !cellIndicies.some(([x, y]) => x === sx && y === sy),
        )
        .every(([x, y]) => !this.at([x, y])),
    );
  }

  getShipAt([rowInd, colInd]: CellIndex) {
    if (!this.at([rowInd, colInd])) {
      throw new ShipNotFoundError();
    }
    const horizontalShip: Ship = [[rowInd, colInd]];
    for (let c = 1; this.at([rowInd, colInd + c]); c++) {
      horizontalShip.push([rowInd, colInd + c]);
    }
    if (this.isCellsSurroundedWithFalse(horizontalShip)) {
      return horizontalShip;
    } else {
      const verticalShip: Ship = [[rowInd, colInd]];
      for (let c = 1; this.at([rowInd + c, colInd]); c++) {
        verticalShip.push([rowInd + c, colInd]);
      }
      if (this.isCellsSurroundedWithFalse(verticalShip)) {
        return verticalShip;
      }
      throw new CollidingShipError();
    }
  }

  getShips() {
    const ships: Ship[] = [];
    for (let rowInd = 0; rowInd < 10; rowInd++) {
      for (let colInd = 0; colInd < 10; colInd++) {
        if (
          this.at([rowInd, colInd]) &&
          !ships
            .flat()
            .some(
              ([shipRowInd, shipColInd]) =>
                shipRowInd === rowInd && shipColInd === colInd,
            )
        ) {
          ships.push(this.getShipAt([rowInd, colInd]));
        }
      }
    }
    return ships;
  }

  toDto(): FieldDto {
    return this.field;
  }
}

export class ShipNotFoundError extends Error {}

export class CollidingShipError extends Error {}
