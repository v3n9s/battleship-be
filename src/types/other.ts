export type User = {
  id: string;
  name: string;
};

export type Room = {
  id: string;
  name: string;
  password: string;
  player1: User;
  player2?: User;
};
