/**
 * Store all possible message types in enum
 * this serves two purposes:
 *  1. maps each type to number (eg. Error = 0)
 *  2. makes the code more readable (since developers don't have to work with numbers)
 */
export enum MessageTypeEnum {
  // server specific messages
  Error,
  RequestIdentification,
  IdentificationSuccess,
  PostClients,
  RequestWordToGuess,
  GuessResult,
  BroadcastClientState,
  BroadcastGameState,
  PostGameState,

  // client specific messages
  PostPassword,
  PostApiKey,
  RequestClientList,
  PostWordToGuess,
  GiveUp,
  PostGameSubject,
  PostGameSubjectReady,
  WrongAnswer,
  CorrectAnswer,
  RequestGameState,

  // common messages
  RequestGameWithPlayer,
  AcceptGameRequest,
  RejectGameRequest,
  GameAccepted,
  PostAnswer,
  PostHint,
}

function xorBuffer(buffer: Buffer): Buffer {
  const key = process.env.XOR_KEY ?? import.meta.env.VITE_XOR_KEY;
  const keyBuffer = Buffer.from(key, "utf8");
  const keyLength = keyBuffer.length;
  const result = Buffer.alloc(buffer.length);

  for (let i = 0; i < buffer.length; i++) {
    result[i] = buffer[i] ^ keyBuffer[i % keyLength];
  }

  return result;
}

/**
 * Creates binary message
 * Message structure is:
 *  - first byte - type of message (see MessageTypeEnum)
 *  - next two bytes - length of message payload
 *  - payload itself
 */
function createMessage<Payload extends object>(
  type: MessageTypeEnum,
  jsonObj: Payload
): Buffer {
  const payloadBuffer = Buffer.from(JSON.stringify(jsonObj), "utf-8");
  const payload = xorBuffer(payloadBuffer);
  const payloadLength = payload.length;
  const buffer = Buffer.alloc(3 + payloadLength);

  buffer.writeUInt8(type, 0);
  buffer.writeUInt16BE(payloadLength, 1);
  payload.copy(buffer, 3);

  return buffer;
}

/** Parses binary message into object */
export function parseMessage<Payload extends object>(
  buffer: Buffer
): {
  type: MessageTypeEnum;
  payload: Payload;
} {
  const type = buffer.readUInt8(0);
  const payloadLength = buffer.readUInt16BE(1);

  const payload = xorBuffer(buffer.subarray(3, 3 + payloadLength));
  const jsonObj = JSON.parse(payload.toString("utf-8"));

  return { type, payload: jsonObj };
}

export function parseMessageType(buffer: Buffer): MessageTypeEnum {
  return buffer.readUInt8(0);
}

/**
 * Factory to reduce boilerplate code
 * Creates class for provided message type and payload interface
 */
export function messageClassFactory<PayloadType extends object>(
  type: MessageTypeEnum
) {
  return class MessageClass {
    public readonly type = type;
    constructor(public readonly payload: PayloadType) {}

    public serialize() {
      return MessageClass.serialize(this.payload);
    }

    public static serialize(payload: PayloadType) {
      return createMessage(type, payload);
    }

    public static parse(data: Buffer) {
      const parsed = parseMessage(data);
      if (parsed.type !== type) {
        throw new Error(`Cannot parse message, type mismatch.`);
      }
      return new MessageClass(parsed.payload as PayloadType);
    }
  };
}
