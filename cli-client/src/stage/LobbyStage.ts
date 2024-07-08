import net from "net";
import { CliPlayerController } from "../CliPlayerController";
import {
  BroadcastClientStateMessage,
  PostClientsMessage,
  RequestClientListMessage,
  RequestGameWithPlayerMessage,
} from "common/messages";
import { MessageTypeEnum, parseMessageType } from "common/messageBase";
import { AbstractStage } from "./AbstractStage";
import { ClientState } from "../ClientState";
import { ClientInfo, ClientStateEnum, ClientTypeEnum } from "common/ClientInfo";
import { cli } from "../Cli";
import { GameRequestStage } from "./GameRequestStage";
import { WaitForGameStage } from "./WaitForGameStage";

export class LobbyStage extends AbstractStage {
  private clients = new Map<string, ClientInfo>();
  private readonly client: ClientState;
  private listInfo?: string;

  constructor(
    connection: net.Socket,
    client: ClientState,
    controller: CliPlayerController
  ) {
    super("In Lobby", connection, controller);
    this.client = client;
  }

  public initialize(): void {
    const message = RequestClientListMessage.serialize({});
    this.connection.write(message);
  }

  public handleConnectionData(data: Buffer) {
    const type = parseMessageType(data);
    switch (type) {
      case MessageTypeEnum.PostClients:
        this.handlePostAvailablePlayersMessage(data);
        break;
      case MessageTypeEnum.BroadcastClientState:
        this.handleBroadcastClientStateMessage(data);
        break;
      case MessageTypeEnum.RequestGameWithPlayer:
        this.handleRequestGameWithPlayerMessage(data);
        break;
    }
  }

  private async handleRequestGameWithPlayerMessage(data: Buffer) {
    const newStage = new GameRequestStage(
      this.connection,
      this.controller,
      this.client,
      data
    );
    this.controller.changeStage(newStage);
  }

  private handlePostAvailablePlayersMessage(data: Buffer) {
    const message = PostClientsMessage.parse(data);
    this.clients = new Map();
    message.payload.clients.forEach((player) =>
      this.clients.set(player.id, player)
    );
    this.renderSelection();
  }

  private handleBroadcastClientStateMessage(data: Buffer) {
    const message = BroadcastClientStateMessage.parse(data);
    if (message.payload.state !== ClientStateEnum.DISCONNECTED) {
      this.clients = this.clients.set(message.payload.id, message.payload);
    } else {
      this.clients.delete(message.payload.id);
    }
    this.renderSelection();
  }

  private async renderSelection() {
    cli.clearDownAndResume();

    const clients = Array.from(this.clients.values()).filter(
      (client) =>
        client.type === ClientTypeEnum.PLAYER &&
        client.state === ClientStateEnum.IN_LOBBY
    );

    if (this.listInfo) {
      cli.log(this.listInfo);
      this.listInfo = undefined;
    }

    cli.log("List of available players:");

    if (clients.length === 0) {
      cli.log("No other players are in lobby.");
      return;
    }

    clients.forEach((client) =>
      cli.log(`id: ${client.id}     username: ${client.username}`)
    );

    const selectedPlayer = await cli.askQuestion(
      "Select id of player you want to play with"
    );
    const rival = this.clients.get(selectedPlayer);
    if (!rival || !clients.includes(rival)) {
      this.listInfo = `Selected id (${selectedPlayer}) does not match any player`;
      this.renderSelection();
    } else {
      const message = RequestGameWithPlayerMessage.serialize({
        challengerId: this.client.id,
        rivalId: rival.id,
      });
      this.connection.write(message);

      const newStage = new WaitForGameStage(
        this.connection,
        this.controller,
        this.client,
        rival.id
      );
      this.controller.changeStage(newStage);
    }
  }
}
