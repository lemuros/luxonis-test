import { ClientStateEnum, ClientInfo, ClientTypeEnum } from "common/ClientInfo";
import net from "net";

export class Client implements ClientInfo {
  private _username?: string;

  public state: ClientStateEnum = ClientStateEnum.IN_LOBBY;
  public type: ClientTypeEnum = ClientTypeEnum.UNDECIDED;

  constructor(
    public readonly id: string,
    public readonly connection: net.Socket
  ) {}

  get username() {
    return this._username || "Anonymous";
  }

  set username(value: string) {
    this._username = value;
  }

  public serialize(): ClientInfo {
    return {
      id: this.id,
      state: this.state,
      type: this.type,
      username: this.username,
    };
  }
}
