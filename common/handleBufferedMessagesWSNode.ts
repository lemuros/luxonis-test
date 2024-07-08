import ws from "ws";

/**
 * Handle incoming WS data by buffering and emitting complete messages.
 * This works with node library ws
 */
export const handleBufferedMessagesWSNode = (connection: ws) => {
  let dataBuffer = Buffer.alloc(0);

  connection.addEventListener("message", (event) => {
    const { data } = event;
    if (!(data instanceof Buffer)) {
      throw new Error(`WS can only work with messages that are Buffers`);
    }
    dataBuffer = Buffer.concat([dataBuffer, data]);

    while (dataBuffer.length >= 3) {
      const payloadLength = dataBuffer.readUInt16BE(1);
      const messageLength = 3 + payloadLength;

      if (dataBuffer.length < messageLength) {
        // Wait for more data
        break;
      }

      const completeMessage = dataBuffer.slice(0, messageLength);
      connection.emit("singleMessage", completeMessage);
      dataBuffer = dataBuffer.slice(messageLength);
    }
  });
};
