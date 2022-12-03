import crypto from 'crypto';
import http from 'http';
import jwt from 'jsonwebtoken';
import { WebSocketServer } from 'ws';
import { connections, tokenPayloadValidationFunc } from './connection';
import config from './config';
import { JSONSchemaType } from 'ajv';
import { ajv } from './ajv-instance';

export const startServer = () => {
  const server = http.createServer(requestHandler);
  server.listen(config.port);
  const wsServer = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    const token = urlSearchParamsFrom(req.url).get('token');
    let payload: unknown;
    if (
      !token ||
      !isValidTokenSignature(token) ||
      !tokenPayloadValidationFunc((payload = jwt.decode(token)))
    ) {
      socket.write('HTTP/1.1 401 \r\n\r\n');
      socket.destroy();
      return;
    }
    const { id, name } = payload;
    wsServer.handleUpgrade(req, socket, head, (ws) => {
      wsServer.emit('connection', ws, req);
      connections.handle({ session: { id, name }, socket: ws });
    });
  });
};

const requestHandler: http.RequestListener = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.url?.startsWith('/token') && req.method === 'POST') {
    createTokenHandler(req, res);
  } else {
    res.writeHead(404);
    res.end();
  }
};

const createTokenHandler: http.RequestListener = (req, res) => {
  const name = urlSearchParamsFrom(req.url).get('name');
  if (!userNameValidationFunc(name)) {
    res.writeHead(400);
    res.end();
    return;
  }
  res.write(JSON.stringify({ token: getToken(name) }));
  res.end();
};

const urlSearchParamsFrom = (url = '') => {
  return new URLSearchParams(url.replace(/.*\?/g, ''));
};

const isValidTokenSignature = (token: string) => {
  try {
    jwt.verify(token, config.jwtSecret);
    return true;
  } catch {
    return false;
  }
};

const getToken = (name: string) =>
  jwt.sign({ id: crypto.randomUUID(), name }, config.jwtSecret);

const userNameSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 32,
};

const userNameValidationFunc = ajv.compile(userNameSchema);
