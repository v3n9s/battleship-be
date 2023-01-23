export type User = {
  id: string;
  name: string;
};

export type Player = User & {
  readyToPlay: boolean;
};

export type Room = {
  id: string;
  name: string;
  hasPassword: boolean;
  player1: Player;
  player2?: Player | undefined;
};

export type Game = {
  player1: User & {
    attacks: Field;
  };
  player2: User & {
    attacks: Field;
  };
};

export type Field = boolean[][];

export type UserData = User & {
  token: string;
};
