import net from "net";
import { CliPlayerController } from "../CliPlayerController";
import { AbstractStage } from "./AbstractStage";
import { MessageTypeEnum, parseMessageType } from "common/messageBase";
import {
  AcceptGameRequestMessage,
  BroadcastClientStateMessage,
  RejectGameRequestMessage,
  RequestGameWithPlayerMessage,
} from "common/messages";
import { cli } from "../Cli";
import { ClientState } from "../ClientState";
import { GameStageRival } from "./GameStageRival";
import { LobbyStage } from "./LobbyStage";
import { ClientStateEnum } from "common/ClientInfo";

export class GameRequestStage extends AbstractStage {
  private readonly challengerId: string;

  constructor(
    connection: net.Socket,
    controller: CliPlayerController,
    private readonly client: ClientState,
    requestData: Buffer
  ) {
    super("Game Request", connection, controller);

    const message = RequestGameWithPlayerMessage.parse(requestData);
    this.challengerId = message.payload.challengerId;
  }

  public initialize(): void {
    this.renderPrompt();
  }

  public handleConnectionData(data: Buffer): void {
    const type = parseMessageType(data);
    switch (type) {
      case MessageTypeEnum.BroadcastClientState:
        this.handleBroadcastClientStateMessage(data);
        break;
    }
  }

  private handleBroadcastClientStateMessage(data: Buffer) {
    const message = BroadcastClientStateMessage.parse(data);
    if (
      message.payload.state === ClientStateEnum.DISCONNECTED &&
      message.payload.id === this.challengerId
    ) {
      cli.log("Challenger was disconnected");
      this.toLobby();
    }
  }

  private async renderPrompt() {
    const selection = await cli.askQuestion(
      `Accept game with ${this.challengerId} (Y/N)?`
    );

    const messagePayload = {
      rivalId: this.client.id,
      challengerId: this.challengerId,
    };

    if (selection === "Y" || selection === "y") {
      const response = AcceptGameRequestMessage.serialize(messagePayload);
      this.connection.write(response);
      cli.log("Game accepted. Let the game begin...");
      const newStage = new GameStageRival(
        this.connection,
        this.client,
        this.controller,
        messagePayload.challengerId
      );
      this.controller.changeStage(newStage);
    } else {
      const response = RejectGameRequestMessage.serialize(messagePayload);
      this.connection.write(response);
      this.toLobby();
    }
  }

  private toLobby() {
    const newStage = new LobbyStage(
      this.connection,
      this.client,
      this.controller
    );
    this.controller.changeStage(newStage);
  }
}
