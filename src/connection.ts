import crypto from 'crypto';
import { RawData, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { Handler, handlers } from './handlers';
import {
  ClientMessageValidatonFuncs,
  nameValidationFunc,
  userValidationFunc,
} from './schemas';
import {
  ClientMessage,
  ClientMessages,
  Field,
  GetTokenMessage,
  ServerMessage,
  ServerMessages,
  SubmitTokenMessage,
  User,
  UserData,
} from './types';
import { RoomNotFoundError, store } from './store';
import {
  GameNotStartedYetError,
  InvalidFieldError,
  RoomIsBusyError,
  UserAlreadyInOtherRoomError,
  UserAlreadyInRoomError,
  WrongRoomPasswordError,
} from './room';
import { TypedEmitter } from 'tiny-typed-emitter';
import config from './config';

class Connections {
  connections: Connection[] = [];

  constructor() {
    store.on('roomCreate', this.sendArgAsPayloadToEveryone('RoomCreate'));

    store.on('roomJoin', this.sendArgAsPayloadToEveryone('RoomJoin'));

    store.on('roomLeave', this.sendArgAsPayloadToEveryone('RoomLeave'));

    store.on('roomDelete', this.sendArgAsPayloadToEveryone('RoomDelete'));

    store.on(
      'roomPositionsSet',
      this.sendArgAsPayloadToEveryone('RoomPositionsSet'),
    );

    store.on(
      'roomReadyToPlay',
      this.sendArgAsPayloadToEveryone('RoomReadyToPlay'),
    );

    store.on('gameStart', this.sendArgAsPayloadToEveryone('GameStart'));

    store.on('gameHit', this.sendArgAsPayloadToEveryone('GameHit'));

    store.on('gameMiss', this.sendArgAsPayloadToEveryone('GameMiss'));

    store.on('gameEnd', this.sendArgAsPayloadToEveryone('GameEnd'));
  }

  handle(...args: ConstructorParameters<typeof Connection>) {
    const connection = new Connection(...args);
    connection.once('close', () => {
      this.connections = this.connections.filter((conn) => conn !== connection);
    });
    this.connections.push(connection);
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

class Connection extends TypedEmitter<{
  close: () => void;
}> {
  socket: WebSocket;

  session: UserData | null = null;

  constructor({ socket }: { socket: WebSocket }) {
    super();
    this.socket = socket;

    this.socket.on('message', this.onMessage.bind(this));
    this.socket.once('close', () => {
      this.emit('close');
    });

    this.send({
      type: 'ExistingRooms',
      payload: store.getRooms().map((r) => r.toDto()),
    });
  }

  send(message: ServerMessage) {
    this.socket.send(JSON.stringify(message));
  }

  isExistingClientMessage(message: unknown): message is {
    type: keyof ClientMessages;
  } {
    return (
      !!message &&
      typeof message === 'object' &&
      'type' in message &&
      typeof message.type === 'string' &&
      message.type in ClientMessageValidatonFuncs
    );
  }

  isValidClientMessage(message: {
    type: keyof ClientMessages;
  }): message is ClientMessage {
    const payload = 'payload' in message ? message.payload : {};
    return ClientMessageValidatonFuncs[message.type](payload);
  }

  isValidTokenSignature(token: string) {
    try {
      jwt.verify(token, config.jwtSecret);
      return true;
    } catch {
      return false;
    }
  }

  handleGetTokenMessage({ name }: GetTokenMessage) {
    if (!nameValidationFunc(name)) {
      this.send({
        type: 'Error',
        payload: { text: 'Invalid name property' },
      });
      return;
    }
    const user: User = {
      id: crypto.randomUUID(),
      name,
    };
    this.send({
      type: 'TokenCreate',
      payload: {
        ...user,
        token: jwt.sign(user, config.jwtSecret),
      },
    });
  }

  handleSubmitTokenMessage({ token }: SubmitTokenMessage) {
    if (token === null) {
      this.session = null;
      this.send({ type: 'TokenSet', payload: null });
      return;
    }
    let payload: unknown;
    if (
      !this.isValidTokenSignature(token) ||
      !userValidationFunc((payload = jwt.decode(token)))
    ) {
      this.send({
        type: 'Error',
        payload: { text: 'Invalid token signature or payload' },
      });
      return;
    }
    this.session = {
      id: payload.id,
      name: payload.name,
      token,
    };
    this.send({ type: 'TokenSet', payload: this.session });

    this.send({
      type: 'ExistingPositions',
      payload: Object.fromEntries(
        store
          .getRooms()
          .map(
            (room) =>
              [
                room.id,
                this.session && this.session.id === room.player1.id
                  ? room.player1.positions?.toDto()
                  : this.session && this.session.id === room.player2?.id
                  ? room.player2?.positions?.toDto()
                  : null,
              ] as [string, Field | null],
          )
          .filter(([, positions]) => positions) as [string, Field][],
      ),
    });
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

    if (message.type === 'GetToken') {
      this.handleGetTokenMessage(message.payload);
      return;
    }

    if (message.type === 'SubmitToken') {
      this.handleSubmitTokenMessage(message.payload);
      return;
    }

    if (!this.session) {
      this.send({ type: 'Error', payload: { text: 'You are not logged in' } });
      return;
    }

    try {
      (handlers[message.type] as Handler)({
        user: this.session,
        payload: message.payload,
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
      } else if (e instanceof RoomIsBusyError) {
        this.send({
          type: 'Error',
          payload: { text: "Can't join, room is full" },
        });
      } else if (e instanceof UserAlreadyInOtherRoomError) {
        this.send({
          type: 'Error',
          payload: { text: 'User already in other room' },
        });
      } else if (e instanceof GameNotStartedYetError) {
        this.send({
          type: 'Error',
          payload: { text: 'Game not started yet' },
        });
      } else if (e instanceof InvalidFieldError) {
        this.send({
          type: 'Error',
          payload: { text: 'Invalid ships positions' },
        });
      }
    }
  }
}
