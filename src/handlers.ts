import { store } from './store';
import { ClientMessages, ObjectToUnion, User } from './types';

export type Handler<
  P extends ObjectToUnion<ClientMessages> = ObjectToUnion<ClientMessages>,
> = (args: { user: User; payload: P }) => void;

export const handlers = {
  CreateRoom: ({ user, payload: { name, password } }) => {
    store.createRoom({ name, password, user });
  },
  JoinRoom: ({ user, payload: { roomId, password } }) => {
    store.getRoom(roomId).join({ password, user });
  },
  LeaveRoom: ({ user, payload: { roomId } }) => {
    store.getRoom(roomId).leave(user.id);
  },
  ReadyRoom: ({ user, payload: { roomId } }) => {},
  CreateGame: ({ payload: { roomId } }) => {
    store.getRoom(roomId).createGame();
  },
  ReadyGame: ({ user, payload: { roomId } }) => {},
  SetPositions: ({ user, payload: { roomId, positions } }) => {},
  StartGame: ({ payload: { roomId } }) => {},
} satisfies {
  [K in keyof ClientMessages]: Handler<ClientMessages[K]>;
};
