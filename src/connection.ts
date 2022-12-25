import { RawData, WebSocket } from 'ws';
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
  CreateRoomMessage,
  JoinRoomMessage,
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

    this.handleMessage(message);
  }

  handleMessage(message: ClientMessage) {
    if (message.type === 'CreateRoom') {
      this.createRoom(message.payload);
    } else if (message.type === 'JoinRoom') {
      this.joinRoom(message.payload);
    }
  }

  createRoom({ name, password }: CreateRoomMessage) {
    try {
      rooms.createRoom({ name, password, creator: this.session });
    } catch (e) {
      if (e instanceof UserAlreadyInOtherRoomError) {
        this.send({
          type: 'Error',
          payload: { text: 'User already in other room' },
        });
      }
    }
  }

  joinRoom(message: JoinRoomMessage) {
    try {
      rooms.joinRoom({
        roomId: message.id,
        roomPassword: message.password,
        user: this.session,
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
      }
    }
  }
}
