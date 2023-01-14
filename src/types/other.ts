export type User = {
  id: string;
  name: string;
};

export type Room = {
  id: string;
  name: string;
  hasPassword: boolean;
  player1: User;
  player2?: User | undefined;
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

export type UserData = {
  token: string;
  user: User;
};
