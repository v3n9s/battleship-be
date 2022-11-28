import { RawData, WebSocket } from 'ws';
import {
  ServerMessage,
  ServerMessageTypes,
  ClientMessage,
  isValidClientMessage,
  isExistingClientMessage,
} from './messages';

class Connections {
  connections: Connection[] = [];

  handle(socket: WebSocket) {
    this.connections.push(new Connection(socket));
  }
}

export const connections = new Connections();

class Connection {
  socket: WebSocket;

  constructor(socket: WebSocket) {
    this.socket = socket;

    this.socket.on('message', this.onMessage.bind(this));
  }

  send(message: ServerMessage) {
    this.socket.send(JSON.stringify(message));
  }

  onMessage(data: RawData, isBin: boolean) {
    if (isBin || !(data instanceof Buffer)) {
      this.send({
        type: ServerMessageTypes.Error,
        text: 'Not supported message payload',
      });
      return;
    }
    let message: unknown;
    try {
      message = JSON.parse(data.toString());
    } catch {
      this.send({
        type: ServerMessageTypes.Error,
        text: 'Unable to parse message',
      });
      return;
    }

    if (!isExistingClientMessage(message)) {
      this.send({
        type: ServerMessageTypes.Error,
        text: 'Not supported message type',
      });
      return;
    }

    if (!isValidClientMessage(message)) {
      this.send({
        type: ServerMessageTypes.Error,
        text: 'Message data is wrong',
      });
      return;
    }

    this.handleMessage(message);
  }

  handleMessage(message: ClientMessage) {}
}
