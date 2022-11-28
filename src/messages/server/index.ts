import { ErrorMessage, SetTokenMessage } from './messages';

export type ServerMessages = {
  Error: ErrorMessage;
  SetToken: SetTokenMessage;
};
