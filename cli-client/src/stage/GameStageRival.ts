import net from "net";
import { CliPlayerController } from "../CliPlayerController";
import { AbstractStage } from "./AbstractStage";
import { MessageTypeEnum, parseMessageType } from "common/messageBase";
import {
  PostGameSubjectReadyMessage,
  PostAnswerMessage,
  WrongAnswerMessage,
  BroadcastClientStateMessage,
} from "common/messages";
import { LobbyStage } from "./LobbyStage";
import { ClientState } from "../ClientState";
import { cli } from "../Cli";
import { ClientStateEnum } from "common/ClientInfo";

export class GameStageRival extends AbstractStage {
  private client: ClientState;
  private hint?: string;
  private challengerId?: string;

  constructor(
    connection: net.Socket,
    client: ClientState,
    controller: CliPlayerController,
    challengerId: string
  ) {
    super("Playing as Rival", connection, controller);
    this.client = client;
    this.challengerId = challengerId;
  }

  public initialize(): void {
    cli.log("Waiting for the opponent to enter a word");
  }

  public handleConnectionData(data: Buffer): void {
    const type = parseMessageType(data);

    switch (type) {
      case MessageTypeEnum.PostGameSubjectReady:
        this.handlePostGameSubjectReadyMessage(data);
        break;
      case MessageTypeEnum.WrongAnswer:
        this.handleWrongAnswerMessage(data);
        break;
      case MessageTypeEnum.CorrectAnswer:
        this.handleCorrectAnswerMessage(data);
        break;
      case MessageTypeEnum.BroadcastClientState:
        this.handleBroadcastClientState(data);
        break;
    }
  }

  private handlePostGameSubjectReadyMessage(data: Buffer) {
    const message = PostGameSubjectReadyMessage.parse(data);
    this.hint = message.payload.hint;
    this.askQuestion();
  }

  private handleWrongAnswerMessage(data: Buffer) {
    const message = WrongAnswerMessage.parse(data);

    cli.log("Wrong answer");
    if (message.payload.over) {
      cli.log("Game over");
      this.toLobby();
    } else {
      this.askQuestion();
    }
  }

  private handleCorrectAnswerMessage(data: Buffer) {
    cli.log("Correct!");
    this.toLobby();
  }

  private handleBroadcastClientState(data: Buffer) {
    const message = BroadcastClientStateMessage.parse(data);
    if (
      message.payload.id === this.challengerId &&
      message.payload.state === ClientStateEnum.DISCONNECTED
    ) {
      cli.log("Opponent disconnected");
      this.toLobby();
    }
  }

  private async askQuestion() {
    const answer = await cli.askQuestion(`Riddle me this... ${this.hint}`);
    const message = PostAnswerMessage.serialize({ answer });
    this.connection.write(message);
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
