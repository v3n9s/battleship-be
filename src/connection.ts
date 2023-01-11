import { RawData, WebSocket } from 'ws';
import { Handler, handlers } from './handlers';
import { ClientMessageValidatonFuncs } from './schemas';
import {
  ClientMessage,
  ClientMessages,
  ServerMessage,
  ServerMessages,
  UserDto,
} from './types';
import { RoomNotFoundError, store } from './store';
import {
  GameNotStartedYet,
  UserAlreadyInOtherRoomError,
  UserAlreadyInRoomError,
  WrongRoomPasswordError,
} from './room';

class Connections {
  connections: Connection[] = [];

  constructor() {
    store.on('roomCreated', this.sendArgAsPayloadToEveryone('RoomCreated'));

    store.on('roomJoin', this.sendArgAsPayloadToEveryone('RoomJoin'));

    store.on('roomLeave', this.sendArgAsPayloadToEveryone('RoomLeave'));

    store.on('roomDelete', this.sendArgAsPayloadToEveryone('RoomDelete'));

    store.on('roomReady', this.sendArgAsPayloadToEveryone('RoomReady'));

    store.on('gameReady', this.sendArgAsPayloadToEveryone('GameReady'));
  }

  handle(...args: ConstructorParameters<typeof Connection>) {
    this.connections.push(new Connection(...args));
  }

  sendArgAsPayloadToEveryone<T extends keyof ServerMessages>(type: T) {
    return (payload: ServerMessages[T]) => {
      this.connections.forEach((conn) => {
        conn.send({ type, payload } as ServerMessage);
      });
    };
  }
}

export const connections = new Connections();

class Connection {
  id: string;

  name: string;

  socket: WebSocket;

  get session() {
    return { id: this.id, name: this.name };
  }

  constructor({ session, socket }: { session: UserDto; socket: WebSocket }) {
    this.id = session.id;
    this.name = session.name;
    this.socket = socket;

    this.socket.on('message', this.onMessage.bind(this));

    this.send({
      type: 'ExistingRooms',
      payload: store.getRooms().map((r) => r.toDto()),
    });
  }

  send(message: ServerMessage) {
    this.socket.send(JSON.stringify(message));
  }

  isExistingClientMessage(message: unknown): message is {
    type: keyof ClientMessages;
  } {
    if (
      message &&
      typeof message === 'object' &&
      'type' in message &&
      typeof message.type === 'string' &&
      message.type in ClientMessageValidatonFuncs
    ) {
      return true;
    }
    return false;
  }

  isValidClientMessage(message: {
    type: keyof ClientMessages;
  }): message is ClientMessage {
    const payload = 'payload' in message ? message.payload : {};
    return ClientMessageValidatonFuncs[message.type](payload);
  }

  onMessage(data: RawData, isBin: boolean) {
    if (isBin || !(data instanceof Buffer)) {
      this.send({
        type: 'Error',
        payload: { text: 'Not supported message payload' },
      });
      return;
    }
    let message: unknown;
    try {
      message = JSON.parse(data.toString());
    } catch {
      this.send({
        type: 'Error',
        payload: { text: 'Unable to parse message' },
      });
      return;
    }

    if (!this.isExistingClientMessage(message)) {
      this.send({
        type: 'Error',
        payload: { text: 'Not supported message type' },
      });
      return;
    }

    if (!this.isValidClientMessage(message)) {
      this.send({
        type: 'Error',
        payload: { text: 'Message data is wrong' },
      });
      return;
    }

    try {
      (handlers[message.type] as Handler)({
        user: this.session,
        payload: message.payload,
      });
    } catch (e) {
      if (e instanceof RoomNotFoundError) {
        this.send({
          type: 'Error',
          payload: { text: 'Room not found' },
        });
      } else if (e instanceof WrongRoomPasswordError) {
        this.send({
          type: 'Error',
          payload: { text: 'Wrong room password' },
        });
      } else if (e instanceof UserAlreadyInRoomError) {
        this.send({
          type: 'Error',
          payload: { text: 'User already in room' },
        });
      } else if (e instanceof UserAlreadyInOtherRoomError) {
        this.send({
          type: 'Error',
          payload: { text: 'User already in other room' },
        });
      } else if (e instanceof GameNotStartedYet) {
        this.send({
          type: 'Error',
          payload: { text: 'Game not started yet' },
        });
      }
    }
  }
}
