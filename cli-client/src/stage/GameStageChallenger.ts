import net from "net";
import { CliPlayerController } from "../CliPlayerController";
import { AbstractStage } from "./AbstractStage";
import {
  PostGameSubjectMessage,
  WrongAnswerMessage,
  BroadcastClientStateMessage,
} from "common/messages";
import { MessageTypeEnum, parseMessageType } from "common/messageBase";
import { ClientState } from "../ClientState";
import { LobbyStage } from "./LobbyStage";
import { cli } from "../Cli";
import { ClientStateEnum } from "common/ClientInfo";

export class GameStageChallenger extends AbstractStage {
  private readonly client: ClientState;
  private readonly rivalId: string;

  constructor(
    connection: net.Socket,
    client: ClientState,
    controller: CliPlayerController,
    rivalId: string
  ) {
    super("Playing as Challenger", connection, controller);
    this.client = client;
    this.rivalId = rivalId;
    cli.log(`Let the game begin...`);

    this.enterWord();
  }

  private async enterWord() {
    const word = await cli.askQuestion("Enter a word to guess");
    const hint = await cli.askQuestion("Enter a hint");

    const message = PostGameSubjectMessage.serialize({
      word,
      hint,
    });

    this.connection.write(message);
  }

  public handleConnectionData(data: Buffer): void {
    const type = parseMessageType(data);

    switch (type) {
      case MessageTypeEnum.BroadcastClientState:
        this.handleBroadcastClientStateMessage(data);
        break;
      case MessageTypeEnum.WrongAnswer:
        this.handleWrongAnswerMessage(data);
        break;
      case MessageTypeEnum.CorrectAnswer:
        this.handleCorrectAnswerMessage(data);
        break;
    }
  }

  private handleBroadcastClientStateMessage(data: Buffer) {
    const message = BroadcastClientStateMessage.parse(data);
    if (
      message.payload.id === this.rivalId &&
      message.payload.state === ClientStateEnum.DISCONNECTED
    ) {
      cli.log("Opponent disconnected");
      this.toLobby();
    }
  }

  private handleWrongAnswerMessage(data: Buffer) {
    const message = WrongAnswerMessage.parse(data);
    cli.log(`Your opponent guessed: ${message.payload.answer}`);

    if (message.payload.over) {
      cli.log("Game over");
      this.toLobby();
    }
  }

  private handleCorrectAnswerMessage(data: Buffer) {
    cli.log(`Your opponent guessed correctly!`);
    this.toLobby();
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
