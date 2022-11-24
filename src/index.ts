import config from './config';
import { startWsServer } from './ws-server';

startWsServer(config.port);
