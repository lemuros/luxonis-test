import net from "net";
import { CliPlayerController } from "../CliPlayerController";
import { AbstractStage } from "./AbstractStage";
import { MessageTypeEnum, parseMessageType } from "common/messageBase";
import { cli } from "../Cli";
import { ClientState } from "../ClientState";
import { LobbyStage } from "./LobbyStage";
import { GameStageChallenger } from "./GameStageChallenger";
import {
  AcceptGameRequestMessage,
  BroadcastClientStateMessage,
} from "common/messages";
import { ClientStateEnum } from "common/ClientInfo";

export class WaitForGameStage extends AbstractStage {
  constructor(
    connection: net.Socket,
    controller: CliPlayerController,
    private readonly client: ClientState,
    private readonly rivalId: string
  ) {
    super("Waiting for opponent", connection, controller);
  }

  public handleConnectionData(data: Buffer): void {
    const type = parseMessageType(data);
    switch (type) {
      case MessageTypeEnum.BroadcastClientState:
        this.handleBroadcastClientStateMessage(data);
        break;
      case MessageTypeEnum.RejectGameRequest:
        this.handleRejectGameRequestMessage(data);
        break;
      case MessageTypeEnum.AcceptGameRequest:
        this.handleAcceptGameRequestMessage(data);
        break;
    }
  }

  private handleBroadcastClientStateMessage(data: Buffer) {
    const message = BroadcastClientStateMessage.parse(data);
    if (
      message.payload.id === this.rivalId &&
      message.payload.state !== ClientStateEnum.IN_GAME
    ) {
      cli.log("Opponent disconnected");
      this.toLobby();
    }
  }
  private handleRejectGameRequestMessage(data: Buffer) {
    cli.log(`Game was rejected by opponent.`);
    const newStage = new LobbyStage(
      this.connection,
      this.client,
      this.controller
    );
    this.controller.changeStage(newStage);
  }

  private handleAcceptGameRequestMessage(data: Buffer) {
    cli.log(`Game was accepted by opponent`);
    const message = AcceptGameRequestMessage.parse(data);
    const newStage = new GameStageChallenger(
      this.connection,
      this.client,
      this.controller,
      message.payload.rivalId
    );
    this.controller.changeStage(newStage);
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
