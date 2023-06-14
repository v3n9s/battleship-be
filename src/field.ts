import { getFieldOf } from './ships-field.js';
import { CellIndex, MatrixOf } from './types/index.js';

export class Field<T extends string> {
  private outRange: T;

  private field: MatrixOf<T>;

  constructor(outRange: T, field?: MatrixOf<T>) {
    this.outRange = outRange;
    this.field = field || getFieldOf(outRange);
  }

  at([rowInd, colInd]: CellIndex) {
    return this.field[rowInd]?.[colInd] ?? this.outRange;
  }

  set([rowInd, colInd]: CellIndex, value: T) {
    const col = this.field[rowInd];
    if (col && colInd in col) {
      col[colInd] = value;
    }
  }

  toDto(): MatrixOf<T> {
    return this.field;
  }
}
