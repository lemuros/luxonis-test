import net from "net";

/** Handle incoming TCP data by buffering and emitting complete messages.*/
export const handleBufferedMessagesTCP = (connection: net.Socket) => {
  let dataBuffer = Buffer.alloc(0);

  connection.on("data", (data) => {
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
