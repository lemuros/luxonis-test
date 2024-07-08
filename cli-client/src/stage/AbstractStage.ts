import net from "net";
import { CliPlayerController } from "../CliPlayerController";
import { cli } from "../Cli";

export abstract class AbstractStage {
  constructor(
    public readonly stageName: string,
    protected readonly connection: net.Socket,
    protected readonly controller: CliPlayerController
  ) {
    cli.log("");
    cli.log(`---- ${stageName} ----`);
    cli.save();
    this.handleConnectionData = this.handleConnectionData.bind(this);
    this.handleConnected = this.handleConnected.bind(this);
  }

  public initialize() {}
  public handleConnectionData(data: Buffer) {}
  public handleConnected() {}
}
