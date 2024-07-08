import { GameInfo } from "common/GameInfo";
import { Client } from "./Client";

export class Game implements GameInfo {
  public word?: string;
  public hint?: string;
  public tries = 0;
  public answers: Array<{ answer: string; correct: boolean }> = [];
  public ended: boolean = false;
  constructor(
    public readonly challenger: Client,
    public readonly rival: Client
  ) {}

  public serialize(): GameInfo {
    return {
      word: this.word,
      hint: this.hint,
      tries: this.tries,
      answers: this.answers,
      ended: this.ended,
      challenger: this.challenger.serialize(),
      rival: this.rival.serialize(),
    };
  }
}
