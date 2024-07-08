export class ClientState {
  private _username?: string;
  private _id?: string;
  public opponentId: string | undefined = undefined;

  get id() {
    if (!this._id) {
      throw new Error("Client does not have ID yet");
    }
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  get username() {
    return this._username || "Anonymous";
  }

  set username(value: string) {
    this._username = value;
  }
}
