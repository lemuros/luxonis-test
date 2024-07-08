import net from "net";
import { CliPlayerController } from "../CliPlayerController";
import { ErrorMessage } from "common/messages";
import { AbstractStage } from "./AbstractStage";
import { cli } from "../Cli";

export class ErrorStage extends AbstractStage {
  constructor(
    connection: net.Socket,
    controller: CliPlayerController,
    errorData: Buffer
  ) {
    super("Error", connection, controller);

    const message = ErrorMessage.parse(errorData);
    cli.log(`Error: ${message.payload.errorMessage}`);
  }
}
