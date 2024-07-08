import net from "net";
import { ClientState } from "./ClientState";
import { MessageTypeEnum, parseMessageType } from "common/messageBase";
import { ErrorMessage } from "common/messages";
import { AbstractStage } from "./stage/AbstractStage";
import { InitializeStage } from "./stage/InitializeStage";
import { IdentificationStage } from "./stage/IdentificationStage";

export class CliPlayerController {
  private stage?: AbstractStage;
  private client = new ClientState();

  constructor(private readonly connection: net.Socket) {
    const stage = new InitializeStage(connection, this);
    this.changeStage(stage);

    connection.on("singleMessage", this.handleConnectionData.bind(this));
    connection.on("close", this.handleConnectionClose.bind(this));
  }

  private handleConnectionData(data: Buffer): void {
    const type = parseMessageType(data);

    switch (type) {
      case MessageTypeEnum.Error: {
        const message = ErrorMessage.parse(data);
        console.log(`Error: ${message.payload.errorMessage}`);
        break;
      }
      case MessageTypeEnum.RequestIdentification: {
        const stage = new IdentificationStage(
          this.connection,
          this.client,
          this
        );
        this.changeStage(stage);
        break;
      }
    }
  }

  private handleConnectionClose() {
    console.log("Connection was closed");
    process.exit(0);
  }

  public changeStage(stageInstance: AbstractStage) {
    if (this.stage) {
      this.connection.off("singleMessage", this.stage.handleConnectionData);
      this.connection.off("connect", this.stage.handleConnected);
      delete this.stage;
    }
    this.stage = stageInstance;
    this.connection.on("singleMessage", this.stage.handleConnectionData);
    this.connection.on("connect", this.stage.handleConnected);
    this.stage.initialize();
  }
}
