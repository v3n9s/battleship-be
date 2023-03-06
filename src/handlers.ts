import { store } from './store.js';
import { ClientMessages, ObjectToUnion, User } from './types/index.js';

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
  ReadyToPlay: ({ user, payload: { roomId } }) => {
    store.getRoom(roomId).readyToPlay(user.id);
  },
  SetPositions: ({ user, payload: { roomId, positions } }) => {
    store.getRoom(roomId).setPositions({ userId: user.id, positions });
  },
  StartGame: ({ payload: { roomId } }) => {
    store.getRoom(roomId).startGame();
  },
  MoveGame: ({ user, payload: { roomId, position } }) => {
    store.getRoom(roomId).getGame().move(user.id, position);
  },
} satisfies {
  [K in keyof ClientMessages]?: Handler<ClientMessages[K]>;
};
