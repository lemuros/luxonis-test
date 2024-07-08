import net from "net";
import fs from "fs";
import { WebSocketServer } from "ws";
import { UNIX_SOC_PATH, TCP_PORT, HOST, WS_PORT } from "common/config";
import { Controller } from "./Controller";
import { handleBufferedMessagesTCP } from "common/handleBufferedMessagesTCP";
import { handleBufferedMessagesWSNode } from "common/handleBufferedMessagesWSNode";

if (!process.env.PASSWORD || !process.env.API_KEY || !process.env.XOR_KEY) {
  throw new Error("PASSWORD, API_KEY and XOR_KEY has to be defined");
}

// ensure UNIX_SOC_PATH is available
if (fs.existsSync(UNIX_SOC_PATH)) {
  fs.unlinkSync(UNIX_SOC_PATH);
}

const controller = new Controller();

// create server, register common callbacks
const createServer = (): net.Server => {
  const server = net.createServer();

  server.on("connection", (connection) => {
    handleBufferedMessagesTCP(connection);
    controller.newClient(connection);
  });

  server.on("error", (err) => {
    console.error("Server error:", err);
  });

  return server;
};

// initialize server that communicates over TCP
const tcpServer = createServer();
tcpServer.listen(TCP_PORT, HOST, () => {
  console.log(`Server is listening on ${HOST}:${TCP_PORT}`);
});

// initialize server that communicates over socket file
const unixSocketServer = createServer();
unixSocketServer.listen(UNIX_SOC_PATH, () => {
  console.log(`Server is listening on ${UNIX_SOC_PATH}`);
});

// initialize WS proxy that provides communication between TCP server and web browser
const wsServer = new WebSocketServer({ host: HOST, port: WS_PORT });
wsServer.on("listening", () =>
  console.log(`WS Proxy is listening on ${HOST}:${WS_PORT}`)
);
wsServer.on("error", (error) => console.error(error));
wsServer.on("connection", (webSocket) => {
  const tcpClient = net.createConnection({
    host: HOST,
    port: TCP_PORT,
    noDelay: true,
  });

  handleBufferedMessagesTCP(tcpClient);
  handleBufferedMessagesWSNode(webSocket);

  webSocket.on("singleMessage", (message) => {
    if (message instanceof Buffer) {
      tcpClient.write(message);
    } else {
      throw new Error(`WS proxy can only work with messages that are Buffers`);
    }
  });

  tcpClient.on("singleMessage", (data) => {
    webSocket.send(data);
  });

  webSocket.on("close", () => tcpClient.end());
  tcpClient.on("close", () => webSocket.close());

  tcpClient.on("error", (error) => {
    console.error("TCP Error:", error);
    webSocket.close();
  });

  webSocket.on("error", (error) => {
    console.error("WebSocket Error:", error);
    tcpClient.end();
  });
});
