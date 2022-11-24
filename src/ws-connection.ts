import { RawData, WebSocket } from 'ws';

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

  onMessage(data: RawData, isBin: boolean) {
    if (isBin || !(data instanceof Buffer)) {
      return;
    }
    let message: unknown;
    try {
      message = JSON.parse(data.toString());
    } catch {
      return;
    }

    this.handleMessage(message);
  }

  handleMessage(message: unknown) {}
}
