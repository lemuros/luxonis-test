import { MessageTypeEnum, parseMessageType } from "common/messageBase";
import net from "net";
import {
  AcceptGameRequestMessage,
  BroadcastClientStateMessage,
  ErrorMessage,
  ErrorTypeEnum,
  IdentificationSuccessMessage,
  PostApiKeyMessage,
  PostPasswordMessage,
  PostClientsMessage,
  RejectGameRequestMessage,
  RequestGameWithPlayerMessage,
  RequestIdentificationMessage,
  PostGameSubjectMessage,
  PostGameSubjectReadyMessage,
  CorrectAnswerMessage,
  WrongAnswerMessage,
  PostAnswerMessage,
  RequestGameStateMessage,
  PostGameStateMessage,
  BroadcastGameStateMessage,
} from "common/messages";
import { GameDao } from "./GameDAO";
import { ClientDAO } from "./ClientDao";
import { Client } from "./Client";
import { ClientTypeEnum, ClientStateEnum } from "common/ClientInfo";
import { Game } from "./Game";
import { GAME_MAX_WRONG_ANSWERS } from "common/config";

export class Controller {
  private readonly clientDAO = new ClientDAO();
  private readonly gameDAO = new GameDao();

  public newClient(connection: net.Socket) {
    // create and store new Client
    const clientId = this.clientDAO.getNextId();
    const client = new Client(clientId, connection);
    this.clientDAO.insertClient(client);

    // bind handlers to Client connection
    this.bindConnectionHandlers(client);

    // ask for identification
    const message = RequestIdentificationMessage.serialize({});
    connection.write(message);

    // broadcast new client
    this.broadcastClientState(client);

    console.log(`New Client connected: ${clientId}`);
  }

  private bindConnectionHandlers(client: Client) {
    const handler = (data: Buffer) => this.handleConnectionData(data, client);
    client.connection.on("singleMessage", handler);

    client.connection.on("close", () => {
      client.connection.off("singleMessage", handler);
      this.handleConnectionEnd(client);
    });

    client.connection.on("error", () => {
      client.connection.off("singleMessage", handler);
      this.handleConnectionEnd(client);
    });
  }

  private handleConnectionData(data: Buffer, client: Client) {
    try {
      const type = parseMessageType(data);

      switch (type) {
        case MessageTypeEnum.PostApiKey:
          this.handlePostApiKeyMessage(client, data);
          break;
        case MessageTypeEnum.PostPassword:
          this.handlePostPasswordMessage(client, data);
          break;
        case MessageTypeEnum.RequestClientList:
          this.handleRequestClientListMessage(client);
          break;
        case MessageTypeEnum.RequestGameWithPlayer:
          this.handleRequestGameMessage(data);
          break;
        case MessageTypeEnum.AcceptGameRequest:
          this.handleAcceptGameRequestMessage(data);
          break;
        case MessageTypeEnum.RejectGameRequest:
          this.handleRejectGameRequestMessage(data);
          break;
        case MessageTypeEnum.PostGameSubject:
          this.handlePostGameSubjectMessage(data, client);
          break;
        case MessageTypeEnum.PostAnswer:
          this.handlePostAnswerMessage(data, client);
          break;
        case MessageTypeEnum.RequestGameState:
          this.handleRequestGameStateMessage(data, client);
          break;
        case MessageTypeEnum.Error:
          const message = ErrorMessage.parse(data);
          console.error(`Error: ${message.payload.errorMessage}`);
          break;
        default:
          this.handleUnknownMessageError(
            "Unknown message type",
            client.connection
          );
      }
    } catch (e) {
      console.error(e);
      this.handleUnknownMessageError(
        "Malformed message payload",
        client.connection
      );
    }
  }

  private handleConnectionEnd(client: Client) {
    client.state = ClientStateEnum.DISCONNECTED;
    this.broadcastClientState(client);
    this.clientDAO.removeClient(client.id);

    try {
      const game = this.gameDAO.getGame(client.id);
      if (game.challenger.id !== client.id) {
        game.challenger.state = ClientStateEnum.IN_LOBBY;
      }
      if (game.rival.id !== client.id) {
        game.rival.state = ClientStateEnum.IN_LOBBY;
      }
      this.gameDAO.removeGame(client.id);
    } catch (e) {
      console.error(e);
    }
  }

  private handleUnknownMessageError(
    errorMessage: string,
    connection: net.Socket
  ) {
    const message = ErrorMessage.serialize({
      errorMessage,
      type: ErrorTypeEnum.UnknownMessage,
    });
    connection.write(message);
  }

  private handlePostApiKeyMessage(client: Client, data: Buffer) {
    const message = PostApiKeyMessage.parse(data);

    if (message.payload.apiKey === process.env.API_KEY) {
      client.type = ClientTypeEnum.SPECTATOR;
      client.state = ClientStateEnum.SPECTATING;

      const success = IdentificationSuccessMessage.serialize({
        clientId: client.id,
      });

      client.connection.write(success);
      this.broadcastClientState(client);
      return;
    }

    this.postIdentificationFail(client);
  }

