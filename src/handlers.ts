import { Field } from './game';
import { rooms } from './room';
import { ClientMessages, ObjectToUnion, UserDto } from './types';

export type Handler<
  P extends ObjectToUnion<ClientMessages> = ObjectToUnion<ClientMessages>,
> = (args: { user: UserDto; payload: P }) => void;

export const handlers = {
  CreateRoom: ({ user, payload }) => {
    rooms.createRoom({
      name: payload.name,
      password: payload.name,
      creator: user,
    });
  },
  JoinRoom: ({ user, payload }) => {
    rooms.joinRoom({
      roomId: payload.id,
      roomPassword: payload.password,
      user,
    });
  },
  LeaveRoom: ({ user, payload }) => {
    rooms.leaveRoom({ roomId: payload.id, user });
  },
  ReadyGame: ({ user, payload }) => {
    rooms.readyGame({ roomId: payload.roomId, user });
  },
  ReadyRoom: ({ user, payload }) => {
    rooms.readyRoom({ roomId: payload.roomId, user });
  },
  SetPositions: ({ user, payload }) => {
    rooms.setPositions({
      roomId: payload.roomId,
      positions: new Field({ field: payload.positions }),
      user,
    });
  },
} satisfies {
  [K in keyof ClientMessages]: Handler<ClientMessages[K]>;
};
