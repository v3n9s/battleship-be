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
  player1: { user: User; attacks: Field };
  player2: { user: User; attacks: Field };
};

export type Field = boolean[][];

export type UserData = {
  token: string;
  user: User;
};