  private handlePostPasswordMessage(client: Client, data: Buffer) {
    const message = PostPasswordMessage.parse(data);

    if (message.payload.password === process.env.PASSWORD) {
      client.type = ClientTypeEnum.PLAYER;
      client.username = message.payload.username;
      const success = IdentificationSuccessMessage.serialize({
        clientId: client.id,
      });
      client.connection.write(success);
      this.broadcastClientState(client);
      return;
    }

    this.postIdentificationFail(client);
  }

  private postIdentificationFail(client: Client) {
    client.state = ClientStateEnum.DISCONNECTED;
    this.broadcastClientState(client);
    const errorResponse = ErrorMessage.serialize({
      errorMessage: "Invalid credentials",
      type: ErrorTypeEnum.InvalidCredentials,
    });
    client.connection.write(errorResponse);
    this.clientDAO.removeClient(client.id);
  }

  private broadcastClientState(client: Client, additionalFilerId?: string) {
    const clientInfo = client.serialize();
    const message = BroadcastClientStateMessage.serialize(clientInfo);
    const clients = this.clientDAO.getClientList();
    for (const receiver of clients) {
      if (receiver.id !== client.id && receiver.id !== additionalFilerId) {
        receiver.connection.write(message);
      }
    }
  }

  private handleRequestClientListMessage(client: Client) {
    const clients = this.clientDAO
      .getClientList()
      .filter((availableClient) => availableClient.id !== client.id)
      .map((availableClient) => availableClient.serialize());

    const message = PostClientsMessage.serialize({ clients });
    client.connection.write(message);
  }

  private handleRequestGameMessage(data: Buffer) {
    const message = RequestGameWithPlayerMessage.parse(data);
    const rival = this.clientDAO.getClient(message.payload.rivalId);
    const challenger = this.clientDAO.getClient(message.payload.challengerId);

    challenger.state = ClientStateEnum.IN_GAME;
    rival.state = ClientStateEnum.IN_GAME;

    const game = new Game(challenger, rival);
    this.gameDAO.insertGame(game);

    rival.connection.write(data);

    this.broadcastClientState(challenger, rival.id);
    this.broadcastClientState(rival, challenger.id);
  }

  private handleAcceptGameRequestMessage(data: Buffer) {
    const message = AcceptGameRequestMessage.parse(data);
    const challenger = this.clientDAO.getClient(message.payload.challengerId);
    challenger.connection.write(data);
  }

  private handleRejectGameRequestMessage(data: Buffer) {
    const message = RejectGameRequestMessage.parse(data);
    const challenger = this.clientDAO.getClient(message.payload.challengerId);
    const rival = this.clientDAO.getClient(message.payload.rivalId);

    challenger.connection.write(data);

    challenger.state = ClientStateEnum.IN_LOBBY;
    rival.state = ClientStateEnum.IN_LOBBY;

    this.broadcastClientState(rival);
    this.broadcastClientState(challenger);
  }

  private handlePostGameSubjectMessage(data: Buffer, client: Client) {
    const message = PostGameSubjectMessage.parse(data);
    const game = this.gameDAO.getGame(client.id);

    game.hint = message.payload.hint;
    game.word = message.payload.word;

    const rival = this.clientDAO.getClient(game.rival.id);
    const response = PostGameSubjectReadyMessage.serialize({
      hint: message.payload.hint,
    });
    this.broadcastGameState(game);
    rival.connection.write(response);
  }

  private handlePostAnswerMessage(data: Buffer, client: Client) {
    const message = PostAnswerMessage.parse(data);

    const game = this.gameDAO.getGame(client.id);
    const challenger = this.clientDAO.getClient(game.challenger.id);
    const rival = this.clientDAO.getClient(game.rival.id);

    game.tries++;

    let response: Buffer;
    if (game.word === message.payload.answer) {
      response = CorrectAnswerMessage.serialize({});
      rival.state = ClientStateEnum.IN_LOBBY;
      challenger.state = ClientStateEnum.IN_LOBBY;
      this.broadcastClientState(rival);
      this.broadcastClientState(challenger);
      game.answers.push({ answer: message.payload.answer, correct: true });
      game.ended = true;
      this.gameDAO.removeGame(challenger.id);
    } else {
      const over = game.tries >= GAME_MAX_WRONG_ANSWERS;
      response = WrongAnswerMessage.serialize({
        answer: message.payload.answer,
        over,
      });
      game.answers.push({ answer: message.payload.answer, correct: false });
      if (over) {
        rival.state = ClientStateEnum.IN_LOBBY;
        challenger.state = ClientStateEnum.IN_LOBBY;
        this.broadcastClientState(rival);
        this.broadcastClientState(challenger);
        game.ended = true;
        this.gameDAO.removeGame(challenger.id);
      }
    }
    this.broadcastGameState(game);
    rival.connection.write(response);
    challenger.connection.write(response);
  }

  private handleRequestGameStateMessage(data: Buffer, client: Client) {
    const message = RequestGameStateMessage.parse(data);
    const game = this.gameDAO.getGame(message.payload.clientId);
    const response = PostGameStateMessage.serialize({ game: game.serialize() });
    client.connection.write(response);
  }

  private broadcastGameState(game: Game) {
    const message = BroadcastGameStateMessage.serialize({
      game: game.serialize(),
    });
    this.clientDAO.getClientList().forEach((client) => {
      client.connection.write(message);
    });
  }
}
