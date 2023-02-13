import { WebSocketServer } from 'ws';
import { connections } from './connection';
import config from './config';

export const startServer = () => {
  const wsServer = new WebSocketServer({ port: config.port });
  wsServer.on('connection', (socket) => {
    connections.handle({ socket });
  });
};
