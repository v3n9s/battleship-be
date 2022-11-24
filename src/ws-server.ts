import { WebSocketServer } from 'ws';
import { connections } from './ws-connection';

export const startWsServer = (port: number) => {
  const wsServer = new WebSocketServer({ port });

  wsServer.on('connection', (socket) => {
    connections.handle(socket);
  });
};
