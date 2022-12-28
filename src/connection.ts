import { RawData, WebSocket } from 'ws';
import { Field } from './game';
import {
  RoomNotFoundError,
  rooms,
  UserAlreadyInOtherRoomError,
  UserAlreadyInRoomError,
  WrongRoomPasswordError,
} from './room';
import { ClientMessageValidatonFuncs } from './schemas';
import {
  ClientMessage,
  ClientMessages,
  ServerMessage,
  ServerMessages,
  UserDto,
} from './types';

class Connections {
  connections: Connection[] = [];

  constructor() {
    rooms.on('roomCreated', this.sendArgAsPayloadToEveryone('RoomCreated'));

    rooms.on('roomJoin', this.sendArgAsPayloadToEveryone('RoomJoin'));

    rooms.on('roomLeave', this.sendArgAsPayloadToEveryone('RoomLeave'));

    rooms.on('roomDelete', this.sendArgAsPayloadToEveryone('RoomDelete'));
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
      payload: rooms.list.map((r) => r.toDto()),
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
      this.handleMessage(message);
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
      }
    }
  }

  handleMessage({ type, payload }: ClientMessage) {
    if (type === 'CreateRoom') {
      rooms.createRoom({
        name: payload.name,
        password: payload.name,
        creator: this.session,
      });
    } else if (type === 'JoinRoom') {
      rooms.joinRoom({
        roomId: payload.id,
        roomPassword: payload.password,
        user: this.session,
      });
    } else if (type === 'LeaveRoom') {
      rooms.leaveRoom({ roomId: payload.id, user: this.session });
    } else if (type === 'ReadyRoom') {
      rooms.readyRoom({ roomId: payload.roomId, user: this.session });
    } else if (type === 'SetPositions') {
      rooms.setPositions({
        roomId: payload.roomId,
        positions: new Field({ field: payload.positions }),
        user: this.session,
      });
    } else if (type === 'ReadyGame') {
      rooms.readyGame({ roomId: payload.roomId, user: this.session });
    }
  }
}
