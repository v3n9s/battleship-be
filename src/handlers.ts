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
  ReadyRoom: ({ user, payload: { roomId } }) => {
    store.getRoom(roomId).ready(user.id);
  },
  ReadyGame: ({ user, payload: { roomId } }) => {
    store.getRoom(roomId).getGame().ready(user.id);
  },
  SetPositions: ({ user, payload: { roomId, positions } }) => {
    store
      .getRoom(roomId)
      .getGame()
      .setPositions({ userId: user.id, positions });
  },
} satisfies {
  [K in keyof ClientMessages]: Handler<ClientMessages[K]>;
};
