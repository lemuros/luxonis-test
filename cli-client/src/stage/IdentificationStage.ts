import net from "net";
import { CliPlayerController } from "../CliPlayerController";
import { cli } from "../Cli";
import {
  IdentificationSuccessMessage,
  PostPasswordMessage,
} from "common/messages";
import { AbstractStage } from "./AbstractStage";
import { MessageTypeEnum, parseMessageType } from "common/messageBase";
import { ClientState } from "../ClientState";
import { LobbyStage } from "./LobbyStage";

export class IdentificationStage extends AbstractStage {
  private client: ClientState;
  constructor(
    connection: net.Socket,
    client: ClientState,
    controller: CliPlayerController
  ) {
    super("Identification", connection, controller);
    this.client = client;
    this.identify();
  }

  public handleConnectionData(data: Buffer): void {
    const type = parseMessageType(data);

    switch (type) {
      case MessageTypeEnum.IdentificationSuccess: {
        const message = IdentificationSuccessMessage.parse(data);
        this.client.id = message.payload.clientId;
        const stage = new LobbyStage(
          this.connection,
          this.client,
          this.controller
        );
        this.controller.changeStage(stage);
      }
    }
  }

  private async identify() {
    const username = await cli.askQuestion("Please enter a username");
    const password = await cli.askQuestion("Please enter a password");
    const message = PostPasswordMessage.serialize({
      password,
      username,
    });
    this.client.username = username;
    this.connection.write(message);
  }
}
