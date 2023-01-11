import { store } from './store';
import { ClientMessages, ObjectToUnion, User } from './types';

export type Handler<
  P extends ObjectToUnion<ClientMessages> = ObjectToUnion<ClientMessages>,
> = (args: { user: User; payload: P }) => void;

export const handlers = {
  CreateRoom: ({ user, payload: { name, password } }) => {
    store.createRoom({ name, password, user });
  },
  JoinRoom: ({ user, payload: { id, password } }) => {
    store.getRoom(id).join({ password, user });
  },
  LeaveRoom: ({ user, payload: { id } }) => {
    store.getRoom(id).leave(user.id);
  },
  ReadyRoom: ({ user, payload: { roomId } }) => {
    store.getRoom(roomId).ready(user.id);
  },
  ReadyGame: ({ user, payload: { roomId } }) => {
    store.getRoom(roomId).ready(user.id);
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
