import { Field } from './field.js';
import { CellIndex, MatrixOf, PositionsCell, Ship } from './types/other.js';

export const isSameCell = (
  [cell1Row, cell1Col]: CellIndex,
  [cell2Row, cell2Col]: CellIndex,
) => cell1Row === cell2Row && cell1Col === cell2Col;

const getCellsAroundCell = ([rowInd, colInd]: CellIndex): CellIndex[] => {
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
};

const getCellsAroundCells = (cells: CellIndex[]): CellIndex[] => {
  return cells
    .map((cell) => getCellsAroundCell(cell))
    .flat()
    .reduce<CellIndex[]>((acc, cell) => {
      if (!cells.find((innerCell) => isSameCell(innerCell, cell))) {
        acc.push(cell);
      }
      return acc;
    }, []);
};

const getCellIndiciesWith = <
  T extends MatrixOf<string> extends MatrixOf<infer S> ? S : never,
>(
  field: MatrixOf<T>,
  cell: T,
) => {
  return field
    .map((a, rowInd) =>
      a.map((v, colInd) =>
        v === cell ? ([rowInd, colInd] as CellIndex) : null,
      ),
    )
    .flat()
    .filter((v): v is CellIndex => !!v);
};

const getRowedCells = (indicies: CellIndex[]) => {
  const ships: Ship[] = [];
  for (const [cellRow, cellCol] of indicies) {
    if (
      ships
        .flat()
        .find((searchCell) => isSameCell(searchCell, [cellRow, cellCol]))
    ) {
      continue;
    }
    const ship: Ship = [[cellRow, cellCol]];
    const isHorizontal = !!indicies.find(
      ([cellRowSearch, cellColSearch]) =>
        cellRowSearch === cellRow + 1 && cellColSearch === cellCol,
    );
    let c = 1;
    for (const innerCell of indicies) {
      if (
        isHorizontal
          ? isSameCell(innerCell, [cellRow + c, cellCol])
          : isSameCell(innerCell, [cellRow, cellCol + c])
      ) {
        c++;
        ship.push(innerCell);
      }
    }
    ships.push(ship);
  }
  return ships;
};

export const getShips = (field: Field<PositionsCell>) => {
  return getRowedCells(getCellIndiciesWith(field.toDto(), 'ship'));
};

const doShipsHaveGaps = (ships: Ship[]) => {
  return ships
    .map((ship) => getCellsAroundCells(ship))
    .flat()
    .every((gap) =>
      ships.flat().every((shipCell) => !isSameCell(gap, shipCell)),
    );
};

export const isValidShipsField = (field: MatrixOf<PositionsCell>) => {
  const rowedCells = getRowedCells(getCellIndiciesWith(field, 'ship'));
  const shipsLengths = rowedCells.map(({ length }) => length);
  return (
    doShipsHaveGaps(rowedCells) &&
    shipsLengths.every((v) => [1, 2, 3, 4].includes(v)) &&
    shipsLengths.filter((v) => v === 1).length === 4 &&
    shipsLengths.filter((v) => v === 2).length === 3 &&
    shipsLengths.filter((v) => v === 3).length === 2 &&
    shipsLengths.filter((v) => v === 4).length === 1
  );
};
