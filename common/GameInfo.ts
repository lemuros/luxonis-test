import { ClientInfo } from "./ClientInfo";

export interface GameInfo {
  word?: string;
  hint?: string;
  tries: number;
  answers: Array<{ answer: string; correct: boolean }>;
  ended: boolean;
  challenger: ClientInfo;
  rival: ClientInfo;
}
