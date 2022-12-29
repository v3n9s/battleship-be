export type UserDto = {
  id: string;
  name: string;
};

export type RoomDto = {
  id: string;
  name: string;
  hasPassword: boolean;
  player1: UserDto;
  player2?: UserDto | undefined;
};

export type GameDto = {
  player1: { user: UserDto; attacks: FieldDto };
  player2: { user: UserDto; attacks: FieldDto };
};

export type FieldDto = boolean[][];

export type UserData = {
  token: string;
  user: UserDto;
};
