import net from "net";
import { UNIX_SOC_PATH } from "common/config";
import { CliPlayerController } from "../CliPlayerController";
import { AbstractStage } from "./AbstractStage";
import { cli } from "../Cli";

export class InitializeStage extends AbstractStage {
  constructor(connection: net.Socket, controller: CliPlayerController) {
    super("Initialize", connection, controller);
    cli.log(`Connecting to ${UNIX_SOC_PATH}`);
  }

  public handleConnected(): void {
    cli.log(`Connected!`);
  }
}
