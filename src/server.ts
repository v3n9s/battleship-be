import http from 'http';
import jwt from 'jsonwebtoken';
import { WebSocketServer } from 'ws';
import { connections, tokenPayloadValidationFunc } from './ws-connection';
import config from './config';
import internal from 'stream';

export const startServer = () => {
  const server = http.createServer();
  server.listen(config.port);
  const wsServer = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    if (!req.url) {
      abortUpgrade(socket);
      return;
    }
    const searchParams = req.url.replace(/.*\?/g, '');
    const token = new URLSearchParams(searchParams).get('token');
    let payload: unknown;
    if (
      !token ||
      !isValidTokenSignature(token) ||
      !tokenPayloadValidationFunc((payload = jwt.decode(token)))
    ) {
      abortUpgrade(socket);
      return;
    }
    const { id, name } = payload;
    wsServer.handleUpgrade(req, socket, head, (ws) => {
      wsServer.emit('connection', ws, req);
      connections.handle({ session: { id, name }, socket: ws });
    });
  });
};

const abortUpgrade = (socket: internal.Duplex) => {
  socket.write('HTTP/1.1 401 \r\n\r\n');
  socket.destroy();
};

const isValidTokenSignature = (token: string) => {
  try {
    jwt.verify(token, config.jwtSecret);
    return true;
  } catch {
    return false;
  }
};
