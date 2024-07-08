import { blobToBuffer } from "./blobToBuffer";

/**
 * Handle incoming WS data by buffering and emitting complete messages.
 * This works with web library WebSocket
 */
export const handleBufferedMessagesWSWeb = (connection: WebSocket) => {
  let dataBuffer = Buffer.alloc(0);

  connection.addEventListener("message", async (event) => {
    const data = await blobToBuffer(event.data);
    dataBuffer = Buffer.concat([dataBuffer, data]);

    while (dataBuffer.length >= 3) {
      const payloadLength = dataBuffer.readUInt16BE(1);
      const messageLength = 3 + payloadLength;

      if (dataBuffer.length < messageLength) {
        // Wait for more data
        break;
      }

      const event = new CustomEvent("singleMessage", {
        detail: dataBuffer.slice(0, messageLength),
      });
      connection.dispatchEvent(event);
      dataBuffer = dataBuffer.slice(messageLength);
    }
  });
};

declare global {
  interface WebSocketEventMap {
    singleMessage: CustomEvent<Buffer>;
  }
}
