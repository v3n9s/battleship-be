import { WebSocketServer } from 'ws';
import { connections } from './connection.js';
import config from './config.js';

export const startServer = () => {
  const wsServer = new WebSocketServer({ port: config.port });
  wsServer.on('connection', (socket) => {
    connections.handle({ socket });
  });
};
