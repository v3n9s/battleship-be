export type User = {
  id: string;
  name: string;
};

export type Player = User & {
  hasPositions: boolean;
};

export type Room = {
  id: string;
  name: string;
  hasPassword: boolean;
  started: boolean;
  player1: Player;
  player2?: Player | undefined;
};

export type Game = {
  player1: User & {
    attacks: MatrixOf<AttacksCell>;
  };
  player2: User & {
    attacks: MatrixOf<AttacksCell>;
  };
};

export type CellIndex = [number, number];

export type MatrixOf<T extends string> = T[][];

export type PositionsCell = 'empty' | 'ship';

export type AttacksCell = 'empty' | 'miss' | 'hit';

export type UserData = User & {
  token: string;
};
