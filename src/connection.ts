import { RawData, WebSocket } from 'ws';
import {
  ServerMessage,
  ServerMessageTypes,
  ClientMessage,
  ClientMessageTypes,
  ClientMessageValidatonFuncs,
  CreateRoomMessage,
  JoinRoomMessage,
  ClientMessages,
} from './messages';
import { RoomNotFoundError, rooms, WrongRoomPasswordError } from './room';
import { User } from './types';

class Connections {
  connections: Connection[] = [];

  constructor() {
    rooms.on('roomCreated', (room) => {
      this.connections.forEach((conn) => {
        conn.send({ type: ServerMessageTypes.RoomCreated, payload: room });
      });
    });

    rooms.on('roomJoin', (payload) => {
      this.connections.forEach((conn) => {
        conn.send({ type: ServerMessageTypes.RoomJoin, payload });
      });
    });
  }

  handle(...args: ConstructorParameters<typeof Connection>) {
    this.connections.push(new Connection(...args));
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

  constructor({ session, socket }: { session: User; socket: WebSocket }) {
    this.id = session.id;
    this.name = session.name;
    this.socket = socket;

    this.socket.on('message', this.onMessage.bind(this));
  }

  send(message: ServerMessage) {
    this.socket.send(JSON.stringify(message));
  }

  isExistingClientMessage(message: unknown): message is {
    type: keyof typeof ClientMessageTypes;
    payload: unknown;
  } {
    if (
      !(
        message &&
        typeof message === 'object' &&
        'type' in message &&
        typeof message.type === 'string' &&
        'payload' in message
      )
    ) {
      return false;
    }
    const type =
      ClientMessageTypes[message.type as keyof typeof ClientMessageTypes];
    if (!type) return false;
    return true;
  }

  isValidClientMessage(message: {
    type: keyof ClientMessages;
  }): message is ClientMessage {
    return ClientMessageValidatonFuncs[message.type](message);
  }

  onMessage(data: RawData, isBin: boolean) {
    if (isBin || !(data instanceof Buffer)) {
      this.send({
        type: ServerMessageTypes.Error,
        payload: { text: 'Not supported message payload' },
      });
      return;
    }
    let message: unknown;
    try {
      message = JSON.parse(data.toString());
    } catch {
      this.send({
        type: ServerMessageTypes.Error,
        payload: { text: 'Unable to parse message' },
      });
      return;
    }

    if (!this.isExistingClientMessage(message)) {
      this.send({
        type: ServerMessageTypes.Error,
        payload: { text: 'Not supported message type' },
      });
      return;
    }

    if (!this.isValidClientMessage(message)) {
      this.send({
        type: ServerMessageTypes.Error,
        payload: { text: 'Message data is wrong' },
      });
      return;
    }

    this.handleMessage(message);
  }

  handleMessage(message: ClientMessage) {
    if (message.type === ClientMessageTypes.CreateRoom) {
      this.createRoom(message.payload);
    } else if (message.type === ClientMessageTypes.JoinRoom) {
      this.joinRoom(message.payload);
    }
  }

  createRoom({ name, password }: CreateRoomMessage) {
    rooms.createRoom({ name, password, creator: this.session });
  }

  joinRoom(message: JoinRoomMessage) {
    try {
      rooms.joinRoom({
        roomId: message.id,
        roomPassword: message.password,
        userId: this.session.id,
        userName: this.session.name,
      });
    } catch (e) {
      if (e instanceof RoomNotFoundError) {
        this.send({
          type: ServerMessageTypes.Error,
          payload: { text: 'Room not found' },
        });
      } else if (e instanceof WrongRoomPasswordError) {
        this.send({
          type: ServerMessageTypes.Error,
          payload: { text: 'Wrong room password' },
        });
      }
    }
  }
}
