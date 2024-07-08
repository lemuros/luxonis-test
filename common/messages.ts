import { ClientInfo } from "./ClientInfo";
import { GameInfo } from "./GameInfo";
import { MessageTypeEnum, messageClassFactory } from "./messageBase";

export enum ErrorTypeEnum {
  Generic,
  UnknownMessage,
  InvalidCredentials,
}

export const ErrorMessage = messageClassFactory<{
  errorMessage: string;
  type: ErrorTypeEnum;
}>(MessageTypeEnum.Error);

export const RequestIdentificationMessage = messageClassFactory<{}>(
  MessageTypeEnum.RequestIdentification
);

export const IdentificationSuccessMessage = messageClassFactory<{
  clientId: string;
}>(MessageTypeEnum.IdentificationSuccess);

export const PostPasswordMessage = messageClassFactory<{
  password: string;
  username: string;
}>(MessageTypeEnum.PostPassword);

export const PostApiKeyMessage = messageClassFactory<{
  apiKey: string;
}>(MessageTypeEnum.PostApiKey);

export const RequestClientListMessage = messageClassFactory<{}>(
  MessageTypeEnum.RequestClientList
);

export const PostClientsMessage = messageClassFactory<{
  clients: ClientInfo[];
}>(MessageTypeEnum.PostClients);

export const RequestGameWithPlayerMessage = messageClassFactory<{
  challengerId: string;
  rivalId: string;
}>(MessageTypeEnum.RequestGameWithPlayer);

export const AcceptGameRequestMessage = messageClassFactory<{
  challengerId: string;
  rivalId: string;
}>(MessageTypeEnum.AcceptGameRequest);

export const RejectGameRequestMessage = messageClassFactory<{
  challengerId: string;
  rivalId: string;
}>(MessageTypeEnum.RejectGameRequest);

export const BroadcastClientStateMessage = messageClassFactory<ClientInfo>(
  MessageTypeEnum.BroadcastClientState
);

export const PostGameSubjectMessage = messageClassFactory<{
  word: string;
  hint: string;
}>(MessageTypeEnum.PostGameSubject);

export const PostGameSubjectReadyMessage = messageClassFactory<{
  hint: string;
}>(MessageTypeEnum.PostGameSubjectReady);

export const PostAnswerMessage = messageClassFactory<{
  answer: string;
}>(MessageTypeEnum.PostAnswer);

export const WrongAnswerMessage = messageClassFactory<{
  answer: string;
  over: boolean;
}>(MessageTypeEnum.WrongAnswer);

export const CorrectAnswerMessage = messageClassFactory<{}>(
  MessageTypeEnum.CorrectAnswer
);

export const RequestGameStateMessage = messageClassFactory<{
  clientId: string;
}>(MessageTypeEnum.RequestGameState);

export const PostGameStateMessage = messageClassFactory<{
  game: GameInfo;
}>(MessageTypeEnum.PostGameState);

export const BroadcastGameStateMessage = messageClassFactory<{
  game: GameInfo;
}>(MessageTypeEnum.BroadcastGameState);
